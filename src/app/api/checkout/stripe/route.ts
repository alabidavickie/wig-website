import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import { createOrder, OrderInput } from "@/lib/actions/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDiscountCode, incrementDiscountUsage } from "@/lib/actions/discounts";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";
import { isDisposableEmail } from "@/lib/disposable-domains";

export async function POST(req: Request) {
  try {
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
        email: z.email().max(255),
        firstName: z.string().min(1).max(50),
        lastName: z.string().min(1).max(50),
        address: z.string().min(5).max(200),
        city: z.string().min(2).max(100),
        zip: z.string().max(20).default("")
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
    if (!recaptchaSecret) {
      return NextResponse.json({ message: "Service unavailable. Please try again later." }, { status: 503 });
    }
    const recaptchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
    });
    const recaptchaData = await recaptchaRes.json();
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.error("[STRIPE_CHECKOUT] reCAPTCHA failed", recaptchaData);
      return NextResponse.json({ message: "Automated bot request detected." }, { status: 403 });
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

    // Verify all products exist
    const missingProducts = itemIds.filter(id => !dbProducts.find((p: any) => p.id === id));
    if (missingProducts.length > 0) {
      console.error("[STRIPE_CHECKOUT] Unknown product IDs:", missingProducts);
      return NextResponse.json({ message: "One or more products could not be verified." }, { status: 400 });
    }

    // Prepare Stripe Line Items
    const line_items = items.map((item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.id);
      const price = dbProduct.base_price;
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

    // Add Shipping Fee
    const { getStoreSettings } = await import("@/lib/actions/settings");
    const settings = await getStoreSettings();
    const SHIPPING_AMOUNT_GBP = settings.shipping_fee_gbp;
    
    line_items.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: "Global Shipping & Handling",
          description: "Insured express delivery",
        },
        unit_amount: Math.round(SHIPPING_AMOUNT_GBP * 100),
      },
      quantity: 1,
    } as any);

    // Discount Validation and Stripe Coupon creation
    let validatedDiscount: { id: string; code: string; discountAmount: number } | null = null;
    let stripeCouponId: string | undefined = undefined;

    const subtotalGbp = line_items
      .filter((li: any) => li.price_data.product_data.name !== "Global Shipping & Handling")
      .reduce((acc: number, li: any) => acc + (li.price_data.unit_amount / 100) * li.quantity, 0);

    if (discountCode) {
      const discountResult = await validateDiscountCode(discountCode, subtotalGbp);
      if (discountResult.valid && discountResult.discount) {
        validatedDiscount = discountResult.discount;
        
        try {
          // Create a dynamic one-time Stripe coupon for this checkout
          const coupon = await stripe.coupons.create({
            amount_off: Math.round(discountResult.discount.discountAmount * 100),
            currency: "gbp",
            duration: "once",
            name: `Discount: ${discountResult.discount.code}`,
          });
          stripeCouponId = coupon.id;
        } catch (couponErr: any) {
          console.error("[STRIPE_COUPON_ERROR]", couponErr.message);
          // Fallback: If coupon fails, we continue without it or log error
        }
      }
    }

    // Calculate Final Total for DB (incl. discount)
    const total_amount = Math.max(0, subtotalGbp + SHIPPING_AMOUNT_GBP - (validatedDiscount?.discountAmount || 0));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout`,
      customer_email: user?.email || shippingDetails?.email || undefined,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
      metadata: {
        userId: user?.id || "guest",
        isGuest: (!user).toString(),
        discountId: validatedDiscount?.id || ""
      }
    });

    if (!session.url) {
      throw new Error("Stripe session URL is missing");
    }

    // Prepare Db Order Input (Pending Order)
    const orderInput: OrderInput = {
      user_id: user?.id || undefined, 
      email: user?.email || shippingDetails?.email || "unknown@example.com",
      shipping_info: {
        ...shippingDetails,
        shippingFee: SHIPPING_AMOUNT_GBP
      },
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
          unit_price: dbProduct.base_price,
          image_url: i.image,
          attributes: i.variant
        };
      })
    };

    // Save Pending Order to Database
    try {
      await createOrder(orderInput);
    } catch (orderError: any) {
      console.error("[STRIPE_ORDER_SAVE_ERROR] Order save failed:", orderError.message);
      // NOTE: We don't block the user from payment if Stripe session is already created,
      // but we log it heavily. Ideally, order should be created FIRST as we do here.
      return NextResponse.json(
        { message: "Failed to create order tracking. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    
    // Handle specific Stripe errors
    const message = error.message || "Internal Server Error";
    const status = error.statusCode || 500;
    
    if (error.type === "StripeConnectionError") {
      return NextResponse.json(
        { message: "Connection to payment provider timed out. Please check your internet and try again." },
        { status: 504 }
      );
    }

    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json({ message: "Invalid payment request. Please try again." }, { status: 400 });
    }

    return NextResponse.json({ message: "Payment initialisation failed. Please try again." }, { status: 500 });
  }
}
