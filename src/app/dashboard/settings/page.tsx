"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, ShieldCheck, Settings2, Star, ChevronRight, UserCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
    <div className="w-full max-w-5xl min-h-screen text-[#1A1A1D] bg-white mx-auto font-sans p-8 md:p-12">
      <header className="mb-20 reveal">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-4">Security & Comfort</h3>
        <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-tighter italic leading-none">Account <br /> Settings</h1>
      </header>

      <div className="space-y-20">
        
        {/* Preferences Form */}
        <section className="reveal">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400">User Preferences</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
             <div className="flex items-center justify-between p-8 bg-[#FAF9F6] rounded-[32px] border border-gray-50 shadow-sm transition-all hover:shadow-xl">
                <div className="space-y-1">
                   <Label className="text-[12px] font-bold text-white uppercase tracking-widest">Interface Appearance</Label>
                   <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Toggle Silk Haus Mode</p>
                </div>
                <Switch defaultChecked={false} className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200" />
             </div>

             <div className="flex items-center justify-between p-8 bg-[#FAF9F6] rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-xl">
                <div className="space-y-1">
                   <Label className="text-[12px] font-bold text-white uppercase tracking-widest">Silk Haus Updates</Label>
                   <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">Notifications and Offers</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200" />
             </div>
             
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Currency Selection</Label>
                <Select defaultValue="usd">
                   <SelectTrigger className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus:ring-black transition-all shadow-sm">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-white border-gray-100 text-[#1A1A1D] rounded-[24px] shadow-2xl">
                      <SelectItem value="usd" className="rounded-xl">USD - US Dollar</SelectItem>
                      <SelectItem value="eur" className="rounded-xl">EUR - Euro</SelectItem>
                      <SelectItem value="gbp" className="rounded-xl">GBP - British Pound</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Preferred Language</Label>
                <Select defaultValue="en">
                   <SelectTrigger className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus:ring-black transition-all shadow-sm">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-white border-gray-100 text-[#1A1A1D] rounded-[24px] shadow-2xl">
                      <SelectItem value="en" className="rounded-xl">English (US)</SelectItem>
                      <SelectItem value="fr" className="rounded-xl">French (FR)</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
        </section>

        {/* Security Form */}
        <section className="reveal">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400">Security Master</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Current Password</Label>
                <Input type="password" placeholder="••••••••" className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[13px] font-bold placeholder:text-[#1A1A1D]/20 focus-visible:ring-black transition-all shadow-sm" />
             </div>
             <div className="hidden md:block"></div>
             
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-4">New Password</Label>
                <Input type="password" placeholder="New Password" className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[13px] font-bold placeholder:text-[#1A1A1D]/20 focus-visible:ring-black transition-all shadow-sm" />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Confirm New Password</Label>
                <Input type="password" placeholder="Confirm Password" className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[13px] font-bold placeholder:text-[#1A1A1D]/20 focus-visible:ring-black transition-all shadow-sm" />
             </div>
          </div>
        </section>

        {/* Action Buttons */}
        <footer className="flex items-center gap-6 pt-10 pb-20 reveal">
           <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1A1A1D] hover:bg-black text-white h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50"
           >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
             {saved ? "Preferences Saved" : "Save Preferences"}
           </Button>
           <Button variant="outline" className="border-gray-100 bg-transparent hover:border-white text-zinc-400 hover:text-white h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all">
             Discard Changes
           </Button>
           {saved && <span className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] animate-pulse">Vault Updated</span>}
        </footer>

      </div>
    </div>
  );
}
