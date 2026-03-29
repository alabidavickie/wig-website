"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { CheckCircle, Loader2, AlertTriangle, ShoppingBag, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface VerifyResult {
  verified: boolean;
  status?: string;
  provider?: string;
  email?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

function SuccessContent() {
  const { clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cleared, setCleared] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const sessionId = searchParams.get("session_id");
  const reference = searchParams.get("reference");
  const provider = searchParams.get("provider");

  // Server-side verification
  const verifyPayment = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.set("session_id", sessionId);
      if (reference) params.set("reference", reference);
      if (provider) params.set("provider", provider || "");

      const res = await fetch(`/api/checkout/verify?${params.toString()}`);
      const data: VerifyResult = await res.json();
      setResult(data);

      // Clear cart only on verified payment
      if (data.verified && !cleared) {
        clearCart();
        setCleared(true);
      }
    } catch {
      setResult({ verified: false, error: "Verification failed" });
    } finally {
      setVerifying(false);
    }
  }, [sessionId, reference, provider, cleared, clearCart]);

  useEffect(() => {
    if (sessionId || reference) {
      verifyPayment();
    } else {
      setVerifying(false);
      setResult({ verified: false, error: "No payment reference found" });
    }
  }, [sessionId, reference, verifyPayment]);

  // Fast auto-redirect after verification
  useEffect(() => {
    if (!result?.verified) return;
    router.push("/dashboard/orders");
  }, [result?.verified, router]);

  // --- Loading State ---
  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans text-foreground">
        <div className="text-center space-y-8 max-w-lg px-6 animate-in fade-in duration-500">
          <div className="relative mx-auto w-24 h-24">
            <Loader2 className="w-24 h-24 text-[#D5A754] animate-spin" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-tighter italic leading-none">
            Verifying<br />Payment
          </h1>
          <p className="text-[14px] text-zinc-300 tracking-wide leading-relaxed">
            Securely confirming your payment with{" "}
            <span className="font-bold text-foreground uppercase tracking-widest">{provider}</span>...
          </p>
        </div>
      </div>
    );
  }

  // --- Failed Verification ---
  if (!result?.verified) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans text-foreground">
        <div className="text-center space-y-8 max-w-lg px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AlertTriangle className="w-20 h-20 text-amber-500 mx-auto" />
          <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-tighter italic leading-none">
            Payment<br />Unverified
          </h1>
          <p className="text-[14px] text-zinc-300 tracking-wide leading-relaxed max-w-sm mx-auto">
            We could not verify your payment at this time. If you believe this is an error, please contact our support team.
          </p>
          {result?.error && (
            <p className="text-[11px] text-red-500/70 font-mono">{result.error}</p>
          )}
          <div className="flex gap-4 justify-center mt-12">
            <Link
              href="/contact"
              className="bg-black text-foreground px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
            >
              Contact Support
            </Link>
            <Link
              href="/shop"
              className="border border-gray-200 text-foreground px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:border-white transition-all"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans text-[#1A1A1D]">
      <div className="text-center space-y-8 max-w-lg px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Animated check with gold ring */}
        <div className="relative mx-auto w-28 h-28">
          <div className="absolute inset-0 rounded-full border-2 border-[#D5A754]/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-[#D5A754]/30" />
          <CheckCircle className="w-28 h-28 text-emerald-500 relative z-10" />
        </div>

        <h1 className="font-serif text-5xl md:text-6xl uppercase tracking-tighter italic leading-none">
          Order<br />Confirmed
        </h1>

        <div className="space-y-4">
          <p className="text-[14px] text-zinc-300 tracking-wide leading-relaxed">
            Your luxury acquisition has been verified and confirmed via{" "}
            <span className="font-bold text-foreground uppercase tracking-widest">{result.provider}</span>.
          </p>

          {result.amount && result.currency && (
            <p className="text-[18px] font-bold font-serif italic text-foreground">
              {result.currency === "GBP" ? "£" : result.currency === "NGN" ? "₦" : "$"}
              {result.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          )}

          {reference && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Ref: {reference}
            </p>
          )}
          {sessionId && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Session: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>

        <div className="w-16 h-px bg-gray-200 mx-auto my-8"></div>

        <p className="text-[12px] font-bold uppercase tracking-widest text-[#D5A754]">
          Our team is preparing your order for dispatch.
        </p>

        <div className="flex items-center justify-center pt-8">
           <Loader2 className="w-8 h-8 text-[#D5A754] animate-spin" />
           <span className="ml-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Redirecting to Dashboard...</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center gap-3 bg-black text-foreground px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 border border-gray-200 text-foreground px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:border-white transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessContent />
    </Suspense>
  );
}
