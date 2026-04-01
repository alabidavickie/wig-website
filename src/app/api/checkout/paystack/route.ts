import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, OrderInput } from "@/lib/actions/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDiscountCode, incrementDiscountUsage } from "@/lib/actions/discounts";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { isDisposableEmail } from "@/lib/disposable-domains";

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

    // 1. Rate Limiting
    const ip = await getClientIp();
    const { success: rateLimitSuccess } = await rateLimiters.checkout.limit(ip);
    if (!rateLimitSuccess) {
      return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
    }

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
      currency: z.string().optional(),
      discountCode: z.string().nullable().optional(),
      discountAmount: z.number().min(0).optional(),
      recaptchaToken: z.string().optional(),
    });

    const validatedData = checkoutSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { message: "Invalid checkout data. Please fill in all required fields.", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { items, shippingDetails, discountCode, recaptchaToken } = validatedData.data;

    // 2. Disposable Email Check
    const targetEmail = user?.email || shippingDetails.email;
    if (isDisposableEmail(targetEmail)) {
      return NextResponse.json({ message: "Please provide a valid, non-disposable email address." }, { status: 400 });
    }

    // 3. reCAPTCHA v3 Verification
    if (!recaptchaToken) {
      return NextResponse.json({ message: "reCAPTCHA verification missing." }, { status: 400 });
    }
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const recaptchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
      });
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        console.error("[PAYSTACK_CHECKOUT] reCAPTCHA failed", recaptchaData);
        return NextResponse.json({ message: "Automated bot request detected." }, { status: 403 });
      }
    }

    // Fetch products from database to get authentic prices
    const itemIds = items.map(i => i.id);
    let dbProducts: any[] = [];

    if (itemIds.length > 0) {
      const { data, error } = await adminClient
        .from("products")
        .select()
        .in("id", itemIds);

      if (!error && data) {
        dbProducts = data;
      }
    }

    // Reject any items not found in the database (prevents price manipulation)
    const missingProducts = itemIds.filter(id => !dbProducts.find((p: any) => p.id === id));
    if (missingProducts.length > 0) {
      console.error("[PAYSTACK_CHECKOUT] Unknown product IDs:", missingProducts);
      return NextResponse.json({ message: "One or more products could not be verified." }, { status: 400 });
    }

    // Calculate total amount in GBP (base) — always use authentic DB price
    const base_total = items.reduce((acc: number, item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
      return acc + (dbProduct.base_price * item.quantity);
    }, 0);

    if (base_total <= 0) {
      return NextResponse.json(
        { message: "Order total must be greater than zero." },
        { status: 400 }
      );
    }

    // Server-side discount validation
    let validatedDiscount: { id: string; code: string; discountAmount: number } | null = null;
    let discountAmountGbp = 0;
    if (discountCode) {
      const discountResult = await validateDiscountCode(discountCode, base_total);
      if (discountResult.valid && discountResult.discount) {
        validatedDiscount = discountResult.discount;
        discountAmountGbp = discountResult.discount.discountAmount;
      }
    }
    const discounted_base = Math.max(0, base_total - discountAmountGbp);

    // 1. FETCH LATEST EXCHANGE RATE (GBP -> NGN)
    let rate = 2050; // Fallback (updated March 2026; live rate fetched below)
    try {
      const rateRes = await fetch("https://open.er-api.com/v6/latest/GBP", { next: { revalidate: 3600 } });
      const rateData = await rateRes.json();
      if (rateData?.rates?.NGN) {
        const fetchedRate = rateData.rates.NGN;
        // Sanity Check Bounds (1 GBP = 1000 to 5000 NGN)
        if (fetchedRate > 1000 && fetchedRate < 5000) {
          rate = fetchedRate;
        } else {
          console.warn("[PAYSTACK_API] Rate out of bounds:", fetchedRate);
        }
      }
    } catch (e) {
      console.warn("[PAYSTACK_API] Rate fetch failed, using fallback:", e);
    }

    const { getStoreSettings } = await import("@/lib/actions/settings");
    const settings = await getStoreSettings();
    const SHIPPING_GBP = settings.shipping_fee_gbp;
    const shipping_ngn = Math.round(SHIPPING_GBP * rate);

    // 3. CONVERT DISCOUNTED TOTAL TO NGN
    const total_ngn = Math.round(discounted_base * rate) + shipping_ngn;

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
          unit_price: dbProduct.base_price,
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
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://silkhausbyfollienn.xyz"}/checkout/success?reference=${reference}&provider=paystack`,
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
      console.error("[PAYSTACK_ORDER_SAVE_ERROR] Order save failed:", orderError.message);
      return NextResponse.json(
        { message: "Failed to create order. Please try again or contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (error: any) {
    console.error("[PAYSTACK_CHECKOUT_ERROR]", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
