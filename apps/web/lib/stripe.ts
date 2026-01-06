import "server-only";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn("STRIPE_SECRET_KEY is missing in environment variables. Stripe functionality will be unavailable.");
}

export const stripe = new Stripe(stripeSecretKey || "", {
    apiVersion: "2025-02-24.acacia" as any,
    typescript: true,
});
