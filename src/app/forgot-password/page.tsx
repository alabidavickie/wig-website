"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setSuccess(null);
    const result = await forgotPassword(formData);
    if (result?.error) {
      setError(result.error as string);
      setPending(false);
    } else if (result?.success) {
      setSuccess(result.success as string);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-8 hover:text-black transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>
        <h1 className="font-serif text-4xl tracking-[0.2em] uppercase text-[#1A1A1D] mb-8 text-center w-full">SILK HAUS</h1>
        <h2 className="text-[14px] uppercase tracking-widest font-bold text-[#1A1A1D]">Forgot Password</h2>
        <p className="mt-2 text-[12px] text-zinc-300 uppercase tracking-widest">
          Enter your email and we'll send you a recovery link
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-100 sm:px-10">
          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] p-4 uppercase tracking-widest font-bold border-l-2 border-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-600 text-[11px] p-4 uppercase tracking-widest font-bold border-l-2 border-emerald-600">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold" htmlFor="email">Email Address</Label>
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

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-[#1A1A1D] text-white hover:bg-black py-7 rounded-none text-[13px] uppercase tracking-[0.2em] font-medium transition-all"
            >
              {pending ? "Sending..." : "Send Recovery Link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
