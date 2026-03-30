"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowLeft, Globe2, Tag, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useGeoStore } from "@/lib/store/useGeoStore";
import { Price } from "@/components/storefront/price";
import { toast } from "sonner";
import { validateDiscountCode } from "@/lib/actions/discounts";
import { getStoreSettings } from "@/lib/actions/settings";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { geo, getExchangeRate, initialize, refreshRate } = useGeoStore();

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", address: "", city: "", zip: ""
  });
  
  const [shippingFeeGbp, setShippingFeeGbp] = useState(15.00);

  // Discount / promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string; code: string; type: "percentage" | "flat"; value: number; discountAmount: number;
  } | null>(null);

  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    initialize();
    getStoreSettings().then(s => setShippingFeeGbp(Math.max(0, s.shipping_fee_gbp)));
    // Always fetch the latest exchange rate before checkout
    refreshRate();
  }, [initialize, refreshRate]);

  if (!mounted || !geo) return null; // Wait for geo resolution

  const baseTotalPrice = getTotalPrice();
  const exchangeRate = getExchangeRate();

  // Discount is calculated on GBP base price
  const discountAmountGbp = appliedDiscount?.discountAmount ?? 0;
  const discountedBaseTotal = Math.max(0, baseTotalPrice - discountAmountGbp);
  
  // Total to charge includes shipping fee in converted currency
  const shippingFeeConverted = shippingFeeGbp * exchangeRate;
  const finalTotalConverted = (discountedBaseTotal * exchangeRate) + shippingFeeConverted;

  // Format items for the API with the converted prices if needed
  const checkoutItems = items.map(item => ({
    ...item,
    price: item.price * exchangeRate
  }));

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const result = await validateDiscountCode(promoInput.trim(), baseTotalPrice);
      if (result.valid && result.discount) {
        setAppliedDiscount(result.discount);
        toast.success(`Code "${result.discount.code}" applied!`, {
          description: result.discount.type === "percentage"
            ? `${result.discount.value}% off your order.`
            : `£${result.discount.discountAmount.toFixed(2)} off your order.`,
        });
        setPromoInput("");
      } else {
        toast.error("Invalid Code", { description: result.error });
      }
    } catch {
      toast.error("Could not validate code. Try again.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    toast.info("Promo code removed.");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans">
        <div className="h-[80px]"></div>
        <div className="text-center py-24 space-y-8">
          <p className="text-[20px] text-muted-foreground uppercase tracking-widest italic font-serif">Your bag is currently empty</p>
          <Link href="/shop" className="inline-block bg-black text-foreground px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl cursor-pointer">
            Explore The Collection
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (provider: 'stripe' | 'paystack') => {
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zip) {
      toast.error("Missing Details", {
        description: "Please fill in all required shipping details including city and postal code.",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const endpoint = provider === 'stripe' ? '/api/checkout/stripe' : '/api/checkout/paystack';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          shippingDetails: formData,
          currency: geo.currency,
          discountCode: appliedDiscount?.code ?? null,
          discountAmount: discountAmountGbp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      // Redirect to Paystack or Stripe Hosted Page
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      console.error("Checkout Error:", error);
      toast.error("Checkout Failed", {
        description: errorMessage,
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="h-[100px] sm:h-[120px]"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <Link href="/cart" className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Bag
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10 md:gap-12 lg:gap-16">
          {/* Checkout Form */}
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <div>
              <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-muted-foreground mb-2 sm:mb-3">Secure Checkout</h3>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif uppercase tracking-tighter italic leading-none text-foreground">Your Order</h1>
            </div>

            {/* Shipping Details */}
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-border pb-4">
                <h2 className="text-[13px] font-bold uppercase tracking-widest">Shipping Details</h2>
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-[#D5A754]">
                   <Globe2 className="w-3 h-3" /> Region: {geo.country}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "First Name", name: "firstName", type: "text", placeholder: "Jane" },
                  { label: "Last Name", name: "lastName", type: "text", placeholder: "Cooper" },
                ].map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{field.label}</label>
                    <input type={field.type} name={field.name} placeholder={field.placeholder} value={formData[field.name as keyof typeof formData]} onChange={handleInputChange} required className="w-full h-12 px-4 border border-border bg-card text-foreground text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-muted-foreground/50" />
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <input type="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleInputChange} required className="w-full h-12 px-4 border border-border bg-card text-foreground text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipping Address</label>
                  <input type="text" name="address" placeholder="123 Luxury Lane" value={formData.address} onChange={handleInputChange} required className="w-full h-12 px-4 border border-border bg-card text-foreground text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                  <input type="text" name="city" placeholder="New York" value={formData.city} onChange={handleInputChange} required className="w-full h-12 px-4 border border-border bg-card text-foreground text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">ZIP / Postal Code</label>
                  <input type="text" name="zip" placeholder="10001" value={formData.zip} onChange={handleInputChange} className="w-full h-12 px-4 border border-border bg-card text-foreground text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-4">
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-border pb-4">Promo Code</h2>
              {appliedDiscount ? (
                <div className="flex items-center justify-between p-4 bg-[#D5A754]/10 border border-[#D5A754]/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-[#D5A754]" />
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-widest text-[#D5A754]">{appliedDiscount.code}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {appliedDiscount.type === "percentage"
                          ? `${appliedDiscount.value}% discount applied`
                          : `£${appliedDiscount.discountAmount.toFixed(2)} discount applied`}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleRemovePromo} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                    placeholder="Enter promo code"
                    className="flex-1 h-12 px-4 border border-border bg-card text-foreground text-[13px] font-bold uppercase outline-none focus:border-[#D5A754] transition-colors placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:font-normal"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    className="px-6 h-12 bg-[#2A2A2D] text-foreground text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] hover:text-black transition-all disabled:opacity-40 flex items-center gap-2"
                  >
                    {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Payment Details (Geo-Routed) */}
            <div className="space-y-6">
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-border pb-4">Secure Checkout</h2>
              
              <div className="p-8 bg-card border border-dashed border-border space-y-6 rounded-2xl">
                
                {geo.isNigeria ? (
                   // Paystack Checkout Context
                   <div className="text-center space-y-4">
                      <Lock className="w-8 h-8 text-[#011B33] mx-auto" />
                      <div>
                        <p className="text-[13px] font-bold uppercase tracking-widest text-foreground">Paystack Secure Gateway</p>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">Pay securely via Bank Transfer, USSD, or Nigerian issued debit cards.</p>
                      </div>
                      <Button
                        onClick={() => handlePlaceOrder('paystack')}
                        disabled={submitting}
                        className="w-full bg-[#011B33] hover:bg-[#000F1F] text-white py-8 text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl mt-4 rounded-full transition-all"
                      >
                        {submitting ? "Initializing Paystack..." : <span className="flex items-center justify-center gap-2">Pay <Price amount={finalTotalConverted / exchangeRate /* display un-exchanged since Price handles it */} /></span>}
                      </Button>
                   </div>
                ) : (
                   // Stripe Checkout Context (GBP, Intl)
                   <div className="text-center space-y-4">
                      <Lock className="w-8 h-8 text-[#635BFF] mx-auto" />
                      <div>
                        <p className="text-[13px] font-bold uppercase tracking-widest text-foreground">Stripe Verified Check</p>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">Pay securely with Apple Pay, Google Pay, or any international credit card.</p>
                      </div>
                      <Button
                        onClick={() => handlePlaceOrder('stripe')}
                        disabled={submitting}
                        className="w-full bg-[#635BFF] hover:bg-[#4C45D0] text-foreground py-8 text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl mt-4 rounded-full transition-all"
                      >
                        {submitting ? "Securing Session..." : <span className="flex items-center justify-center gap-2">Pay <Price amount={finalTotalConverted / exchangeRate} /></span>}
                      </Button>
                   </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit lg:sticky lg:top-[160px]">
            <div className="bg-card p-5 sm:p-6 md:p-8 border border-border shadow-sm space-y-6 sm:space-y-8 rounded-[16px] sm:rounded-[20px] md:rounded-[24px]">
              <div className="flex items-center gap-3 text-foreground">
                <ShieldCheck className="w-5 h-5 text-[#D5A754]" />
                <h3 className="text-[12px] font-bold uppercase tracking-widest">Order Summary</h3>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-14 h-18 bg-white border border-gray-100 overflow-hidden rounded-lg shrink-0 relative">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-widest truncate text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-[12px] font-bold">
                      <Price amount={item.price * item.quantity} />
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-bold text-foreground">
                    <Price amount={baseTotalPrice} />
                  </span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#D5A754] uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Tag className="w-3 h-3" /> {appliedDiscount.code}
                    </span>
                    <span className="font-bold text-[#D5A754]">
                      − <Price amount={appliedDiscount.discountAmount} />
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground uppercase tracking-widest font-bold">Shipping</span>
                  <span className="font-bold text-[#D5A754] uppercase tracking-widest"><Price amount={shippingFeeGbp} /></span>
                </div>
                <div className="flex justify-between text-[16px] font-bold border-t border-border pt-4">
                  <span className="uppercase tracking-widest text-foreground">Total</span>
                  <div className="font-serif italic text-[#D5A754]">
                    <Price amount={finalTotalConverted / exchangeRate} />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-[0.2em] font-bold mt-8">
                256-bit SSL encrypted • Safe Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
