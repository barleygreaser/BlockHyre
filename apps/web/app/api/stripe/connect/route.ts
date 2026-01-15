import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Initialize Supabase Admin (Service Role needed to update user table securely)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials missing. Connect will fail.");
}

function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: Request) {
    try {
        // 1. Authenticate User (Get ID from header or session)
        // Note: In Next.js App Router, headers() are available, but for now we trust the client sends auth?
        // BETTER: Use supabase auth helper to get user from session cookie.

        // For this MVP, we will parse the Authorization header "Bearer <token>"
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

        // 2. Check if user already has a stripe_account_id
        const { data: profile } = await supabaseAdmin
            .from("users")
            .select("stripe_account_id")
            .eq("id", user.id)
            .single();

        let accountId = profile?.stripe_account_id;

        // 3. Create Stripe Express Account if not exists
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: user.email,
                business_type: "individual",
                business_profile: {
                    url: "https://blockhyre.com", // Pre-fills the website field
                    mcc: "7394", // Equipment Rental MCC code: skips the industry question
                },
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    supabase_user_id: user.id
                }
            });
            accountId = account.id;

            // 4. Save to Supabase (COHESION REQUIREMENT)
            const { error: updateError } = await supabaseAdmin
                .from("users")
                .update({
                    stripe_account_id: accountId,
                    stripe_connected: false // Will be updated via webhook later potentially
                })
                .eq("id", user.id);

            if (updateError) {
                console.error("Failed to save stripe account ID:", updateError);
                // Security: Don't leak DB error
                return NextResponse.json({ error: "Failed to update account status." }, { status: 500 });
            }
        }

        // 5. Create Account Link (Onboarding)
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

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/profile?stripe_refresh=true`,
            return_url: `${origin}/profile?stripe_return=true`,
            type: "account_onboarding",
        });

        return NextResponse.json({ url: accountLink.url });

    } catch (error: any) { // Keep any for catch block
        console.error("Stripe Connect Error:", error);
        // Security: Generic error message
        return NextResponse.json({ error: "Failed to initialize payment setup." }, { status: 500 });
    }
}
