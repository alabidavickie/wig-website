"use client";

import { useState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<any>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="font-serif text-4xl tracking-[0.2em] uppercase text-white mb-8 text-center w-full">SILK HAUS</h1>
        <h2 className="text-[14px] uppercase tracking-widest font-bold text-white">Reset Password</h2>
        <p className="mt-2 text-[12px] text-zinc-300 uppercase tracking-widest">
          Enter your new password below
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-100 sm:px-10">
          <form action={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] p-4 uppercase tracking-widest font-bold border-l-2 border-red-600">
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
                className="rounded-none border-gray-200 h-12 text-[13px] focus-visible:ring-[#1A1A1D] bg-[#FAF9F6]"
                placeholder="MINIMUM 6 CHARACTERS"
              />
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-[#1A1A1D] text-white hover:bg-black py-7 rounded-none text-[13px] uppercase tracking-[0.2em] font-medium transition-all"
            >
              {pending ? "Resetting..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
