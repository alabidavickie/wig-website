import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { updateOrderStatus, deductInventoryForOrder, type OrderStatus } from "@/lib/actions/orders";
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

    // Shared admin client for all event handlers (bypasses RLS)
    const adminClient = createAdminClient();

    // ─── Idempotency gate (in-memory) ───
    if (processedEvents.has(event.id)) {
      console.log(`[STRIPE_WEBHOOK] Skipping duplicate event ${event.id}`);
      return new NextResponse("Already processed", { status: 200 });
    }
    processedEvents.add(event.id);

    // ═══════════════════════════════════════════════════════════════
    // 1. checkout.session.completed
    // ═══════════════════════════════════════════════════════════════
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reference = session.id;

      // DB-level idempotency: skip if order already fulfilled
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

      console.log(`[STRIPE_WEBHOOK] checkout.session.completed — session ${reference}`);

      const updatedOrder = await updateOrderStatus(reference, "stripe", "paid");
      if (updatedOrder?.id) {
        await deductInventoryForOrder(updatedOrder.id);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. checkout.session.async_payment_succeeded
    //    For delayed payment methods (bank transfers, etc.) that
    //    confirm AFTER the session is created.
    // ═══════════════════════════════════════════════════════════════
    else if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reference = session.id;

      const { data: existingOrder } = await adminClient
        .from("orders")
        .select("status")
        .eq("payment_reference", reference)
        .eq("payment_provider", "stripe")
        .single();

      if (existingOrder?.status === "paid" || existingOrder?.status === "processing" || existingOrder?.status === "shipped" || existingOrder?.status === "delivered") {
        console.log(`[STRIPE_WEBHOOK] async_payment_succeeded — order already fulfilled ${reference}`);
        return new NextResponse("Already processed", { status: 200 });
      }

      console.log(`[STRIPE_WEBHOOK] async_payment_succeeded — session ${reference}`);

      const updatedOrder = await updateOrderStatus(reference, "stripe", "paid");
      if (updatedOrder?.id) {
        await deductInventoryForOrder(updatedOrder.id);
      }
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. checkout.session.async_payment_failed
    //    The customer's delayed payment method failed.
    // ═══════════════════════════════════════════════════════════════
    else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reference = session.id;

      console.log(`[STRIPE_WEBHOOK] async_payment_failed — session ${reference}`);

      // Mark the order as cancelled
      await adminClient
        .from("orders")
        .update({ status: "cancelled" })
        .match({ payment_reference: reference, payment_provider: "stripe" });

      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. checkout.session.expired
    //    Session expired before the customer completed payment.
    // ═══════════════════════════════════════════════════════════════
    else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reference = session.id;

      console.log(`[STRIPE_WEBHOOK] session.expired — session ${reference}`);

      // Only cancel orders still in "pending" to avoid overwriting paid/shipped orders
      const { data: existingOrder } = await adminClient
        .from("orders")
        .select("status")
        .eq("payment_reference", reference)
        .eq("payment_provider", "stripe")
        .single();

      if (existingOrder?.status === "pending") {
        await adminClient
          .from("orders")
          .update({ status: "cancelled" })
          .match({ payment_reference: reference, payment_provider: "stripe" });

        console.log(`[STRIPE_WEBHOOK] Cancelled expired pending order ${reference}`);
      }

      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. charge.refunded
    //    A charge was fully or partially refunded via Stripe dashboard
    //    or API. Look up the order by payment_intent.
    // ═══════════════════════════════════════════════════════════════
    else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;
      const refundedAmount = charge.amount_refunded; // in minor units (cents/pence)

      console.log(`[STRIPE_WEBHOOK] charge.refunded — PI ${paymentIntentId}, amount ${refundedAmount}`);

      // Stripe checkout sessions create a PaymentIntent, so we need to
      // look up the checkout session that generated this PI to find our order.
      let orderReference: string | null = null;

      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          orderReference = sessions.data[0].id;
        }
      } catch (lookupErr) {
        console.error(`[STRIPE_WEBHOOK] Failed to look up session for PI ${paymentIntentId}:`, lookupErr);
      }

      if (orderReference) {
        // Convert refund amount from minor units to major units (e.g. pence → pounds)
        const refundAmountMajor = refundedAmount / 100;

        await adminClient
          .from("orders")
          .update({
            is_refunded: true,
            refund_amount: refundAmountMajor,
            status: "cancelled" as OrderStatus,
          })
          .match({ payment_reference: orderReference, payment_provider: "stripe" });

        console.log(`[STRIPE_WEBHOOK] Marked order ${orderReference} as refunded (${refundAmountMajor})`);
      } else {
        console.warn(`[STRIPE_WEBHOOK] charge.refunded — could not find order for PI ${paymentIntentId}`);
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
