"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAndRedirect } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/">
          <h1 className="font-serif text-4xl tracking-[0.2em] uppercase text-[#1A1A1D] mb-8">SILK HAUS</h1>
        </Link>
        <h2 className="text-[14px] uppercase tracking-widest font-bold text-[#1A1A1D]">Welcome Back</h2>
        <p className="mt-2 text-[12px] text-[#1A1A1D]/60 uppercase tracking-widest">
          {redirectTo === "/checkout" ? "Sign in to complete your order" : "Sign in to your Silk Haus account"}
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-100 sm:px-10">
          {redirectTo === "/checkout" && (
            <div className="mb-6 bg-amber-50 border-l-2 border-amber-500 p-4 text-[11px] font-bold uppercase tracking-widest text-amber-700">
              Please sign in to complete your checkout
            </div>
          )}

          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] p-4 uppercase tracking-widest font-bold border-l-2 border-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-[#1A1A1D]/40 font-bold" htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-none border-gray-200 h-12 text-[13px] focus-visible:ring-[#1A1A1D] bg-[#FAF9F6]"
                placeholder="EMAIL@EXAMPLE.COM"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-[10px] uppercase tracking-widest text-[#1A1A1D]/40 font-bold" htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-[10px] uppercase tracking-widest text-[#1A1A1D]/40 hover:text-black font-bold">Forgot?</Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-none border-gray-200 h-12 text-[13px] focus-visible:ring-[#1A1A1D] bg-[#FAF9F6]"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-[#1A1A1D] text-white hover:bg-black py-7 rounded-none text-[13px] uppercase tracking-[0.2em] font-medium transition-all"
            >
              {pending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-gray-100 text-center space-y-3">
            <p className="text-[11px] text-[#1A1A1D]/60 uppercase tracking-widest">
              New to SILK HAUS?{" "}
              <Link href={`/signup${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`} className="font-bold text-[#1A1A1D] hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="font-serif italic text-gray-400">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
