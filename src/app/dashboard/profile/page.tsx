"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
          } else {
            // Create an empty profile stub so inputs are controlled
            setProfile({ first_name: "", last_name: "", phone: "", address_line1: "", city: "", postal_code: "", country: "uk" });
          }
        }
      } catch (error) {
        console.error("Profile load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { updateCustomerProfile } = await import("@/lib/actions/customers");
      await updateCustomerProfile(user.id, profile);
      setSaved(true);
      toast.success("Profile updated successfully.");
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
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
    </div>
  );

  const initials = profile?.first_name || profile?.last_name
    ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase()
    : (user?.email?.[0] || "U").toUpperCase();

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split("@")[0] || "Patron";

  const patronDate = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="w-full max-w-5xl min-h-screen text-foreground bg-background mx-auto font-sans p-8 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
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
        <section className="flex flex-col md:flex-row items-start md:items-center gap-12">
          <div className="relative shrink-0 group">
            <div className="w-32 h-32 bg-secondary border border-border overflow-hidden rounded-[40px] shadow-2xl transition-all duration-700 group-hover:scale-105 flex items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{initials}</span>
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center text-foreground shadow-xl hover:bg-secondary transition-all scale-100 group-hover:scale-110">
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
            <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-widest mb-6">Silk Haus Patron</p>
            <div className="flex gap-4">
              <Button
                onClick={() => document.getElementById("profile-form-footer")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-secondary hover:bg-black text-foreground font-bold h-12 px-8 rounded-full text-[10px] uppercase tracking-[0.2em] border-none shadow-xl transition-all"
              >
                Update Profile
              </Button>
            </div>
          </div>
        </section>

        {/* Personal Info Form */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.6em] text-muted-foreground">Core Information</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">First Name</Label>
              <Input
                value={profile?.first_name || ""}
                onChange={(e) => updateProfileField("first_name", e.target.value)}
                placeholder="First Name"
                className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-[#D5A754] transition-all"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Last Name</Label>
              <Input
                value={profile?.last_name || ""}
                onChange={(e) => updateProfileField("last_name", e.target.value)}
                placeholder="Last Name"
                className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-[#D5A754] transition-all"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Email Address</Label>
              <Input
                value={user?.email || ""}
                readOnly
                type="email"
                className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Phone Number</Label>
              <Input
                value={profile?.phone || ""}
                onChange={(e) => updateProfileField("phone", e.target.value)}
                placeholder="+44 7700 000000"
                type="tel"
                className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-[#D5A754] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Shipping Address */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.6em] text-muted-foreground">Delivery Address</h3>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Street Address</Label>
              <Input
                value={profile?.address_line1 || ""}
                onChange={(e) => updateProfileField("address_line1", e.target.value)}
                placeholder="123 Luxury Lane"
                className="bg-secondary border-border rounded-[32px] h-20 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-[#D5A754] transition-all"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">City</Label>
              <Input
                value={profile?.city || ""}
                onChange={(e) => updateProfileField("city", e.target.value)}
                placeholder="London"
                className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-[#D5A754] transition-all"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Postal Code</Label>
              <Input
                value={profile?.postal_code || ""}
                onChange={(e) => updateProfileField("postal_code", e.target.value)}
                placeholder="SW1A 1AA"
                className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus-visible:ring-[#D5A754] transition-all"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Country</Label>
              <Select
                value={profile?.country || "uk"}
                onValueChange={(val) => updateProfileField("country", val)}
              >
                <SelectTrigger className="bg-secondary border-border rounded-full h-16 px-8 text-[12px] font-bold uppercase tracking-widest focus:ring-[#D5A754] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-[24px] shadow-2xl">
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ng">Nigeria</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <footer id="profile-form-footer" className="flex items-center gap-6 pt-10 pb-20">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#D5A754] hover:bg-[#E6B964] text-black h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saved ? "Changes Saved!" : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setProfile((prev: any) => ({ ...prev }));
              toast.info("Changes discarded.");
            }}
            className="border-border bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground h-16 px-12 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] transition-all"
          >
            Discard
          </Button>
          {saved && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 animate-pulse flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Profile updated</span>}
        </footer>
      </div>
    </div>
  );
}
