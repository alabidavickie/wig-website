import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createOrder } from "@/lib/actions/orders";
import { OrderInput } from "@/lib/actions/orders";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10" as any,
  });

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

    // Prepare Stripe Line Items with DB prices
    const line_items = items.map((item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
      if (!dbProduct) throw new Error(`Product not found: ${item.name}`);
      
      const price = dbProduct.base_price;
      const attributes = item.variant ? Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(", ") : "";

      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.name,
            description: attributes, // Show variants in Stripe Checkout
            images: [new URL(item.image, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString()],
          },
          unit_amount: Math.round(price * 100), // Use DB price
        },
        quantity: item.quantity,
      };
    });

    // Calculate total amount from DB prices
    const total_amount = line_items.reduce((acc: number, li: any) => acc + (li.price_data.unit_amount / 100) * li.quantity, 0);

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
      throw new Error("Failed to create Stripe session URL");
    }

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      user_id: user?.id || undefined, 
      email: user?.email || shippingDetails?.email || "unknown@example.com",
      shipping_info: shippingDetails || {},
      total_amount,
      currency: "GBP",
      payment_provider: "stripe",
      payment_reference: session.id, // Save the actual Stripe session ID
      is_guest: !user,
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

    // Save Pending Order to Database
    await createOrder(orderInput);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
