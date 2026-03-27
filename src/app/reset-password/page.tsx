"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password === confirmPassword;
  const canSubmit = password.length >= 6 && passwordsMatch && !pending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.set("password", password);

    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-8 hover:text-white transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to Login
        </Link>
        <h1 className="font-serif text-4xl tracking-[0.2em] uppercase text-white mb-8 text-center w-full">SILK HAUS</h1>
        <h2 className="text-[14px] uppercase tracking-widest font-bold text-white">Reset Password</h2>
        <p className="mt-2 text-[12px] text-zinc-400 uppercase tracking-widest">
          Enter your new password below
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#141414] py-8 px-4 border border-[#2A2A2D] sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-[11px] p-4 uppercase tracking-widest font-bold border-l-2 border-red-500">
                {typeof error === "string" ? error : "Please check your password format"}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold" htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-[#2A2A2D] h-12 text-[13px] focus-visible:ring-[#D5A754] bg-[#0A0A0A] text-white placeholder:text-zinc-600"
                placeholder="MINIMUM 6 CHARACTERS"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold" htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-none border-[#2A2A2D] h-12 text-[13px] focus-visible:ring-[#D5A754] bg-[#0A0A0A] text-white placeholder:text-zinc-600"
                placeholder="RE-ENTER YOUR PASSWORD"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-red-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                  Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && (
                <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold mt-1">
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-white text-black hover:bg-[#D5A754] py-7 rounded-none text-[13px] uppercase tracking-[0.2em] font-medium transition-all disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {pending ? "Resetting..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
