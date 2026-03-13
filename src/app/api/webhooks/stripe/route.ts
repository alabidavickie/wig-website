import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { updateOrderStatus } from "@/lib/actions/orders";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`[STRIPE_WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // We stored the reference in session.id during creation
      const reference = session.id;
      
      console.log(`[STRIPE_WEBHOOK] Payment successful for session ${reference}`);
      
      // Update order status to paid
      await updateOrderStatus(reference, "stripe", "paid");
    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
