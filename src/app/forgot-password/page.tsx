"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, MailCheck, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const email = formData.get("email") as string;
    setSubmittedEmail(email);

    const result = await forgotPassword(formData);
    if (result?.error) {
      setError(result.error as string);
      setPending(false);
    } else if (result?.success) {
      setSent(true);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block group">
          <div className="mb-8 group-hover:scale-105 transition-transform">
            <img src="/images/logo_main.png" alt="Silk Haus Logo" className="w-16 h-auto mx-auto object-contain" />
          </div>
          <h1 className="font-serif text-4xl tracking-[0.3em] uppercase text-foreground mb-2 leading-none">SILK HAUS</h1>
        </Link>
        <h2 className="text-[12px] uppercase tracking-[0.4em] font-bold text-[#D5A754] mb-2 mt-8">Reset Password</h2>
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
          {sent ? "Check your email inbox" : "Enter your email to receive a secure reset link"}
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-10 px-8 border border-border sm:px-12 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D5A754]/30 to-transparent" />

          {sent ? (
            /* Success State */
            <div className="text-center space-y-8 py-4">
              <div className="w-20 h-20 rounded-full bg-[#D5A754]/10 border border-[#D5A754]/30 flex items-center justify-center mx-auto">
                <MailCheck className="w-10 h-10 text-[#D5A754]" />
              </div>
              <div className="space-y-4">
                <h3 className="text-[14px] font-bold uppercase tracking-[0.3em] text-foreground">Email Sent!</h3>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest leading-loose">
                  We sent a password reset link to<br />
                  <span className="text-foreground font-bold">{submittedEmail}</span>
                </p>
              </div>
              <div className="p-6 bg-secondary/50 border border-border rounded-xl space-y-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754]">What to do next:</p>
                <ul className="space-y-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <li>1. Open your email inbox</li>
                  <li>2. Look for an email from Silk Haus</li>
                  <li>3. Check your spam / junk folder too</li>
                  <li>4. Click the link — it expires in 60 minutes</li>
                  <li>5. Set your new password</li>
                </ul>
              </div>
              <div className="pt-2 space-y-4">
                <button
                  onClick={() => { setSent(false); setError(null); }}
                  className="block w-full text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Didn&apos;t receive it? Try again
                </button>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <form action={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-950/20 text-red-400 text-[11px] p-4 uppercase tracking-widest font-bold border border-red-900/50 flex items-center gap-3">
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold ml-1" htmlFor="email">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="rounded-none border-border h-14 text-[13px] text-foreground focus-visible:ring-[#D5A754]/50 bg-background placeholder:text-muted-foreground/50 transition-all border-l-2 focus:border-l-[#D5A754]"
                  placeholder="your@email.com"
                />
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full bg-[#D5A754] text-black hover:bg-[#E6B964] py-8 rounded-none text-[12px] uppercase tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-3"
              >
                {pending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-muted-foreground/50">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.4em]">Secure & encrypted</span>
        </div>
      </div>
    </div>
  );
}
