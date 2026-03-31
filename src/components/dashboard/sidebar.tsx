"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingBag, User, Heart, Settings, LogOut, Crown, Bell, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "Wishlist", icon: Heart, href: "/dashboard/wishlist" },
  { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.first_name || data?.last_name) {
            setDisplayName(`${data.first_name || ""} ${data.last_name || ""}`.trim());
          } else {
            setDisplayName(user.email?.split("@")[0] || "Member");
          }
        });
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-12 py-10 flex flex-col h-full bg-background text-foreground border-r border-border font-sans">
      <div className="px-8 flex-1">
        <Link href="/" className="flex items-center mb-16 gap-3 group">
          <img src="/images/logo_main.png" alt="Silk Haus Logo" className="w-16 h-auto object-contain transition-transform group-hover:scale-105" />
        </Link>

        {/* Navigation Links */}
        <div className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                href={route.href}
                key={route.href}
                className={cn(
                  "flex items-center px-5 py-4 text-[11px] font-bold transition-all uppercase tracking-[0.2em] rounded-sm",
                  isActive
                    ? "text-[#D5A754] bg-secondary border-l-2 border-[#D5A754]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                <route.icon className={cn("h-4 w-4 mr-4 transition-all", isActive ? "text-[#D5A754] scale-110" : "text-muted-foreground")} />
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-8 space-y-4 pb-4">
        <div className="p-4 bg-card rounded-sm border border-border flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#D5A754]/20 border-2 border-border flex items-center justify-center">
              <Crown className="w-4 h-4 text-[#D5A754]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider truncate max-w-[120px]">{displayName || "Member"}</span>
            <span className="text-[9px] font-bold text-[#D5A754] uppercase tracking-[0.2em]">Member</span>
          </div>
        </div>

        <Link
          href="/shop"
          className="flex items-center justify-center w-full px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-[#D5A754] hover:bg-secondary rounded-sm border border-[#D5A754]/30 hover:border-[#D5A754]/60"
        >
          <Store className="h-4 w-4 mr-4" />
          Visit Store
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm border border-transparent hover:border-border cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-4" />
          Secure Logout
        </button>
      </div>
    </div>
  );
};
