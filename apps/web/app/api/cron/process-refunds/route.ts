import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        // 1. Fetch pending refund jobs
        const { data: jobs, error } = await supabaseAdmin
            .from("refund_jobs")
            .select("*")
            .eq("status", "pending")
            .limit(10); // Process in batches

        if (error) {
            console.error("Error fetching refund jobs:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!jobs || jobs.length === 0) {
            return NextResponse.json({ message: "No pending refunds" });
        }

        const results = [];

        // 2. Process each job
        for (const job of jobs) {
            try {
                // Determine refund amount.
                // job.amount comes from rentals.total_paid which is in main currency unit (e.g. dollars).
                // Stripe refund amount is in smallest currency unit (cents).

                const refundParams: Stripe.RefundCreateParams = {
                    payment_intent: job.payment_intent_id,
                };

                if (job.amount) {
                     refundParams.amount = Math.round(job.amount * 100);
                }

                const refund = await stripe.refunds.create(refundParams);

                // Update job status
                await supabaseAdmin
                    .from("refund_jobs")
                    .update({
                        status: "processed",
                        processed_at: new Date().toISOString()
                    })
                    .eq("id", job.id);

                results.push({ id: job.id, status: "success", refund_id: refund.id });

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                console.error(`Refund failed for job ${job.id}:`, err);

                await supabaseAdmin
                    .from("refund_jobs")
                    .update({
                        status: "failed",
                        error_message: errorMessage
                    })
                    .eq("id", job.id);

                results.push({ id: job.id, status: "failed", error: errorMessage });
            }
        }

        return NextResponse.json({ results });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error processing refunds:", error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
