"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSave = async () => {
    if (!newPassword && !currentPassword && !confirmPassword) {
      toast.error("Please enter your new password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast.error(error.message || "Failed to update password.");
      } else {
        toast.success("Password updated successfully.");
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
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full max-w-5xl min-h-screen text-foreground bg-background mx-auto font-sans p-8 md:p-12">
      <header className="mb-20 reveal">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-4">Security & Comfort</h3>
        <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-tighter italic leading-none">Account <br /> Settings</h1>
      </header>

      <div className="space-y-20">
        
        {/* Preferences Form */}
        <section className="reveal">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground">User Preferences</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
             <div className="flex items-center justify-between p-8 bg-[#FAF9F6] rounded-[32px] border border-gray-50 shadow-sm transition-all hover:shadow-xl">
                <div className="space-y-1">
                   <Label className="text-[12px] font-bold text-[#1A1A1D] uppercase tracking-widest">Interface Appearance</Label>
                   <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Toggle Silk Haus Mode</p>
                </div>
                <Switch defaultChecked={false} className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200" />
             </div>

             <div className="flex items-center justify-between p-8 bg-[#FAF9F6] rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
                <div className="space-y-1">
                   <Label className="text-[12px] font-bold text-[#1A1A1D] uppercase tracking-widest">Silk Haus Updates</Label>
                   <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Notifications and Offers</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200" />
             </div>
          </div>
        </section>

        {/* Security Form */}
        <section className="reveal">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Security Master</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Current Password</Label>
                <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[13px] font-bold placeholder:text-[#1A1A1D]/20 focus-visible:ring-black transition-all shadow-sm" />
             </div>
             <div className="hidden md:block"></div>

             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">New Password</Label>
                <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[13px] font-bold placeholder:text-[#1A1A1D]/20 focus-visible:ring-black transition-all shadow-sm" />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Confirm New Password</Label>
                <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[13px] font-bold placeholder:text-[#1A1A1D]/20 focus-visible:ring-black transition-all shadow-sm" />
             </div>
          </div>
        </section>

        {/* Action Buttons */}
        <footer className="flex items-center gap-6 pt-10 pb-20 reveal">
           <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-secondary hover:bg-black text-foreground h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50"
           >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
             {isSaving ? "Updating..." : "Update Password"}
           </Button>
           <Button variant="outline" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} className="border-gray-100 bg-transparent hover:border-white text-muted-foreground hover:text-foreground h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all">
             Discard Changes
           </Button>
        </footer>

      </div>
    </div>
  );
}
