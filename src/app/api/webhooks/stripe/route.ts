import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { updateOrderStatus, deductInventoryForOrder } from "@/lib/actions/orders";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// In-process deduplication: prevents double inventory deduction from Stripe retries
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error("[STRIPE_WEBHOOK_ERROR] Missing environment variables");
    return new NextResponse("Configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-04-10" as Stripe.LatestApiVersion,
  });

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
      // Idempotency: skip if this exact event was already processed in-memory
      if (processedEvents.has(event.id)) {
        console.log(`[STRIPE_WEBHOOK] Skipping duplicate event ${event.id}`);
        return new NextResponse("Already processed", { status: 200 });
      }
      processedEvents.add(event.id);

      const session = event.data.object as Stripe.Checkout.Session;
      const reference = session.id;

      // Idempotency: skip if order is already paid in DB
      const adminClient = createAdminClient();
      const { data: existingOrder } = await adminClient
        .from("orders")
        .select("status")
        .eq("payment_reference", reference)
        .eq("payment_provider", "stripe")
        .single();
        
      if (existingOrder?.status === "paid" || existingOrder?.status === "processing" || existingOrder?.status === "shipped" || existingOrder?.status === "delivered") {
        console.log(`[STRIPE_WEBHOOK] Skipping already processed order ${reference}`);
        return new NextResponse("Already processed", { status: 200 });
      }

      console.log(`[STRIPE_WEBHOOK] Payment successful for session ${reference}`);

      const updatedOrder = await updateOrderStatus(reference, "stripe", "paid");
      if (updatedOrder?.id) {
        await deductInventoryForOrder(updatedOrder.id);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    // Return 200 so Stripe does not retry — log the error internally for investigation
    return new NextResponse("Webhook processing error logged", { status: 200 });
  }
}
