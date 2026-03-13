"use client";

import { BarChart3, TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Package, Tag, Layers } from "lucide-react";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = [
    { label: "Conversion Rate", value: "3.2%", change: "+0.4%", trend: "up" },
    { label: "Bounce Rate", value: "24.5%", change: "-2.1%", trend: "up" },
    { label: "Avg. Session", value: "4m 32s", change: "+12s", trend: "up" },
    { label: "Retained Customers", value: "42%", change: "+5%", trend: "up" },
  ];

  const categoryPerformance = [
    { name: "HD Lace Frontals", sales: 45, revenue: "$56,250", color: "bg-[#1A1A1D]" },
    { name: "Silk Top Wigs", sales: 28, revenue: "$32,480", color: "bg-[#C5A880]" },
    { name: "Raw Hair Bundles", sales: 62, revenue: "$18,600", color: "bg-gray-400" },
    { name: "Glueless Wigs", sales: 15, revenue: "$12,750", color: "bg-gray-200" },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Business Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Deep dive into your luxury performance metrics.</p>
      </header>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-12 h-12" />
             </div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">{m.label}</h3>
             <div className="flex items-end gap-3">
                <p className="text-3xl font-bold tracking-tighter">{m.value}</p>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 mb-1 ${m.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                   {m.change}
                   {m.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <div className="bg-white p-8 border border-gray-100 shadow-sm">
          <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#1A1A1D] pl-4 mb-8 text-[#1A1A1D]">Category Revenue Share</h3>
          <div className="space-y-8">
            {categoryPerformance.map((c) => (
              <div key={c.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{c.name}</span>
                  <span className="text-[12px] font-bold">{c.revenue}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${c.color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${(parseInt(c.revenue.replace(/[^0-9]/g, '')) / 120000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources Mockup */}
        <div className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#1A1A1D] pl-4 mb-10 text-[#1A1A1D]">Acquisition Channels</h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {[
              { label: "Social Media (IG/TikTok)", value: "58%", color: "bg-[#C5A880]" },
              { label: "Direct Search", value: "22%", color: "bg-[#1A1A1D]" },
              { label: "Referrals", value: "12%", color: "bg-gray-400" },
              { label: "Email Marketing", value: "8%", color: "bg-gray-200" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-6 group">
                <div className={`w-3 h-3 ${s.color} shrink-0`}></div>
                <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-[#1A1A1D] transition-colors">{s.label}</span>
                <span className="text-[12px] font-bold text-[#1A1A1D]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights Section */}
      <div className="bg-[#FAF9F6] border border-gray-200 p-8 flex flex-col md:flex-row gap-12 items-center">
         <div className="shrink-0">
            <div className="w-24 h-24 bg-white border border-gray-100 flex items-center justify-center rounded-full shadow-lg">
               <Users className="w-10 h-10 text-[#C5A880]" />
            </div>
         </div>
         <div className="flex-1 space-y-4">
            <h4 className="text-[14px] font-serif font-bold italic tracking-wide uppercase">Elite Patron Profile</h4>
            <p className="text-[12px] text-gray-500 leading-relaxed uppercase tracking-widest">
              Most active purchasers are based in <span className="text-[#1A1A1D] font-bold">Lagos, London, and Atlanta</span>. 
              Top preferred texture is <span className="text-[#1A1A1D] font-bold">Raw Yaki Straight</span>. 
              Peak shopping hour is <span className="text-[#1A1A1D] font-bold">9:00 PM WAT</span>.
            </p>
         </div>
         <button className="bg-[#1A1A1D] text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all">
            Export Customer Data
         </button>
      </div>
    </div>
  );
}
