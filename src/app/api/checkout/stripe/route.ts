import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder } from "@/lib/actions/orders";
import { OrderInput } from "@/lib/actions/orders";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingDetails } = body;

    // Validate request
    if (!items || !items.length) {
      return new NextResponse("Items are required", { status: 400 });
    }

    // Calculate total amount
    const total_amount = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    // Prepare Stripe Line Items
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.name,
          images: [new URL(item.image, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString()],
        },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: item.quantity,
    }));

    // Generate a temporary fallback reference in case webhook is slow
    const tempReference = `SH_TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout`,
      customer_email: shippingDetails?.email || undefined,
      metadata: {
        tempReference, // Pass temp reference to cross-reference with webhook
      }
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe session URL");
    }

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      email: shippingDetails?.email || "guest@example.com",
      shipping_info: shippingDetails || {},
      total_amount,
      currency: "GBP",
      payment_provider: "stripe",
      payment_reference: session.id, // Save the actual Stripe session ID
      items: items.map((i: any) => ({
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        image_url: i.image,
      }))
    };

    // Save Pending Order to Database
    await createOrder(orderInput);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
