import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        // 1. Extract metadata
        const metadata = session.metadata;
        if (!metadata || !metadata.cart_items) {
            console.error("No cart items found in metadata");
            return NextResponse.json({ error: "No metadata" }, { status: 400 });
        }

        const renterId = metadata.renter_id;
        const cartItems = JSON.parse(metadata.cart_items);

        try {
            // 2. Insert Rental Records for each item
            for (const item of cartItems) {
                // Fetch listing details for snapshots
                const { data: listing } = await supabaseAdmin
                    .from("listings")
                    .select("daily_price, deposit_amount, categories(risk_tier)")
                    .eq("id", item.listing_id)
                    .single() as any;

                if (!listing) continue;

                const riskTier = listing.categories?.risk_tier || 1;

                const { error: rentalError } = await supabaseAdmin
                    .from("rentals")
                    .insert({
                        listing_id: item.listing_id,
                        renter_id: renterId,
                        start_date: item.start_date,
                        end_date: item.end_date,
                        total_days: item.days,
                        status: 'approved', // ✅ Changed to 'approved' (was 'confirmed')
                        rental_fee: listing.daily_price * item.days,
                        peace_fund_fee: riskTier * item.days,
                        total_paid: session.amount_total ? session.amount_total / 100 : 0,
                        daily_price_snapshot: listing.daily_price,
                        risk_fee_snapshot: riskTier
                    });

                if (rentalError) {
                    console.error("Failed to insert rental:", rentalError);
                    throw rentalError;
                }

                // 3. Mark the listing as potentially unavailable or just notify (workflow choice)
                // For now, we trust the database rental check
            }

            console.log(`Successfully processed ${cartItems.length} rentals for session ${session.id}`);

        } catch (error) {
            console.error("Error processing webhook database updates:", error);
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
