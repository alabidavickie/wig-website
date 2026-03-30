"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  FileEdit,
  Percent
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  useEffect(() => {
    // Fetch count of orders needing attention (paid/processing) for bell badge
    import("@/lib/actions/orders").then((m) => {
      m.getAllOrders().then((orders) => {
        const count = orders.filter((o: any) => o.status === "paid" || o.status === "processing").length;
        setPendingOrderCount(count);
      }).catch(() => {});
    });
  }, [pathname]); // Re-fetch when navigating

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
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
    { label: "Discounts", icon: Percent, href: "/admin/discounts" },
    { label: "Content", icon: FileEdit, href: "/admin/content" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const sidebarContent = (
    <>
      <div className="p-8 border-b border-border flex items-center gap-3 bg-background">
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/logo_main.png" alt="Silk Haus Logo" className="w-8 h-auto object-contain" />
          <span className="font-serif text-lg tracking-[0.2em] font-bold uppercase italic whitespace-nowrap text-foreground">Silk Haus <span className="font-sans font-normal text-[#D5A754] normal-case tracking-normal">Admin</span></span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-[#D5A754] hover:bg-[#2A2A2D]/30 transition-all group rounded-sm"
          >
            <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 hover:bg-red-500/10 w-full transition-all rounded-sm group cursor-pointer"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col sticky top-0 h-screen">
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
      <aside className={`fixed inset-y-0 left-0 w-64 bg-card z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-border`}>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
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
            <Link href="/admin/orders" className="relative text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              <Bell className="w-5 h-5" />
              {pendingOrderCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {pendingOrderCount > 9 ? "9+" : pendingOrderCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-border">
              <div className="w-8 h-8 bg-[#2A2A2D] border border-border rounded-sm flex items-center justify-center font-bold text-[10px] md:text-[12px] text-[#D5A754]">
                SH
              </div>
              <div className="hidden sm:block text-[12px]">
                <p className="font-bold uppercase tracking-widest text-[10px] text-foreground">Silk Haus Admin</p>
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
