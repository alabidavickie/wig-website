"use client";

import { useEffect, useState, Suspense } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const { clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const [cleared, setCleared] = useState(false);

  const sessionId = searchParams.get("session_id");
  const reference = searchParams.get("reference");
  const provider = searchParams.get("provider");

  useEffect(() => {
    // Only clear once
    if (!cleared && (sessionId || reference)) {
      clearCart();
      setCleared(true);
    }
  }, [sessionId, reference, clearCart, cleared]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-[#1A1A1D]">
      <div className="text-center space-y-8 max-w-lg px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto" />
        <h1 className="font-serif text-5xl md:text-6xl uppercase tracking-tighter italic leading-none">Order Securely <br /> Placed</h1>
        
        <div className="space-y-4">
           <p className="text-[14px] text-[#1A1A1D]/60 tracking-wide leading-relaxed">
             Your luxury acquisition has been confirmed via <span className="font-bold text-[#1A1A1D] uppercase tracking-widest">{provider}</span>.
           </p>
           {reference && (
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1D]/40">Ref: {reference}</p>
           )}
        </div>

        <div className="w-16 h-px bg-gray-200 mx-auto my-8"></div>

        <p className="text-[12px] font-bold uppercase tracking-widest text-[#D5A754]">
           Our Master Stylists are curating your order.
        </p>

        <div className="flex gap-4 justify-center mt-12">
          <Link href="/shop" className="bg-black text-white px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
            Continue Shopping
          </Link>
          <Link href="/dashboard/orders" className="border border-gray-200 text-[#1A1A1D] px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:border-black transition-all">
            Track Fulfillment
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SuccessContent />
    </Suspense>
  );
}
