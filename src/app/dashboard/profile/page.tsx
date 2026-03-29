"use client";

import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, ShieldCheck, User, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          setUser(authUser);
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Profile load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

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

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { updateCustomerProfile } = await import("@/lib/actions/customers");
      await updateCustomerProfile(user.id, profile);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfileField = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
    </div>
  );

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : user?.email?.split('@')[0] || "Patron";

  const patronDate = profile?.created_at 
    ? new Date(profile.created_at).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="w-full max-w-5xl min-h-screen text-[#1A1A1D] bg-white mx-auto font-sans p-8 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8 reveal">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-4">Personal Info</h3>
          <h2 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase italic leading-none">Your <br /> Profile</h2>
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-foreground/30 font-bold mb-4">
          Patron Since {patronDate}
        </div>
      </header>

      <div className="space-y-20">
        {/* Avatar Section */}
        <section className="flex flex-col md:flex-row items-start md:items-center gap-12 reveal">
          <div className="relative shrink-0 group">
            <div className="w-32 h-32 bg-[#FAF9F6] border border-gray-100 overflow-hidden rounded-[40px] shadow-2xl transition-all duration-700 group-hover:scale-105 relative">
               <Image 
                 src={user?.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user?.id}`} 
                 alt="Avatar" 
                 width={128}
                 height={128}
                 className="w-full h-full object-cover" 
               />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-[#1A1A1D] shadow-xl hover:bg-black hover:text-foreground transition-all scale-100 group-hover:scale-110">
               <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col flex-1">
             <div className="flex items-center gap-3 mb-2">
                <h3 className="text-[14px] font-bold text-foreground uppercase tracking-[0.2em]">{displayName}</h3>
                <div className="bg-[#D5A754]/10 px-3 py-1 rounded-full flex items-center gap-2">
                   <Sparkles className="w-3 h-3 text-[#D5A754]" />
                   <span className="text-[9px] font-bold text-[#D5A754] uppercase tracking-widest">Silk Haus Verified</span>
                </div>
             </div>
             <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-widest mb-6">Master Piece Collector & Silk Haus Patron</p>
             <div className="flex gap-4">
                <Button className="bg-secondary hover:bg-black text-foreground font-bold h-12 px-8 rounded-full text-[10px] uppercase tracking-[0.2em] border-none shadow-xl transition-all">
                  Update Profile
                </Button>
                <Button variant="outline" className="border-gray-100 bg-transparent hover:border-white text-muted-foreground hover:text-foreground h-12 px-8 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                  Remove
                </Button>
             </div>
          </div>
        </section>

        {/* Personal Info Form */}
        <section className="reveal">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.6em] text-muted-foreground">Core Information</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Given Name</Label>
                <Input 
                  value={profile?.first_name || ""} 
                  onChange={(e) => updateProfileField("first_name", e.target.value)}
                  placeholder="First Name"
                  className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-black transition-all shadow-sm" 
                />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Surname</Label>
                <Input 
                  value={profile?.last_name || ""} 
                  onChange={(e) => updateProfileField("last_name", e.target.value)}
                  placeholder="Last Name"
                  className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-black transition-all shadow-sm" 
                />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Electronic Mail</Label>
                <Input 
                  value={user?.email || ""} 
                  readOnly
                  type="email" 
                  className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed shadow-sm" 
                />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Direct Line</Label>
                <Input 
                  value={profile?.phone || ""} 
                  onChange={(e) => updateProfileField("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  type="tel" 
                  className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-black transition-all shadow-sm" 
                />
             </div>
          </div>
        </section>

        {/* Shipping Form */}
        <section className="reveal">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.6em] text-muted-foreground">Silk Haus Delivery</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
             <div className="space-y-4 col-span-1 md:col-span-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Street Address</Label>
                <Input
                  value={profile?.address_line1 || ""}
                  onChange={(e) => updateProfileField("address_line1", e.target.value)}
                  placeholder="123 Luxury Lane"
                  className="bg-[#FAF9F6] border-gray-100 rounded-[32px] h-20 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-black transition-all shadow-sm" 
                />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">City / Province</Label>
                <Input 
                  value={profile?.city || ""} 
                  onChange={(e) => updateProfileField("city", e.target.value)}
                  placeholder="City"
                  className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-black transition-all shadow-sm" 
                />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Postal Code</Label>
                <Input 
                  value={profile?.postal_code || ""} 
                  onChange={(e) => updateProfileField("postal_code", e.target.value)}
                  placeholder="Postal Code"
                  className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-black transition-all shadow-sm" 
                />
             </div>
             <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Sovereign State</Label>
                <Select 
                  value={profile?.country || "uk"} 
                  onValueChange={(val) => updateProfileField("country", val)}
                >
                   <SelectTrigger className="bg-[#FAF9F6] border-gray-100 rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus:ring-black transition-all shadow-sm">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-white border-gray-100 text-[#1A1A1D] rounded-[24px] shadow-2xl">
                      <SelectItem value="uk" className="rounded-xl">United Kingdom</SelectItem>
                      <SelectItem value="us" className="rounded-xl">United States</SelectItem>
                      <SelectItem value="fr" className="rounded-xl">France</SelectItem>
                   </SelectContent>
                </Select>
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
             {saved ? "Changes Committed" : "Commit Changes"}
           </Button>
           <Button variant="outline" className="border-gray-100 bg-transparent hover:border-white text-muted-foreground hover:text-foreground h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all">
             Decline
           </Button>
           {saved && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 animate-pulse">Profile updated</span>}
        </footer>

      </div>
    </div>
  );
}
