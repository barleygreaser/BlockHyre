import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia", // Use latest API version
});

// Initialize Supabase Admin (Service Role needed to update user table securely)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
                throw new Error("Database Sync Failed");
            }
        }

        // 5. Create Account Link (Onboarding)
        const origin = request.headers.get("origin") || "http://localhost:3000";
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/profile?stripe_refresh=true`,
            return_url: `${origin}/profile?stripe_return=true`,
            type: "account_onboarding",
        });

        return NextResponse.json({ url: accountLink.url });

    } catch (error: any) {
        console.error("Stripe Connect Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
