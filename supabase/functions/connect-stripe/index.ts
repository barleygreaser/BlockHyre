import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Create Supabase Client
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        // 2. Auth Check
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error("User not authenticated");
        }

        // 3. Get Request Body (expecting redirect URLs)
        const { returnUrl, refreshUrl } = await req.json();

        if (!returnUrl || !refreshUrl) {
            throw new Error("Missing returnUrl or refreshUrl");
        }

        // 4. Check for existing Stripe Account ID
        const { data: profile, error: profileError } = await supabaseClient
            .from("users")
            .select("stripe_account_id, email")
            .eq("id", user.id)
            .single();

        if (profileError) {
            throw profileError;
        }

        let stripeAccountId = profile.stripe_account_id;

        // 5. Create Stripe Account if needed
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            stripeAccountId = account.id;

            // Save to DB
            const { error: updateError } = await supabaseClient
                .from("users")
                .update({ stripe_account_id: stripeAccountId })
                .eq("id", user.id);

            if (updateError) {
                throw updateError;
            }
        }

        // 6. Create Account Link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: "account_onboarding",
        });

        return new Response(JSON.stringify({ url: accountLink.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
