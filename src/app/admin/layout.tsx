"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Tag,
  Menu,
  X,
  FileEdit
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
        {children}
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Categories", icon: Tag, href: "/admin/categories" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Content", icon: FileEdit, href: "/admin/content" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const sidebarContent = (
    <>
      <div className="p-8 border-b border-[#2A2A2D] flex items-center gap-3 bg-[#0A0A0A]">
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/logo_main.png" alt="Silk Haus Logo" className="w-8 h-auto object-contain" />
          <span className="font-serif text-lg tracking-[0.2em] font-bold uppercase italic whitespace-nowrap text-white">Silk Haus <span className="font-sans font-normal text-[#D5A754] normal-case tracking-normal">Admin</span></span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-[#D5A754] hover:bg-[#2A2A2D]/30 transition-all group rounded-sm"
          >
            <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2A2A2D]">
        <button className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 w-full transition-all rounded-sm group">
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#141414] border-r border-[#2A2A2D] flex-col sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] lg:hidden animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#141414] z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-[#2A2A2D]`}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#141414]/80 backdrop-blur-md border-b border-[#2A2A2D] px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-[#2A2A2D] transition-colors rounded-sm"
            >
              <Menu className="w-5 h-5 text-[#D5A754]" />
            </button>
            <h2 className="text-[10px] md:text-[12px] font-bold uppercase tracking-[0.3em] text-[#D5A754] truncate max-w-[150px] md:max-w-none">
              Elite Control
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative text-zinc-400 hover:text-white transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D5A754] rounded-full border-2 border-[#141414]"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-[#2A2A2D]">
              <div className="w-8 h-8 bg-[#2A2A2D] border border-[#3F3F46] rounded-sm flex items-center justify-center font-bold text-[10px] md:text-[12px] text-[#D5A754]">
                SH
              </div>
              <div className="hidden sm:block text-[12px]">
                <p className="font-bold uppercase tracking-widest text-[10px] text-white">Silk Haus Admin</p>
                <p className="text-[#D5A754] text-[9px] font-bold uppercase tracking-widest opacity-80">Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
