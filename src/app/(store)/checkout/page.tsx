"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowLeft, CheckCircle, Globe2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGeoStore } from "@/lib/store/useGeoStore";
import { Price } from "@/components/storefront/price";
import { toast } from "sonner";

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { geo, getExchangeRate, initialize, refreshRate } = useGeoStore();
  
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", address: "", city: "", zip: ""
  });

  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    initialize();
    // Always fetch the latest exchange rate before checkout
    refreshRate();
  }, [initialize, refreshRate]);

  if (!mounted || !geo) return null; // Wait for geo resolution

  const baseTotalPrice = getTotalPrice();
  const exchangeRate = getExchangeRate();
  const displayTotalPrice = baseTotalPrice * exchangeRate;
  
  // Format items for the API with the converted prices if needed
  const checkoutItems = items.map(item => ({
    ...item,
    price: item.price * exchangeRate
  }));

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
        <div className="h-[80px]"></div>
        <div className="text-center py-24 space-y-8">
          <p className="text-[20px] text-zinc-400 uppercase tracking-widest italic font-serif">Your bag is currently empty</p>
          <Link href="/shop" className="inline-block bg-black text-white px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl cursor-pointer">
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
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address) {
      toast.error("Missing Details", {
        description: "Please fill in all required shipping details.",
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
          currency: geo.currency
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
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error("Checkout Failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <div className="h-[100px] sm:h-[120px]"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <Link href="/cart" className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Bag
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10 md:gap-12 lg:gap-16">
          {/* Checkout Form */}
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <div>
              <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 mb-2 sm:mb-3">Secure Checkout</h3>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif uppercase tracking-tighter italic leading-none text-white">Your Order</h1>
            </div>

            {/* Shipping Details */}
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-[#2A2A2D] pb-4">
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{field.label}</label>
                    <input type={field.type} name={field.name} placeholder={field.placeholder} value={formData[field.name as keyof typeof formData]} onChange={handleInputChange} required className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#141414] text-white text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-zinc-700" />
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                  <input type="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleInputChange} required className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#141414] text-white text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-zinc-700" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Shipping Address</label>
                  <input type="text" name="address" placeholder="123 Luxury Lane" value={formData.address} onChange={handleInputChange} required className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#141414] text-white text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">City</label>
                  <input type="text" name="city" placeholder="New York" value={formData.city} onChange={handleInputChange} required className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#141414] text-white text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ZIP / Postal Code</label>
                  <input type="text" name="zip" placeholder="10001" value={formData.zip} onChange={handleInputChange} className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#141414] text-white text-[13px] outline-none focus:border-[#D5A754] transition-colors placeholder:text-zinc-700" />
                </div>
              </div>
            </div>

            {/* Payment Details (Geo-Routed) */}
            <div className="space-y-6">
              <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-[#2A2A2D] pb-4">Secure Checkout</h2>
              
              <div className="p-8 bg-[#141414] border border-dashed border-[#2A2A2D] space-y-6 rounded-2xl">
                
                {geo.isNigeria ? (
                   // Paystack Checkout Context
                   <div className="text-center space-y-4">
                      <Lock className="w-8 h-8 text-[#011B33] mx-auto" />
                      <div>
                        <p className="text-[13px] font-bold uppercase tracking-widest text-white">Paystack Secure Gateway</p>
                        <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">Pay securely via Bank Transfer, USSD, or Nigerian issued debit cards.</p>
                      </div>
                      <Button
                        onClick={() => handlePlaceOrder('paystack')}
                        disabled={submitting}
                        className="w-full bg-[#011B33] hover:bg-[#000F1F] text-white py-8 text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl mt-4 rounded-full transition-all"
                      >
                        {submitting ? "Initializing Paystack..." : <span className="flex items-center justify-center gap-2">Pay <Price amount={baseTotalPrice} /></span>}
                      </Button>
                   </div>
                ) : (
                   // Stripe Checkout Context (GBP, Intl)
                   <div className="text-center space-y-4">
                      <Lock className="w-8 h-8 text-[#635BFF] mx-auto" />
                      <div>
                        <p className="text-[13px] font-bold uppercase tracking-widest text-white">Stripe Verified Check</p>
                        <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">Pay securely with Apple Pay, Google Pay, or any international credit card.</p>
                      </div>
                      <Button
                        onClick={() => handlePlaceOrder('stripe')}
                        disabled={submitting}
                        className="w-full bg-[#635BFF] hover:bg-[#4C45D0] text-white py-8 text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl mt-4 rounded-full transition-all"
                      >
                        {submitting ? "Securing Session..." : <span className="flex items-center justify-center gap-2">Pay <Price amount={baseTotalPrice} /></span>}
                      </Button>
                   </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit lg:sticky lg:top-[160px]">
            <div className="bg-[#141414] p-5 sm:p-6 md:p-8 border border-[#2A2A2D] shadow-sm space-y-6 sm:space-y-8 rounded-[16px] sm:rounded-[20px] md:rounded-[24px]">
              <div className="flex items-center gap-3 text-white">
                <ShieldCheck className="w-5 h-5 text-[#D5A754]" />
                <h3 className="text-[12px] font-bold uppercase tracking-widest">Order Summary</h3>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-14 h-18 bg-white border border-gray-100 overflow-hidden rounded-lg shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-widest truncate text-white">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-[12px] font-bold">
                      <Price amount={item.price * item.quantity} />
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-[#2A2A2D] pt-6">
                <div className="flex justify-between text-[12px]">
                  <span className="text-zinc-400 uppercase tracking-widest font-bold">Subtotal</span>
                  <span className="font-bold text-white">
                    <Price amount={baseTotalPrice} />
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-zinc-400 uppercase tracking-widest font-bold">Shipping</span>
                  <span className="font-bold text-[#D5A754] italic uppercase tracking-widest">Free</span>
                </div>
                <div className="flex justify-between text-[16px] font-bold border-t border-[#2A2A2D] pt-4">
                  <span className="uppercase tracking-widest text-white">Total</span>
                  <div className="font-serif italic text-[#D5A754]">
                    <Price amount={baseTotalPrice} />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 text-center uppercase tracking-[0.2em] font-bold mt-8">
                256-bit SSL encrypted • Safe Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
