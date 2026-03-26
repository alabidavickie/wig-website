"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

function SignupForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setSuccess(null);
    formData.append("redirectTo", redirectTo);
    const result = await signup(formData);
    if (result?.error) {
      if (typeof result.error === "string") {
        setError(result.error);
      } else if (typeof result.error === "object" && "message" in result.error) {
        setError((result.error as { message: string }).message);
      } else {
        setError("Could not create your account. Please try again.");
      }
    }
    setPending(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-16 px-6 lg:px-8 font-sans transition-colors duration-700">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block group">
           <div className="mb-8 group-hover:scale-105 transition-transform">
              <img src="/images/logo_main.png" alt="Silk Haus Logo" className="w-16 h-auto mx-auto object-contain" />
           </div>
          <h1 className="font-serif text-4xl tracking-[0.3em] uppercase text-white mb-2 leading-none">SILK HAUS</h1>
        </Link>
        <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-[#D5A754] mb-2 mt-8">Create Your Account</h2>
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest max-w-sm mx-auto leading-loose">
          {redirectTo === "/checkout" 
            ? "Create an account to complete your order" 
            : "Join Silk Haus to start shopping"}
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#141414] py-10 px-8 border border-[#2A2A2D] sm:px-12 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5A754]/40 to-transparent"></div>
          
          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-950/20 text-red-400 text-[11px] p-4 uppercase tracking-widest font-bold border border-red-900/50 flex items-center gap-3">
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-950/20 text-emerald-400 text-[11px] p-4 uppercase tracking-widest font-bold border border-emerald-900/50 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold ml-1" htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="rounded-none border-[#2A2A2D] h-14 text-[13px] text-white focus-visible:ring-[#D5A754]/50 bg-[#0A0A0A] placeholder:text-zinc-700 transition-all border-l-2 focus:border-l-[#D5A754]"
                  placeholder="First name"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold ml-1" htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="rounded-none border-[#2A2A2D] h-14 text-[13px] text-white focus-visible:ring-[#D5A754]/50 bg-[#0A0A0A] placeholder:text-zinc-700 transition-all border-l-2 focus:border-l-[#D5A754]"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold ml-1" htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-none border-[#2A2A2D] h-14 text-[13px] text-white focus-visible:ring-[#D5A754]/50 bg-[#0A0A0A] placeholder:text-zinc-700 transition-all border-l-2 focus:border-l-[#D5A754]"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold ml-1" htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="rounded-none border-[#2A2A2D] h-14 text-[13px] text-white focus-visible:ring-[#D5A754]/50 bg-[#0A0A0A] placeholder:text-zinc-700 transition-all border-l-2 focus:border-l-[#D5A754]"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={pending}
                className="w-full bg-[#D5A754] text-black hover:bg-[#E6B964] py-8 rounded-none text-[12px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3"
              >
                {pending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-black animate-spin rounded-full"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 pt-10 border-t border-[#2A2A2D] text-center space-y-6">
            <Link
              href={redirectTo === "/checkout" ? "/checkout" : "/shop"}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors group"
            >
              Continue as Guest <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
              Already have an account?{" "}
              <Link href={`/login${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`} className="font-bold text-[#D5A754] hover:text-[#E6B964] transition-colors underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 text-zinc-700">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[9px] uppercase tracking-[0.4em]">Secure & encrypted</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><p className="font-serif italic text-zinc-400 animate-pulse">Loading...</p></div>}>
      <SignupForm />
    </Suspense>
  );
}
