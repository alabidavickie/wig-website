"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
  }, []);

  const handleSave = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      // Step 1: Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect. Please try again.");
        setIsSaving(false);
        return;
      }

      // Step 2: Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message || "Failed to update password.");
      } else {
        toast.success("Password updated successfully. Please use your new password next time you log in.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl min-h-screen text-foreground bg-background mx-auto font-sans p-8 md:p-12">
      <header className="mb-20">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-4">Security & Preferences</h3>
        <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-tighter italic leading-none">Account <br /> Settings</h1>
      </header>

      <div className="space-y-20">

        {/* Change Password */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Change Password</h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="max-w-2xl space-y-8">
            <div className="p-6 bg-secondary/50 border border-border rounded-2xl text-[11px] text-muted-foreground uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#D5A754] shrink-0" />
              Enter your current password first to verify your identity, then set a new one.
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-secondary border-border rounded-full h-16 px-8 pr-14 text-[13px] font-bold placeholder:text-muted-foreground/40 focus-visible:ring-[#D5A754] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-secondary border-border rounded-full h-16 px-8 pr-14 text-[13px] font-bold placeholder:text-muted-foreground/40 focus-visible:ring-[#D5A754] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && newPassword.length < 8 && (
                <p className="text-red-400 text-[10px] uppercase tracking-widest ml-4">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary border-border rounded-full h-16 px-8 pr-14 text-[13px] font-bold placeholder:text-muted-foreground/40 focus-visible:ring-[#D5A754] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-[10px] uppercase tracking-widest ml-4">Passwords do not match</p>
              )}
            </div>
          </div>
        </section>

        {/* Forgot Password Link */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Forgot Your Password?</h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-6">
            If you forgot your current password, you can request a reset link sent to your email.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline transition-all"
          >
            Request Password Reset Link →
          </a>
        </section>

        {/* Action Buttons */}
        <footer className="flex items-center gap-6 pt-10 pb-20">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#D5A754] hover:bg-[#E6B964] text-black h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isSaving ? "Updating..." : "Update Password"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="border-border bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all"
          >
            Clear
          </Button>
        </footer>

      </div>
    </div>
  );
}
