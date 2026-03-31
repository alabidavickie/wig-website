"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ShieldCheck, Sparkles, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateCustomerProfile } from "@/lib/actions/customers";

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

          setProfile(profileData ?? {
            first_name: "",
            last_name: "",
            phone: "",
            address_line1: "",
            city: "",
            postal_code: "",
            country: "uk",
          });
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
      await updateCustomerProfile(user.id, profile);
      setSaved(true);
      toast.success("Profile saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const set = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div className="w-full h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-[#D5A754]" />
    </div>
  );

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || (user?.email?.[0] || "U").toUpperCase();

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split("@")[0] || "Member";

  const patronYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  const inputClass = "bg-card border border-border rounded-xl h-14 px-5 text-[14px] text-foreground focus-visible:ring-2 focus-visible:ring-[#D5A754] focus-visible:border-[#D5A754] transition-all placeholder:text-muted-foreground/40 hover:border-[#D5A754]/50 cursor-text";

  return (
    <div className="w-full max-w-4xl min-h-screen text-foreground bg-background mx-auto font-sans p-6 md:p-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-3">Personal Info</p>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tighter uppercase italic leading-none">Your <br />Profile</h1>
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-foreground/30 font-bold">
          Patron Since {patronYear}
        </span>
      </header>

      <div className="space-y-14">

        {/* Avatar + Name */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="relative shrink-0">
            <div className="w-24 h-24 bg-[#D5A754]/10 border-2 border-[#D5A754]/30 overflow-hidden rounded-3xl flex items-center justify-center">
              <span className="text-2xl font-bold text-[#D5A754]">{initials}</span>
            </div>
            <button
              type="button"
              title="Change photo"
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center text-foreground shadow-lg hover:bg-[#D5A754] hover:text-black transition-all"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[16px] font-bold text-foreground uppercase tracking-[0.15em]">{displayName}</h2>
              <span className="bg-[#D5A754]/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#D5A754]" />
                <span className="text-[9px] font-bold text-[#D5A754] uppercase tracking-widest">Verified</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">{user?.email}</p>
            <button
              type="button"
              onClick={() => document.getElementById("profile-footer")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline"
            >
              <Pencil className="w-3 h-3" /> Edit Profile
            </button>
          </div>
        </section>

        {/* Core Info */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-muted-foreground whitespace-nowrap">Core Information</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
              <Input
                value={profile?.first_name || ""}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Enter your first name"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
              <Input
                value={profile?.last_name || ""}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Enter your last name"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Email Address
                <span className="ml-2 text-[9px] text-muted-foreground/50 normal-case font-normal">(cannot be changed here)</span>
              </Label>
              <Input
                value={user?.email || ""}
                readOnly
                type="email"
                className={`${inputClass} opacity-50 cursor-not-allowed hover:border-border`}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <Input
                value={profile?.phone || ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+44 7700 000000"
                type="tel"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Delivery Address */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-muted-foreground whitespace-nowrap">Delivery Address</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-8">
            This address will be auto-filled at checkout so you don&apos;t have to type it every time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Street Address</Label>
              <Input
                value={profile?.address_line1 || ""}
                onChange={(e) => set("address_line1", e.target.value)}
                placeholder="123 Luxury Lane, Apt 4B"
                className={`${inputClass} h-14`}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">City</Label>
              <Input
                value={profile?.city || ""}
                onChange={(e) => set("city", e.target.value)}
                placeholder="London"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Postal Code</Label>
              <Input
                value={profile?.postal_code || ""}
                onChange={(e) => set("postal_code", e.target.value)}
                placeholder="SW1A 1AA"
                className={inputClass}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Country</Label>
              <Select
                value={profile?.country || "uk"}
                onValueChange={(val) => set("country", val)}
              >
                <SelectTrigger className={`${inputClass} w-full`}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-2xl shadow-2xl">
                  <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value="ng">🇳🇬 Nigeria</SelectItem>
                  <SelectItem value="us">🇺🇸 United States</SelectItem>
                  <SelectItem value="fr">🇫🇷 France</SelectItem>
                  <SelectItem value="de">🇩🇪 Germany</SelectItem>
                  <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                  <SelectItem value="au">🇦🇺 Australia</SelectItem>
                  <SelectItem value="gh">🇬🇭 Ghana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Save */}
        <footer id="profile-footer" className="flex items-center gap-4 pt-6 pb-20">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#D5A754] hover:bg-[#E6B964] text-black h-14 px-12 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              toast.info("Changes discarded.");
              window.location.reload();
            }}
            className="border-border bg-transparent hover:bg-secondary text-muted-foreground hover:text-foreground h-14 px-10 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] transition-all"
          >
            Discard
          </Button>
        </footer>

      </div>
    </div>
  );
}
