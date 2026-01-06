import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { calculateRentalPrice } from "@/lib/pricing";

// Initialize Supabase Admin for secure listing verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing. Checkout will fail.");
}

// Helper to get admin client
function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: Request) {
    try {
        const { cartItems } = await request.json();

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 1. Authenticate Renter
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const supabaseAdmin = getSupabaseAdmin();
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
        }

        // 2. Fetch Listing Data and Owner Stripe Accounts
        // For this MVP, we handle one owner per checkout to keep destination charges simple.
        // If there are multiple owners, we would normally use Separate Charges and Transfers.
        // We'll group items by listing ID to verify prices.

        const listingIds = cartItems.map((item: any) => item.id);
        const { data: listings, error: listingError } = await supabaseAdmin
            .from("listings")
            .select("id, daily_price, owner_id, categories(risk_tier), users:owner_id(stripe_account_id)")
            .in("id", listingIds);

        if (listingError || !listings) {
            console.error("Listing Fetch Error:", listingError);
            throw new Error("Failed to verify listings");
        }

        // 3. Prepare Line Items and verify prices server-side
        let totalAmount = 0;
        let totalPlatformFee = 0;
        const lineItems = [];

        // For simplicity in this step, we take the first owner's stripe account for destination charges
        // Note: Real production apps with multi-seller carts use a different flow.
        const firstOwnerStripeId = (listings[0] as any).users?.stripe_account_id;

        if (!firstOwnerStripeId) {
            throw new Error("Owner has not connected their Stripe account");
        }

        if (!firstOwnerStripeId.startsWith("acct_")) {
            console.error(`Invalid Stripe Account ID found: ${firstOwnerStripeId}`);
            throw new Error("Owner has an invalid Stripe configuration. Please contact support.");
        }

        for (const item of cartItems) {
            const dbListing = listings.find(l => l.id === item.id) as any;
            if (!dbListing) continue;

            const riskTier = dbListing.categories?.risk_tier || 1;

            // Re-calculate price on server
            const { subtotal, peaceFundTotal, finalTotal } = calculateRentalPrice(
                dbListing.daily_price,
                item.days,
                riskTier as 1 | 2 | 3
            );

            // Add Security Deposit if Tier 3 (or if exists)
            const deposit = item.price.deposit || 0;
            const itemTotal = finalTotal + deposit;

            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.title,
                        description: `Rental for ${item.days} days (Includes Peace Fund & Deposit)`,
                    },
                    unit_amount: Math.round(itemTotal * 100), // Convert to cents
                },
                quantity: 1,
            });

            totalAmount += itemTotal;
            // Platform Fee = Peace Fund + Platform Commission (let's say we take the peace fund as our fee)
            totalPlatformFee += peaceFundTotal;
        }

        // 4. Create Stripe Checkout Session
        const origin = request.headers.get("origin") || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout`,
            customer_email: user.email,
            client_reference_id: user.id,
            metadata: {
                renter_id: user.id,
                cart_items: JSON.stringify(cartItems.map((i: any) => ({
                    listing_id: i.id,
                    days: i.days,
                    start_date: i.dates.from,
                    end_date: i.dates.to
                })))
            },
            payment_intent_data: {
                application_fee_amount: Math.round(totalPlatformFee * 100),
                transfer_data: {
                    destination: firstOwnerStripeId,
                },
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Checkout Session Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
