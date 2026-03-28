import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import BookingRequestedEmail from "../../../../emails/booking-requested";
import BookingApprovedEmail from "../../../../emails/booking-approved";

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

        // 0. Idempotency Check: Check if we've already processed this session
        const { data: existingRentals } = await supabaseAdmin
            .from("rentals")
            .select("id")
            .eq("stripe_session_id", session.id)
            .limit(1);

        if (existingRentals && existingRentals.length > 0) {
            console.log(`Webhook already processed for session ${session.id}. Skipping.`);
            return NextResponse.json({ received: true, already_processed: true });
        }

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
                // Fetch listing, tool name, owner details, and renter details for snapshots and emails
                const { data: listing } = await supabaseAdmin
                    .from("listings")
                    .select(`
                        daily_price, 
                        deposit_amount, 
                        categories(risk_tier),
                        owner_id,
                        tools (name),
                        owner:owner_id(email, full_name)
                    `)
                    .eq("id", item.listing_id)
                    .single() as any;

                const { data: renter } = await supabaseAdmin
                    .from("users")
                    .select("email, full_name")
                    .eq("id", renterId)
                    .single() as any;

                if (!listing || !renter) continue;

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
                        risk_fee_snapshot: riskTier,
                        stripe_session_id: session.id,
                        stripe_payment_intent_id: session.payment_intent as string,
                        deposit_amount_snapshot: listing.deposit_amount || 0
                    });

                if (rentalError) {
                    console.error("Failed to insert rental:", rentalError);
                    throw rentalError;
                }

                // 3. Send Notifications via Resend
                const startDateStr = new Date(item.start_date).toLocaleDateString();
                const endDateStr = new Date(item.end_date).toLocaleDateString();
                const toolName = listing.tools?.name || "a tool";
                
                // Calculate owner earnings (gross - platform fee)
                const { data: platformSettings } = await supabaseAdmin.from("platform_settings").select("seller_fee_percent").single() as any;
                const sellerFeeObj = platformSettings?.seller_fee_percent || 15;
                const platformFee = (listing.daily_price * item.days) * (sellerFeeObj / 100);
                const netEarnings = (listing.daily_price * item.days) - platformFee;

                // Send to Owner: Booking Requested (Pickup Coordination)
                if (listing.owner?.email) {
                    await sendEmail({
                        to: listing.owner.email,
                        subject: `New Rental Request for ${toolName}`,
                        react: BookingRequestedEmail({
                            renterName: renter.full_name || "A neighbor",
                            toolName: toolName,
                            startDate: startDateStr,
                            endDate: endDateStr,
                            totalEarnings: `$${netEarnings.toFixed(2)}`,
                            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?role=owner`
                        })
                    });
                }

                // Send to Renter: Booking Approved
                if (renter.email) {
                    await sendEmail({
                        to: renter.email,
                        subject: `Your rental for ${toolName} was approved!`,
                        react: BookingApprovedEmail({
                            ownerName: listing.owner?.full_name || "The owner",
                            toolName: toolName,
                            startDate: startDateStr,
                            endDate: endDateStr,
                            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/my-rentals`
                        })
                    });
                }

            }

            console.log(`Successfully processed ${cartItems.length} rentals for session ${session.id}`);

        } catch (error) {
            console.error("Error processing webhook database updates:", error);
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
