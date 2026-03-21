"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingBag, User, Heart, Settings, LogOut, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const routes = [
  { label: "Studio Hub", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "Wishlist", icon: Heart, href: "/dashboard/wishlist" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="space-y-12 py-10 flex flex-col h-full bg-[#0A0A0A] text-white border-r border-[#2A2A2D] font-sans">
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
                    ? "text-[#D5A754] bg-[#1A1A1D] border-l-2 border-[#D5A754]" 
                    : "text-zinc-400 hover:text-white hover:bg-[#141414]"
                )}
              >
                <route.icon className={cn("h-4 w-4 mr-4 transition-all", isActive ? "text-[#D5A754] scale-110" : "text-zinc-400")} />
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-8 space-y-4 pb-4">
        <div className="p-4 bg-[#141414] rounded-sm border border-[#2A2A2D] flex items-center gap-4">
          <div className="relative">
            <img src="https://i.pravatar.cc/150?img=12" alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-[#2A2A2D]" />
            <div className="absolute -bottom-1 -right-0.5 w-4 h-4 bg-[#D5A754] rounded-full flex items-center justify-center border-2 border-[#141414]">
              <Crown className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Elena Vane</span>
            <span className="text-[9px] font-bold text-[#D5A754] uppercase tracking-[0.2em]">Diamond Elite</span>
          </div>
        </div>
        
        <button className="flex items-center justify-center w-full px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-zinc-400 hover:text-white hover:bg-[#1A1A1D] rounded-sm border border-transparent hover:border-[#2A2A2D]">
          <LogOut className="h-4 w-4 mr-4" />
          Secure Logout
        </button>
      </div>
    </div>
  );
};
