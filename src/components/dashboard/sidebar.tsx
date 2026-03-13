"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingBag, User, Heart, Settings, LogOut, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const routes = [
  { label: "Studio Hub", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Orders", icon: ShoppingBag, href: "/dashboard/orders" },
  { label: "My Profile", icon: User, href: "/dashboard/profile" },
  { label: "Wishlist", icon: Heart, href: "/dashboard/wishlist" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-12 py-10 flex flex-col h-full bg-[#FAF9F6] text-[#1A1A1D] border-r border-gray-100 font-sans">
      <div className="px-8 flex-1">
        <Link href="/" className="flex items-center mb-16 gap-3 group">
          <img src="/images/logo.jpg" alt="Silk Haus Logo" className="w-16 h-auto object-contain transition-transform group-hover:scale-105" />
        </Link>
        
        {/* Navigation Links */}
        <div className="space-y-3">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                href={route.href}
                key={route.href}
                className={cn(
                  "flex items-center px-5 py-4 text-[11px] font-bold transition-all uppercase tracking-[0.2em] rounded-2xl",
                  isActive 
                    ? "text-black bg-white shadow-xl shadow-black/5" 
                    : "text-[#1A1A1D]/40 hover:text-black hover:bg-white/50"
                )}
              >
                <route.icon className={cn("h-4 w-4 mr-4 transition-all", isActive ? "text-black scale-110" : "text-[#1A1A1D]/20")} />
                {route.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto px-8 space-y-4">
        <div className="p-6 bg-white rounded-[32px] shadow-sm border border-gray-50 flex items-center gap-4">
          <div className="relative">
            <img src="https://i.pravatar.cc/150?img=12" alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-[#FAF9F6]" />
            <div className="absolute -bottom-1 -right-0.5 w-5 h-5 bg-[#D5A754] rounded-full flex items-center justify-center border-2 border-white">
              <Crown className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#1A1A1D] uppercase tracking-wider">Elena Vane</span>
            <span className="text-[9px] font-bold text-[#D5A754] uppercase tracking-[0.2em]">Diamond Elite</span>
          </div>
        </div>
        
        <button className="flex items-center justify-center w-full px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-[#1A1A1D]/30 hover:text-black hover:bg-white rounded-2xl">
          <LogOut className="h-4 w-4 mr-3" />
          Secure Logout
        </button>
      </div>
    </div>
  );
};
