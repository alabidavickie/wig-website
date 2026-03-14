"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Mail, ArrowRight, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-[#1A1A1D]">
      <div className="text-center space-y-10 max-w-xl px-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-emerald-50 rounded-full animate-pulse"></div>
          <Mail className="w-20 h-20 text-emerald-500 relative z-10" />
        </div>

        <div className="space-y-4">
          <h1 className="font-serif text-5xl md:text-6xl uppercase tracking-tighter italic leading-none">Complete Your <br /> Accession</h1>
          <p className="text-[12px] text-[#1A1A1D]/60 uppercase tracking-[0.2em] font-bold">Verification Required</p>
        </div>
        
        <div className="space-y-6 text-center max-w-md mx-auto">
            <p className="text-[14px] text-[#1A1A1D]/80 tracking-wide leading-relaxed">
              Welcome to **Silk Haus by Follien**. A secure activation link has been dispatched to your inbox. 
              Please click the link to confirm your identity and unlock your exclusive membership access.
            </p>
           
           <div className="bg-[#FAF9F6] p-6 border-l-2 border-black">
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/40 text-left mb-2">Next Destination</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-widest">
                  {next === "/checkout" ? "Secure Checkout" : "Private Dashboard"}
                </span>
                <ChevronRight className="w-4 h-4 text-black/20" />
              </div>
           </div>
        </div>

        <div className="w-16 h-px bg-gray-200 mx-auto mt-12 mb-8"></div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-[#1A1A1D] text-white px-12 py-5 rounded-none text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center gap-3">
            Already Verified? Login <ArrowRight className="w-3 h-3" />
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="border border-gray-100 text-[#1A1A1D]/40 px-12 py-5 rounded-none text-[11px] font-bold uppercase tracking-[0.2em] hover:border-black hover:text-black transition-all"
          >
            Resend Email
          </button>
        </div>

        <p className="text-[10px] uppercase tracking-widest text-[#1A1A1D]/30 pt-8">
          Check your spam folder if the link does not arrive within 60 seconds.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
