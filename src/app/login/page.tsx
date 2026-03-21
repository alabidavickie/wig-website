"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { loginAndRedirect } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { Crown, ArrowRight, ShieldCheck } from "lucide-react";

function LoginForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAndRedirect(formData, redirectTo);
    if (result?.error) {
      if (typeof result.error === "string") {
        setError(result.error);
      } else if ((result.error as any).message) {
        setError((result.error as any).message);
      } else {
        setError("Invalid login credentials");
      }
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans transition-colors duration-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block group">
           <div className="mb-8 group-hover:scale-105 transition-transform">
              <img src="/images/logo_main.png" alt="Silk Haus Logo" className="w-16 h-auto mx-auto object-contain" />
           </div>
          <h1 className="font-serif text-4xl tracking-[0.3em] uppercase text-white mb-2 leading-none">SILK HAUS</h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.5em] mb-12">Elite Studio Hub</p>
        </Link>
        <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-[#D5A754] mb-2">Welcome Back</h2>
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest">
          Authenticate to access your private studio
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#141414] py-10 px-8 border border-[#2A2A2D] sm:px-12 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5A754]/30 to-transparent"></div>
          
          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-950/20 text-red-400 text-[11px] p-4 uppercase tracking-widest font-bold border border-red-900/50 flex items-center gap-3">
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold ml-1" htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-none border-[#2A2A2D] h-14 text-[13px] text-white focus-visible:ring-[#D5A754]/50 bg-[#0A0A0A] placeholder:text-zinc-700 transition-all border-l-2 focus:border-l-[#D5A754]"
                placeholder="EMAIL@ELITE.COM"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold" htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-[9px] uppercase tracking-[0.2em] text-[#D5A754]/60 hover:text-[#D5A754] font-bold transition-colors">Recover</Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-none border-[#2A2A2D] h-14 text-[13px] text-white focus-visible:ring-[#D5A754]/50 bg-[#0A0A0A] placeholder:text-zinc-700 transition-all border-l-2 focus:border-l-[#D5A754]"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-[#D5A754] text-black hover:bg-[#E6B964] py-8 rounded-none text-[12px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3"
            >
              {pending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full"></div>
                  Authenticating
                </>
              ) : (
                <>
                  Enter Studio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-10 border-t border-[#2A2A2D] text-center space-y-6">
            <Link
              href={redirectTo}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors group"
            >
              Continue as Guest <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
              New to SILK HAUS?{" "}
              <Link href={`/signup${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`} className="font-bold text-[#D5A754] hover:text-[#E6B964] transition-colors underline underline-offset-4">
                Create Access
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 text-zinc-700">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[9px] uppercase tracking-[0.4em]">End-to-End Cryptographic Security</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><p className="font-serif italic text-zinc-400 animate-pulse">Initializing Studio...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
