import { NextResponse } from "next/server";
import { createOrder } from "@/lib/actions/orders";
import { OrderInput } from "@/lib/actions/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingDetails } = body;

    if (!items || !items.length) {
      return new NextResponse("Items are required", { status: 400 });
    }

    const email = shippingDetails?.email || "guest@example.com";
    const total_amount = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    // Paystack Reference
    const reference = `SH_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      email,
      shipping_info: shippingDetails || {},
      total_amount,
      currency: "NGN",
      payment_provider: "paystack",
      payment_reference: reference, 
      items: items.map((i: any) => ({
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        image_url: i.image,
      }))
    };

    // Initialize Paystack Transaction via REST API
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        amount: Math.round(total_amount * 100), // Convert to kobo
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?reference=${reference}&provider=paystack`,
        metadata: {
          custom_fields: items.map((item: any) => ({
            display_name: item.name,
            variable_name: `product_${item.id}`,
            value: item.quantity
          }))
        }
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("[PAYSTACK_INIT_ERROR]", data);
      throw new Error(data.message || "Failed to initialize Paystack");
    }

    // Save Pending Order to Database only after successful initialization
    await createOrder(orderInput);

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error: any) {
    console.error("[PAYSTACK_CHECKOUT_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
