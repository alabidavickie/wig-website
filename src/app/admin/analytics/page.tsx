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
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-white">
      <header>
        <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Business Analytics</h1>
        <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-widest font-bold">Deep dive into your luxury performance metrics.</p>
      </header>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-[#141414] p-6 border border-[#2A2A2D] shadow-sm relative overflow-hidden group rounded-sm transition-all hover:border-[#D5A754]/30">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-12 h-12 text-[#D5A754]" />
             </div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">{m.label}</h3>
             <div className="flex items-end gap-3">
                <p className="text-3xl font-bold tracking-tighter">{m.value}</p>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 mb-1 ${m.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {m.change}
                   {m.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance */}
        <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm rounded-sm">
          <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-8">Category Revenue Share</h3>
          <div className="space-y-8">
            {categoryPerformance.map((c) => (
              <div key={c.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{c.name}</span>
                  <span className="text-[12px] font-bold text-white tracking-widest">{c.revenue}</span>
                </div>
                <div className="h-1.5 w-full bg-[#0A0A0A] rounded-full overflow-hidden border border-[#2A2A2D]">
                  <div 
                    className={`h-full ${c.color === 'bg-[#C5A880]' ? 'bg-[#D5A754]' : 'bg-[#2A2A2D]'} transition-all duration-1000 ease-out`} 
                    style={{ width: `${(parseInt(c.revenue.replace(/[^0-9]/g, '')) / 120000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources Mockup */}
        <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm flex flex-col rounded-sm">
          <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-10">Acquisition Channels</h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {[
              { label: "Social Media (IG/TikTok)", value: "58%", color: "bg-[#D5A754]" },
              { label: "Direct Search", value: "22%", color: "bg-[#2A2A2D]" },
              { label: "Referrals", value: "12%", color: "bg-zinc-800" },
              { label: "Email Marketing", value: "8%", color: "bg-[#1A1A1D]" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-6 group">
                <div className={`w-3 h-3 ${s.color} shrink-0`}></div>
                <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{s.label}</span>
                <span className="text-[12px] font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights Section */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2D] p-8 flex flex-col md:flex-row gap-12 items-center rounded-sm">
         <div className="shrink-0">
            <div className="w-24 h-24 bg-[#141414] border border-[#2A2A2D] flex items-center justify-center rounded-full shadow-2xl">
               <Users className="w-10 h-10 text-[#D5A754]" />
            </div>
         </div>
         <div className="flex-1 space-y-4 text-center md:text-left">
            <h4 className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#D5A754]">Elite Patron Profile</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed uppercase tracking-widest">
              Most active purchasers are based in <span className="text-white font-bold">Lagos, London, and Atlanta</span>. 
              Top preferred texture is <span className="text-white font-bold">Raw Yaki Straight</span>. 
              Peak shopping hour is <span className="text-white font-bold">9:00 PM WAT</span>.
            </p>
         </div>
         <button className="bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all rounded-sm flex items-center gap-3">
            <DollarSign className="w-4 h-4" />
            Export Insights
         </button>
      </div>
    </div>
  );
}
