"use client";

import Link from "next/link";
import { Minus, Plus, X, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/useCartStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Price } from "@/components/storefront/price";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, mounted]);

  const handleCheckout = async () => {
    setCheckingAuth(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
    setCheckingAuth(false);
  };

  if (!mounted) return null;

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans" suppressHydrationWarning>
      {/* Header Spacer */}
      <div className="h-[100px] sm:h-[120px]"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12" suppressHydrationWarning>
        <header className="mb-8 sm:mb-12 md:mb-16 reveal">
          <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-500 mb-2 sm:mb-4">Your Selection</h3>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif uppercase tracking-tighter italic leading-none text-white">Shopping <br /> Bag</h1>
        </header>

        {items.length === 0 ? (
          <div className="py-24 text-center space-y-10 reveal">
            <p className="text-[20px] text-zinc-400 uppercase tracking-widest italic font-serif">Your bag is currently empty</p>
            <Link href="/shop" className="inline-block bg-black text-white px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl cursor-pointer">
              Explore The Collection
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_450px] gap-10 md:gap-16 lg:gap-20">
            {/* Cart Items List */}
            <div className="space-y-12">
              {items.map((item) => {
                const variantKey = item.variant ? `${item.id}-${item.variant.length}-${item.variant.color}` : undefined;
                return (
                  <div key={variantKey || item.id} className="reveal flex flex-col sm:flex-row gap-6 md:gap-10 group pb-12 border-b border-[#2A2A2D] last:border-0" suppressHydrationWarning>
                    <div className="w-full sm:w-32 md:w-48 aspect-[3/4] bg-[#141414] overflow-hidden shrink-0 rounded-[24px] md:rounded-[32px] border border-[#2A2A2D] shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col pt-0 sm:pt-4" suppressHydrationWarning>
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                          <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-white">{item.name}</h3>
                          {item.variant && (
                            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
                              {item.variant.length} • {item.variant.color}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id, variantKey)}
                          className="w-10 h-10 flex items-center justify-center bg-[#2A2A2D] text-zinc-500 hover:bg-[#D5A754] hover:text-black transition-all rounded-full cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex items-center bg-[#141414] p-1 rounded-full border border-[#2A2A2D]">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), variantKey)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-[#2A2A2D] transition-all rounded-full cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-12 text-center text-[12px] font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, variantKey)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-[#2A2A2D] transition-all rounded-full cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[20px] font-serif italic text-white">
                          <Price amount={item.price * item.quantity} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Panel */}
            <div className="h-fit lg:sticky lg:top-[160px] reveal" suppressHydrationWarning>
               <div className="bg-[#141414] p-5 sm:p-6 md:p-10 space-y-6 sm:space-y-8 md:space-y-10 rounded-[24px] sm:rounded-[32px] md:rounded-[40px] border border-[#2A2A2D] shadow-2xl">
                <div className="flex items-center gap-4 text-white">
                   <ShieldCheck className="w-6 h-6 text-[#D5A754]" />
                   <h2 className="text-[12px] font-bold uppercase tracking-[0.2em]">Bag Summary</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold text-white">
                      <Price amount={totalPrice} />
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Silk Haus Delivery</span>
                    <span className="font-bold text-[#D5A754] uppercase tracking-widest italic">Free</span>
                  </div>
                </div>

                <div className="pt-10 border-t border-[#2A2A2D] flex justify-between items-end">
                  <span className="text-[14px] font-bold uppercase tracking-[0.2em] text-white">Total Amount</span>
                  <div className="text-3xl font-serif italic font-bold text-[#D5A754]">
                    <Price amount={totalPrice} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleCheckout}
                    disabled={checkingAuth}
                    className="w-full bg-[#D5A754] text-black hover:bg-[#E6B964] transition-all rounded-full py-9 text-[13px] font-bold uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 cursor-pointer"
                  >
                    {checkingAuth ? (
                      <span className="flex items-center gap-3">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : (
                      <><Lock className="w-4 h-4" /> Secure Checkout <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                  
                  <p className="text-[10px] text-zinc-600 text-center uppercase tracking-[0.2em] font-bold leading-relaxed px-4">
                    Sign-in required • 256-bit SSL secured • Stripe verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
