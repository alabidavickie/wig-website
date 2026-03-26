"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Mail, ArrowRight, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans text-white transition-colors duration-700">
      <div className="text-center space-y-12 max-w-xl px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Link href="/" className="inline-block group mb-4">
           <div className="w-20 h-20 bg-[#D5A754]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D5A754]/20 group-hover:scale-110 transition-transform">
              <Mail className="w-10 h-10 text-[#D5A754]" />
           </div>
        </Link>

        <div className="space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl uppercase tracking-tighter italic leading-none text-white">Check Your <br /> Email</h1>
          <p className="text-[10px] text-[#D5A754] uppercase tracking-[0.5em] font-bold">Email Verification</p>
        </div>
        
        <div className="space-y-8 text-center max-w-md mx-auto">
            <p className="text-[14px] text-zinc-400 tracking-wide leading-relaxed font-sans">
              We&apos;ve sent a verification link to your email. 
              Please click the link in the email to verify your account and get started.
            </p>
           
           <div className="bg-[#141414] p-8 border-l-2 border-[#D5A754] rounded-sm text-left shadow-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-3">After verifying, you&apos;ll go to</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-white">
                  {next === "/checkout" ? "Checkout" : "Your Dashboard"}
                </span>
                <ChevronRight className="w-4 h-4 text-[#D5A754]/40" />
              </div>
           </div>
        </div>

        <div className="w-16 h-px bg-[#2A2A2D] mx-auto mt-12 mb-8"></div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/login" className="bg-[#D5A754] text-black px-12 py-6 rounded-none text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#E6B964] transition-all flex items-center gap-3">
            Already Verified? Sign In <ArrowRight className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="border border-[#2A2A2D] text-zinc-400 px-12 py-6 rounded-none text-[11px] font-bold uppercase tracking-[0.3em] hover:border-[#D5A754] hover:text-white transition-all bg-[#0A0A0A]"
          >
            Resend Link
          </button>
        </div>

        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 pt-12">
          Check your spam folder if you don&apos;t see the email.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-serif italic text-zinc-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
