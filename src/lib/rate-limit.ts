import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { headers } from "next/headers";

// Define different rate limiters for different purposes
export const rateLimiters = {
  // Checkout API: e.g., 5 requests per minute per IP
  checkout: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/checkout",
  }),

  // Verify API: e.g., 10 requests per minute per IP
  verify: new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/verify",
  }),
};

/**
 * Helper to get the client IP from Next.js headers
 */
export async function getClientIp(): Promise<string> {
  const reqHeaders = await headers();
  // Try to get the IP from x-forwarded-for, fallback to a default if in local dev
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const realIp = reqHeaders.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }

  // Fallback (usually for local development)
  return "127.0.0.1";
}
