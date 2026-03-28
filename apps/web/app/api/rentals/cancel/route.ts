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

        // 2. Fetch Rental to verify ownership/renter
        const { data: rental, error: fetchError } = await supabaseAdmin
            .from("rentals")
            .select("*, listing:listings (owner_id)")
            .eq("id", rentalId)
            .single() as any;

        if (fetchError || !rental) {
            return NextResponse.json({ error: "Rental not found" }, { status: 404 });
        }

        const isOwner = rental.listing.owner_id === user.id;
        const isRenter = rental.renter_id === user.id;

        if (!isOwner && !isRenter) {
            return NextResponse.json({ error: "Forbidden: You are not authorized to cancel this rental." }, { status: 403 });
        }

        if (rental.status !== "pending" && rental.status !== "approved") {
            return NextResponse.json({ error: "Rental cannot be cancelled in its current status." }, { status: 400 });
        }

        // 3. Process Full Stripe Refund
        if (rental.stripe_payment_intent_id) {
            try {
                // Issue a full refund, and reverse the associated transfer to the owner
                await stripe.refunds.create({
                    payment_intent: rental.stripe_payment_intent_id,
                    reverse_transfer: true,
                    refund_application_fee: true, // We give up our platform fee and deposit too.
                });
                console.log(`Successfully cancelled and refunded payment intent for rental ${rentalId}`);
            } catch (stripeError: any) {
                console.error("Stripe Cancel Refund Error:", stripeError);
                return NextResponse.json({ error: "Failed to process cancellation refund." }, { status: 500 });
            }
        }

        // 4. Update Database
        const { error: updateError } = await supabaseAdmin
            .from("rentals")
            .update({ 
                status: "cancelled",
                cancelled_at: new Date().toISOString()
            })
            .eq("id", rentalId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, message: "Rental cancelled and fully refunded." });

    } catch (error: any) {
        console.error("Cancel Rental Error:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
