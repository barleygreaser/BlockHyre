import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: Request) {
    try {
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

        const { data: profile } = await supabaseAdmin
            .from("users")
            .select("stripe_account_id, stripe_connected")
            .eq("id", user.id)
            .single();

        if (!profile?.stripe_account_id) {
            return NextResponse.json({
                connected: false,
                balance: null,
                payouts: [],
                dashboardUrl: null,
            });
        }

        const accountId = profile.stripe_account_id;

        // Fetch balance, payouts, and create login link in parallel
        const [balance, payouts, loginLink] = await Promise.all([
            stripe.balance.retrieve({ stripeAccount: accountId }).catch(() => null),
            stripe.payouts.list(
                { limit: 20 },
                { stripeAccount: accountId }
            ).catch(() => ({ data: [] })),
            stripe.accounts.createLoginLink(accountId).catch(() => null),
        ]);

        const availableUsd = balance?.available?.find(b => b.currency === "usd");
        const pendingUsd = balance?.pending?.find(b => b.currency === "usd");

        const formattedPayouts = payouts.data.map(payout => ({
            id: payout.id,
            amount: payout.amount / 100,
            currency: payout.currency,
            status: payout.status,
            arrivalDate: payout.arrival_date
                ? new Date(payout.arrival_date * 1000).toISOString()
                : null,
            createdAt: new Date(payout.created * 1000).toISOString(),
            method: payout.method,
            bankLast4: (payout.destination as any)?.last4 || null,
            description: payout.description,
        }));

        return NextResponse.json({
            connected: true,
            balance: {
                available: availableUsd ? availableUsd.amount / 100 : 0,
                pending: pendingUsd ? pendingUsd.amount / 100 : 0,
            },
            payouts: formattedPayouts,
            dashboardUrl: loginLink?.url || null,
        });

    } catch (error: unknown) {
        console.error("Stripe Transactions API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction data." },
            { status: 500 }
        );
    }
}
