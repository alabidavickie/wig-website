import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createOrder } from "@/lib/actions/orders";
import { OrderInput } from "@/lib/actions/orders";

export async function POST(req: Request) {
  try {
    // Early check: Ensure Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.trim() === "") {
      return NextResponse.json(
        { message: "Stripe is not configured. Please add your STRIPE_SECRET_KEY to .env.local" },
        { status: 503 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-04-10" as any,
    });

    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    
    // Zod Validation Schema — accepts any string ID (UUIDs and mock IDs)
    const checkoutSchema = z.object({
      items: z.array(z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
        name: z.string(),
        image: z.string(),
        price: z.number().optional(), // Accept price from client as fallback
        variant: z.record(z.string(), z.string()).optional()
      })),
      shippingDetails: z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        address: z.string().min(5),
        city: z.string().min(2),
        zip: z.string().default("")
      }),
      currency: z.string().optional()
    });

    const validatedData = checkoutSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid checkout data. Please fill in all required fields.", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { items, shippingDetails } = validatedData.data;

    // Fetch products from database to get authentic prices
    // Filter out mock IDs for DB lookup
    const realIds = items.filter(i => !i.id.startsWith("mock-")).map(i => i.id);
    let dbProducts: any[] = [];

    if (realIds.length > 0) {
      const { data, error } = await supabase
        .from("products")
        .select()
        .in("id", realIds);

      if (!error && data) {
        dbProducts = data;
      }
    }

    // Prepare Stripe Line Items — use DB price if available, client price as fallback
    const line_items = items.map((item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
      const price = dbProduct ? dbProduct.base_price : (item.price || 0);
      const attributes = item.variant ? Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(", ") : "";

      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.name,
            description: attributes || undefined,
            ...(item.image && !item.image.startsWith("/") ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(price * 100), // Convert to pence
        },
        quantity: item.quantity,
      };
    });

    // Validate total > 0
    const total_amount = line_items.reduce((acc: number, li: any) => acc + (li.price_data.unit_amount / 100) * li.quantity, 0);
    if (total_amount <= 0) {
      return NextResponse.json(
        { message: "Order total must be greater than zero." },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout`,
      customer_email: user?.email || shippingDetails?.email || undefined,
      metadata: {
        userId: user?.id || "guest",
        isGuest: (!user).toString()
      }
    });

    if (!session.url) {
      return NextResponse.json(
        { message: "Failed to create Stripe checkout session. Please try again." },
        { status: 502 }
      );
    }

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      user_id: user?.id || undefined, 
      email: user?.email || shippingDetails?.email || "unknown@example.com",
      shipping_info: shippingDetails || {},
      total_amount,
      currency: "GBP",
      payment_provider: "stripe",
      payment_reference: session.id,
      is_guest: !user,
      items: items.map((i: any) => {
        const dbProduct = dbProducts.find((p: any) => p.id === i.id);
        return {
          product_id: i.id,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: dbProduct?.base_price || i.price || 0,
          image_url: i.image,
          attributes: i.variant
        };
      })
    };

    // Save Pending Order to Database
    try {
      await createOrder(orderInput);
    } catch (orderError: any) {
      console.warn("[STRIPE_ORDER_SAVE_WARNING] Order save failed but session was created:", orderError.message);
      // Don't block the payment — the webhook will handle order reconciliation
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    
    // Provide user-friendly error messages for common Stripe errors
    let message = error.message || "Internal Server Error";
    if (error.type === "StripeAuthenticationError") {
      message = "Stripe authentication failed. Please verify your API key is correct.";
    } else if (error.type === "StripeInvalidRequestError") {
      message = "Invalid payment request. Please try again.";
    }
    
    return NextResponse.json({ message }, { status: 500 });
  }
}
