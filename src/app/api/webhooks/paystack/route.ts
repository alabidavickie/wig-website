import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus, deductInventoryForOrder } from "@/lib/actions/orders";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const secret = process.env.PAYSTACK_SECRET_KEY!;

// In-process deduplication: prevents double inventory deduction from Paystack retries
const processedReferences = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("x-paystack-signature") as string;

    // Verify Paystack Signature
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) {
      console.error("[PAYSTACK_WEBHOOK_ERROR] Invalid signature");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // Idempotency: skip if this reference was already processed in-memory
      if (processedReferences.has(reference)) {
        console.log(`[PAYSTACK_WEBHOOK] Skipping duplicate reference ${reference}`);
        return new NextResponse("Already processed", { status: 200 });
      }
      processedReferences.add(reference);

      // Idempotency: skip if order is already paid in DB
      const adminClient = createAdminClient();
      const { data: existingOrder } = await adminClient
        .from("orders")
        .select("status")
        .eq("payment_reference", reference)
        .eq("payment_provider", "paystack")
        .single();

      if (existingOrder?.status === "paid" || existingOrder?.status === "processing" || existingOrder?.status === "shipped" || existingOrder?.status === "delivered") {
        console.log(`[PAYSTACK_WEBHOOK] Skipping already processed order ${reference}`);
        return new NextResponse("Already processed", { status: 200 });
      }

      console.log(`[PAYSTACK_WEBHOOK] Payment successful for reference ${reference}`);

      // Verify the transaction with Paystack (best practice)
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const verifyData = await verifyRes.json();

      if (verifyData.data?.status === "success") {
        const updatedOrder = await updateOrderStatus(reference, "paystack", "paid");
        if (updatedOrder?.id) {
          await deductInventoryForOrder(updatedOrder.id);
        }
        revalidatePath("/admin/orders");
        revalidatePath("/admin");
      }
    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (error: any) {
    console.error("[PAYSTACK_WEBHOOK_ERROR]", error);
    // Return 200 so Paystack does not retry — log the error internally for investigation
    return new NextResponse("Webhook processing error logged", { status: 200 });
  }
}
