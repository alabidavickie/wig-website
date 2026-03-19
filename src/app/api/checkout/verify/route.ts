import { NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderStatus } from "@/lib/actions/orders";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const reference = searchParams.get("reference");
  const provider = searchParams.get("provider");

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
        // Fallback: update order status if webhook hasn't done it
        await updateOrderStatus(sessionId, "stripe", "paid");

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
        // Fallback: update order status if webhook hasn't done it
        await updateOrderStatus(reference, "paystack", "paid");

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
