import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing from environment variables.");
}

/**
 * Singleton Stripe client with optimized settings for reliability:
 * - maxNetworkRetries: 3 (Auto-retry transient connection failures)
 * - timeout: 30000ms (30 second timeout to prevent premature cuts on slow connections)
 * - apiVersion: Consistent versioning
 */
export const stripe = new Stripe(stripeKey || "", {
  apiVersion: "2024-04-10" as any,
  maxNetworkRetries: 3,
  timeout: 60000, // 60 seconds (extended for slow connections)
});

export default stripe;
