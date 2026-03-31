import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderStatus } from "@/lib/actions/orders";
import { createAdminClient } from "@/lib/supabase/admin";

// In-process deduplication for the verify endpoint — prevents duplicate email/notification
// firing when the success page is refreshed multiple times before webhook processes.
const verifiedReferences = new Set<string>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const reference = searchParams.get("reference");
  const provider = searchParams.get("provider");

  // Derive the dedup key from whichever identifier is present
  const dedupKey = (provider === "stripe" ? sessionId : reference) ?? "";

  try {
    // --- Stripe Verification ---
    if (provider === "stripe" && sessionId) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return NextResponse.json({ verified: false, error: "Stripe not configured" }, { status: 503 });
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2024-04-10" as any });
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        // Only run updateOrderStatus if not already confirmed in-memory OR in DB
        const alreadyInMemory = verifiedReferences.has(dedupKey);

        if (!alreadyInMemory) {
          // Check DB to see if already paid (handles server restarts)
          const adminClient = createAdminClient();
          const { data: existingOrder } = await adminClient
            .from("orders")
            .select("status")
            .eq("payment_reference", sessionId)
            .eq("payment_provider", "stripe")
            .single();

          const alreadyPaid = ["paid", "processing", "shipped", "delivered"].includes(existingOrder?.status ?? "");

          if (!alreadyPaid) {
            await updateOrderStatus(sessionId, "stripe", "paid");
          }
          verifiedReferences.add(dedupKey);
        }

        return NextResponse.json({
          verified: true,
          status: "paid",
          provider: "stripe",
          email: session.customer_email || session.customer_details?.email,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase(),
        });
      }

      return NextResponse.json({
        verified: false,
        status: session.payment_status,
        provider: "stripe",
      });
    }

    // --- Paystack Verification ---
    if (provider === "paystack" && reference) {
      const paystackKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackKey) {
        return NextResponse.json({ verified: false, error: "Paystack not configured" }, { status: 503 });
      }

      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${paystackKey}` },
      });
      const verifyData = await verifyRes.json();

      if (verifyData.data?.status === "success") {
        const alreadyInMemory = verifiedReferences.has(dedupKey);

        if (!alreadyInMemory) {
          // Check DB to see if already paid
          const adminClient = createAdminClient();
          const { data: existingOrder } = await adminClient
            .from("orders")
            .select("status")
            .eq("payment_reference", reference)
            .eq("payment_provider", "paystack")
            .single();

          const alreadyPaid = ["paid", "processing", "shipped", "delivered"].includes(existingOrder?.status ?? "");

          if (!alreadyPaid) {
            // Fallback: update order status if webhook hasn't done it yet
            await updateOrderStatus(reference, "paystack", "paid");
          }
          verifiedReferences.add(dedupKey);
        }

        return NextResponse.json({
          verified: true,
          status: "paid",
          provider: "paystack",
          email: verifyData.data.customer?.email,
          amount: verifyData.data.amount ? verifyData.data.amount / 100 : 0,
          currency: verifyData.data.currency?.toUpperCase(),
        });
      }

      return NextResponse.json({
        verified: false,
        status: verifyData.data?.status || "unknown",
        provider: "paystack",
      });
    }

    return NextResponse.json({ verified: false, error: "Missing required parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("[VERIFY_PAYMENT_ERROR]", error);
    return NextResponse.json({ verified: false, error: error.message }, { status: 500 });
  }
}
