import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, OrderInput } from "@/lib/actions/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    // Early check: Ensure Paystack is configured
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey || paystackKey.trim() === "") {
      return NextResponse.json(
        { message: "Paystack is not configured. Please add your PAYSTACK_SECRET_KEY to .env.local" },
        { status: 503 }
      );
    }

    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const adminClient = createAdminClient();
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
    // Filter out mock IDs for DB lookup (they won't exist in Supabase)
    const realIds = items.filter(i => !i.id.startsWith("mock-")).map(i => i.id);
    let dbProducts: any[] = [];

    if (realIds.length > 0) {
      const { data, error } = await adminClient
        .from("products")
        .select()
        .in("id", realIds);

      if (!error && data) {
        dbProducts = data;
      }
    }

    // Calculate total amount in GBP (base)
    const base_total = items.reduce((acc: number, item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
      const unitPrice = dbProduct ? dbProduct.base_price : (item.price || 0);
      return acc + (unitPrice * item.quantity);
    }, 0);

    if (base_total <= 0) {
      return NextResponse.json(
        { message: "Order total must be greater than zero." },
        { status: 400 }
      );
    }

    // 1. FETCH LATEST EXCHANGE RATE (GBP -> NGN)
    let rate = 1500; // Fallback
    try {
      const rateRes = await fetch("https://open.er-api.com/v6/latest/GBP", { next: { revalidate: 3600 } });
      const rateData = await rateRes.json();
      if (rateData?.rates?.NGN) {
        rate = rateData.rates.NGN;
      }
    } catch (e) {
      console.warn("[PAYSTACK_API] Rate fetch failed, using fallback:", e);
    }

    // 2. APPLY SHIPPING (Fixed fee: £15 or converted NGN)
    const SHIPPING_GBP = 15;
    const shipping_ngn = Math.round(SHIPPING_GBP * rate);
    
    // 3. CONVERT TOTAL TO NGN
    const total_ngn = Math.round(base_total * rate) + shipping_ngn;

    const email = user?.email || shippingDetails?.email || "unknown@example.com";
    
    // Paystack Reference
    const reference = `SH_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      user_id: user?.id || undefined,
      email,
      shipping_info: {
        ...shippingDetails,
        shippingFee: shipping_ngn,
        exchangeRate: rate
      },
      total_amount: total_ngn,
      currency: "NGN",
      payment_provider: "paystack",
      payment_reference: reference, 
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

    // Initialize Paystack Transaction via REST API
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        amount: total_ngn * 100, // Paystack expects kobo (value * 100)
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
      return NextResponse.json(
        { message: data.message || "Paystack failed to initialize. Please check your API key." },
        { status: 502 }
      );
    }

    // Save Pending Order to Database only after successful initialization
    try {
      await createOrder(orderInput);
    } catch (orderError: any) {
      console.warn("[PAYSTACK_ORDER_SAVE_WARNING] Order save failed but payment was initialized:", orderError.message);
      // Don't block the payment — the webhook will handle order reconciliation
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error: any) {
    console.error("[PAYSTACK_CHECKOUT_ERROR]", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
