"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col sticky top-0 h-screen shrink-0 border-r border-border">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-64 z-[70] md:hidden transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-4 px-4 py-4 bg-card border-b border-border sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-secondary rounded-sm transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D5A754]">Dashboard</span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
