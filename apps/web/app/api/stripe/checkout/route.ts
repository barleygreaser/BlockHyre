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

// Define Cart Item Interface
interface CartItem {
    id: string;
    title: string;
    days: number;
    dates: {
        from: string;
        to: string;
    };
    price: {
        day: number;
        deposit?: number;
    };
}

// Define Listing Interface partial
interface Listing {
    id: string;
    daily_price: number;
    deposit_amount: number;
    owner_id: string;
    categories: {
        risk_tier: number;
    } | null;
    users: {
        stripe_account_id: string | null;
    } | null;
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

        const listingIds = cartItems.map((item: CartItem) => item.id);
        const { data: listings, error: listingError } = await supabaseAdmin
            .from("listings")
            .select("id, daily_price, deposit_amount, owner_id, categories(risk_tier), users:owner_id(stripe_account_id)")
            .in("id", listingIds)
            .returns<Listing[]>(); // Explicitly type the return

        if (listingError || !listings) {
            console.error("Listing Fetch Error:", listingError);
            // Security: Don't reveal database error details
            return NextResponse.json({ error: "Failed to verify listings. Please try again." }, { status: 500 });
        }

        // Security: Ensure all items belong to the same owner (MVP Limitation)
        // This prevents funds from being routed to the wrong owner if a mixed cart is submitted.
        const uniqueOwnerIds = new Set(listings.map(l => l.owner_id));
        if (uniqueOwnerIds.size > 1) {
            return NextResponse.json({ error: "Checkout cannot contain items from multiple owners. Please purchase them separately." }, { status: 400 });
        }

        // 3. Prepare Line Items and verify prices server-side
        // Removed unused totalAmount
        let totalPlatformFee = 0;
        const lineItems = [];

        // For simplicity in this step, we take the first owner's stripe account for destination charges
        // Note: Real production apps with multi-seller carts use a different flow.
        const firstOwnerStripeId = listings[0]?.users?.stripe_account_id;

        if (!firstOwnerStripeId) {
            // Security: Notify user but don't leak owner details
            return NextResponse.json({ error: "One or more items are currently unavailable for checkout." }, { status: 400 });
        }

        if (!firstOwnerStripeId.startsWith("acct_")) {
            console.error(`Invalid Stripe Account ID found: ${firstOwnerStripeId}`);
             // Security: Notify user generic error
            return NextResponse.json({ error: "Configuration error with listing owner. Please contact support." }, { status: 500 });
        }

        for (const item of cartItems) {
            const dbListing = listings.find(l => l.id === item.id);
            if (!dbListing) continue;

            const riskTier = dbListing.categories?.risk_tier || 1;

            // Re-calculate price on server
            // Removed unused subtotal
            const { peaceFundTotal, finalTotal } = calculateRentalPrice(
                dbListing.daily_price,
                item.days,
                riskTier as 1 | 2 | 3
            );

            // Add Security Deposit if Tier 3 (or if exists)
            // Security: Use server-side deposit amount instead of client-provided amount
            const deposit = dbListing.deposit_amount || 0;
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

            // totalAmount += itemTotal; // Unused
            // Platform Fee = Peace Fund + Platform Commission (let's say we take the peace fund as our fee)
            totalPlatformFee += peaceFundTotal;
        }

        // 4. Create Stripe Checkout Session
        // Security: Prevent Open Redirect by validating origin or using trusted env var
        const getOrigin = () => {
            const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
            if (configuredOrigin) return configuredOrigin;

            if (process.env.NODE_ENV === 'development') {
                return request.headers.get("origin") || "http://localhost:3000";
            }

            // Support Vercel Preview URLs
            if (process.env.VERCEL_URL) {
                return `https://${process.env.VERCEL_URL}`;
            }

            // Fallback for production if env var missing
            return "https://blockhyre.com";
        };

        const origin = getOrigin();

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
                cart_items: JSON.stringify(cartItems.map((i: CartItem) => ({
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

    } catch (error: unknown) {
        console.error("Checkout Session Error:", error);
        // Security: Generic error message to prevent information leakage
        return NextResponse.json({ error: "An unexpected error occurred during checkout initialization." }, { status: 500 });
    }
}
