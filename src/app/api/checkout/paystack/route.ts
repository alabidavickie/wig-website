import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/actions/orders";
import { OrderInput } from "@/lib/actions/orders";

export async function POST(req: Request) {
  try {
    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();

    // Zod Validation Schema
    const checkoutSchema = z.object({
      items: z.array(z.object({
        id: z.string().uuid(),
        quantity: z.number().int().positive(),
        name: z.string(),
        image: z.string(),
        variant: z.record(z.string(), z.string()).optional()
      })),
      shippingDetails: z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        address: z.string().min(5),
        city: z.string().min(2),
        zip: z.string().default("")
      })
    });

    const validatedData = checkoutSchema.safeParse(body);
    if (!validatedData.success) {
      return new NextResponse(JSON.stringify({ error: "Invalid request data", details: validatedData.error.format() }), { status: 400 });
    }

    const { items, shippingDetails } = validatedData.data;

    // Fetch products from database to get authentic prices
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select()
      .in("id", items.map((i: any) => i.id));

    if (dbError || !dbProducts) {
      throw new Error("Failed to verify product prices");
    }

    // Calculate total amount from DB prices
    const total_amount = items.reduce((acc: number, item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
      if (!dbProduct) throw new Error(`Product not found: ${item.name}`);
      return acc + (dbProduct.base_price * item.quantity);
    }, 0);

    const email = user?.email || shippingDetails?.email || "unknown@example.com";
    
    // Paystack Reference
    const reference = `SH_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      user_id: user?.id || undefined, // Guest support
      email,
      shipping_info: shippingDetails || {},
      total_amount,
      currency: "NGN",
      payment_provider: "paystack",
      payment_reference: reference, 
      is_guest: !user, // Flag as guest if no auth session
      items: items.map((i: any) => {
        const dbProduct = dbProducts.find((p: any) => p.id === i.id);
        return {
          product_id: i.id,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: dbProduct?.base_price || 0, // SECURE: Use DB price instead of client-provided price
          image_url: i.image,
          attributes: i.variant
        };
      })
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
        amount: Math.round(total_amount * 100 * 1500), // Convert to kobo AND apply NGN rate (1500)
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
