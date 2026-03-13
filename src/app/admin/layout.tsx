"use client";

import { useState } from "react";
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
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/admin" },
    { label: "Categories", icon: Tag, href: "/admin/categories" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-8 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#C5A880] flex items-center justify-center rounded-sm">
          <span className="text-white text-[10px] font-serif font-bold italic text-center">S</span>
        </div>
        <span className="font-serif text-lg tracking-[0.2em] font-bold uppercase italic">Silk Haus <span className="font-sans font-normal text-gray-400 normal-case tracking-normal">Admin</span></span>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-gray-500 hover:text-[#1A1A1D] hover:bg-gray-50 transition-all group"
          >
            <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-red-500 hover:bg-red-50 w-full transition-all rounded-none">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-[#1A1A1D] font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-[12px] md:text-[14px] font-bold uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
              Control Center
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative text-gray-400 hover:text-[#1A1A1D] transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-gray-100">
              <div className="w-8 h-8 bg-[#FAF9F6] border border-gray-100 rounded-sm flex items-center justify-center font-bold text-[10px] md:text-[12px] text-[#C5A880]">
                SH
              </div>
              <div className="hidden sm:block text-[12px]">
                <p className="font-bold uppercase tracking-widest text-[10px]">Silk Haus Admin</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-tighter">Master Access</p>
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
