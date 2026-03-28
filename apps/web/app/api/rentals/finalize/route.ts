import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const { rentalId } = await request.json();

        if (!rentalId) {
            return NextResponse.json({ error: "Rental ID is required" }, { status: 400 });
        }

        // 1. Authenticate user
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
        }

        // 2. Fetch Rental and verify ownership
        const { data: rental, error: fetchError } = await supabaseAdmin
            .from("rentals")
            .select("*, listing:listings (owner_id)")
            .eq("id", rentalId)
            .single() as any;

        if (fetchError || !rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        if (rental.listing.owner_id !== user.id) {
            return NextResponse.json({ error: "Forbidden: Only the owner can finalize a rental." }, { status: 403 });
        }

        if (rental.status !== "returned") {
            return NextResponse.json({ error: "Rental must be in 'returned' status to be finalized." }, { status: 400 });
        }

        // 3. Process Stripe partial refund (Releasing the Deposit)
        if (rental.stripe_payment_intent_id && rental.deposit_amount_snapshot > 0) {
            try {
                // Issue a refund specifically for the deposit amount back to the renter's payment method
                await stripe.refunds.create({
                    payment_intent: rental.stripe_payment_intent_id,
                    amount: Math.round(rental.deposit_amount_snapshot * 100),
                    // Note: We don't reverse the transfer! The deposit was kept in our application fee. 
                    // This refund comes out of the platform's balance.
                });
                console.log(`Successfully refunded deposit of $${rental.deposit_amount_snapshot} for rental ${rentalId}`);
            } catch (stripeError: any) {
                console.error("Stripe Refund Error:", stripeError);
                return NextResponse.json({ error: "Failed to process deposit refund. Please contact support." }, { status: 500 });
            }
        }

        // 4. Update the Database
        const { error: updateError } = await supabaseAdmin
            .from("rentals")
            .update({ status: "completed" })
            .eq("id", rentalId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, message: "Rental finalized and deposit released." });

    } catch (error: any) {
        console.error("Finalize Rental Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
