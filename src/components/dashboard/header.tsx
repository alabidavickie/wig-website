"use client";

import { useEffect, useState } from "react";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("SH");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single();

        const firstName = profile?.first_name || "";
        const lastName = profile?.last_name || "";

        if (firstName || lastName) {
          setDisplayName(`${firstName} ${lastName}`.trim());
          setInitials(`${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "SH");
        } else {
          setDisplayName(user.email?.split("@")[0] || "Member");
          setInitials((user.email?.[0] || "S").toUpperCase());
        }

        if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      } catch {
        // fallback to empty state — no-op
      }
    };
    loadUser();
  }, []);

  return (
    <div className="flex items-center justify-between p-4 bg-background border-b border-border lg:justify-end h-[72px] text-foreground">
      {/* Mobile Hamburger Menu */}
      <MobileSidebar />

      {/* Desktop & Mobile Profile summary in Header */}
      <div className="flex items-center gap-x-4">
        <div className="hidden flex-col items-end sm:flex text-sm">
          <span className="font-bold text-foreground uppercase tracking-widest text-[11px]">
            {displayName || "Member"}
          </span>
          <span className="text-[9px] text-[#D5A754] font-bold uppercase tracking-widest">Member</span>
        </div>
        <div className="relative">
          <Avatar className="h-9 w-9 border border-border">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="bg-secondary text-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#D5A754] rounded-full border border-[#0A0A0A]"></div>
        </div>
      </div>
    </div>
  );
};
