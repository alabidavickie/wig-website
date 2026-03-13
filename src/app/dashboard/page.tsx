"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Scissors, ChevronRight, Crown, Star, Calendar } from "lucide-react";
import { getOrdersByEmail } from "@/lib/actions/orders";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  // TODO: Replace with real user email from auth context once implemented
  const userEmail = "guest@example.com";
  useEffect(() => {
    setMounted(true);
    // Fetch real orders
    getOrdersByEmail(userEmail).then(data => {
       if (data) setOrders(data);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [userEmail]);

  if (!mounted) return null;

  // Calculate Real Stats
  const itemsOwned = orders.reduce((acc, order) => acc + order.order_items.length, 0);
  const totalSpent = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
  const points = Math.floor(totalSpent * 10); // 10 points per 1 unit spent
  const purchasedItems = orders.flatMap(order => order.order_items).slice(0, 3);

  return (
    <div className="w-full max-w-7xl text-[#1A1A1D] bg-white mx-auto space-y-24 pb-20 font-sans p-8 md:p-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 reveal">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D5A754]/10 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#D5A754]" />
            </div>
            <span className="text-[#1A1A1D]/40 text-[10px] font-bold tracking-[0.4em] uppercase">
              Silk Haus Prestige Access
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-serif tracking-tighter mb-8 uppercase italic leading-none">
            Silk Haus <br /> Hub
          </h1>
          <p className="text-[#1A1A1D]/80 text-[16px] leading-relaxed max-w-xl font-sans">
            Welcome back, Elena. Your status as a <span className="text-[#1A1A1D] font-bold">Diamond Member</span> grants you priority maintenance and bespoke styling privileges in the Elite Studio.
          </p>
        </div>
        <Button className="bg-[#1A1A1D] hover:bg-black text-white px-10 h-16 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl transition-all shrink-0">
          Silk Haus Benefits
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 reveal">
        {/* Card 1 */}
        <div className="bg-[#FAF9F6] p-10 flex flex-col justify-between h-56 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-[#1A1A1D]/30 text-[10px] font-bold tracking-[0.3em] uppercase">Inventory Owned</span>
            <Star className="w-5 h-5 text-[#D5A754] scale-0 group-hover:scale-100 transition-all" />
          </div>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-serif italic text-[#1A1A1D] leading-none">{itemsOwned}</span>
            <span className="text-[#1A1A1D]/40 text-[11px] font-bold pb-2 uppercase tracking-widest">Silk Haus Units</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FAF9F6] p-10 flex flex-col justify-between h-56 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-[#1A1A1D]/30 text-[10px] font-bold tracking-[0.3em] uppercase">Royalty Points</span>
            <Crown className="w-5 h-5 text-[#D5A754] scale-0 group-hover:scale-100 transition-all" />
          </div>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-serif italic text-[#1A1A1D] leading-none">{points > 1000 ? `${(points/1000).toFixed(1)}k` : points}</span>
            <span className="text-[#1A1A1D]/40 text-[11px] font-bold pb-2 uppercase tracking-widest">{points > 5000 ? 'Diamond Tier' : points > 1000 ? 'Gold Tier' : 'Standard'}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#FAF9F6] p-10 flex flex-col justify-between h-56 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-[#1A1A1D]/30 text-[10px] font-bold tracking-[0.3em] uppercase">Maintenance Due</span>
            <Calendar className="w-5 h-5 text-[#D5A754] scale-0 group-hover:scale-100 transition-all" />
          </div>
          <div className="flex items-end gap-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1A1A1D]/30 mb-1">OCTOBER</span>
              <span className="text-6xl font-serif italic text-[#1A1A1D] leading-none">24</span>
            </div>
            <span className="text-[#1A1A1D]/40 text-[10px] font-bold pb-2 max-w-[120px] leading-tight flex-1 uppercase tracking-widest">Silk Haus Wash & Texture Revival</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 reveal">
        {/* Left Side (Spotlight) */}
        <div className="lg:col-span-2 flex flex-col">
           <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#1A1A1D]/40">Spotlight Unit</h3>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          
          <div className="relative overflow-hidden bg-[#FAF9F6] aspect-[16/9] group rounded-[40px] shadow-2xl border border-gray-100">
            <img 
               src="/hero_luxury_wig_1773402385371.png" 
               alt="Spotlight Wig" 
               className="w-full h-full object-cover object-top transition-transform duration-[2s] group-hover:scale-110" 
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-12 pt-32 text-white">
              <div className="flex gap-4 mb-6">
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em] border border-white/20 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full">New Collection</span>
              </div>
              <h2 className="text-5xl font-serif italic mb-6 uppercase tracking-tighter">The Signature <br /> Gold Mist</h2>
              <p className="text-white/60 text-[15px] mb-10 max-w-lg leading-relaxed font-sans">
                Ultra-high density 24" Virgin Slavic hair with a custom-contoured signature HD lace front. Reserve yours for private viewing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-white hover:bg-gray-100 text-black px-10 h-16 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl transition-all">
                  Reserve Unit
                </Button>
                <Button variant="outline" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white px-10 h-16 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all">
                  Silk Haus Details
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Access & Collection) */}
        <div className="flex flex-col gap-16">
          
          {/* Stylist Access */}
          <div className="flex flex-col">
             <div className="flex items-center gap-4 mb-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#1A1A1D]/40">Stylist Link</h3>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>
             <div className="bg-[#1A1A1D] p-10 relative overflow-hidden text-white flex-1 flex flex-col justify-center rounded-[40px] group cursor-pointer shadow-2xl transition-all duration-500 hover:shadow-gold/20">
                <Scissors className="absolute -right-8 top-12 w-48 h-48 text-white/5 transition-transform duration-[1s] group-hover:scale-110 group-hover:-rotate-12" />
                <h4 className="text-4xl font-serif italic uppercase tracking-tighter mb-4 z-10 leading-none">Private <br/> Consultation</h4>
                <p className="text-white/50 text-[14px] mb-10 z-10 font-sans leading-relaxed">
                  Book an exclusive session with our Master Stylist or @follienn to discuss your identity refinement.
                </p>
                <Button className="w-full bg-white hover:bg-gray-100 text-black h-16 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all z-10 shadow-xl">
                  Message Stylist
                </Button>
             </div>
          </div>

          {/* Your Collection */}
          <div className="flex flex-col space-y-10">
             <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#1A1A1D]/40">Owned Units</h3>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>
             <div className="space-y-6">
                {purchasedItems.length > 0 ? purchasedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-6 cursor-pointer group p-3 hover:bg-gray-50 rounded-[20px] transition-all">
                     <div className="w-20 h-20 bg-[#FAF9F6] overflow-hidden shrink-0 rounded-[16px] border border-gray-100 shadow-sm">
                        <img src={item.image_url || "/hero_luxury_wig_1773402385371.png"} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     </div>
                     <div className="flex-1">
                        <h5 className="font-bold text-[13px] text-[#1A1A1D] uppercase tracking-widest mb-1 truncate max-w-[150px]">{item.product_name}</h5>
                        <p className="text-[10px] font-bold text-[#1A1A1D]/30 uppercase tracking-widest">Qty: {item.quantity}</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-[#1A1A1D]/20 group-hover:text-black transition-all group-hover:translate-x-1" />
                  </div>
                )) : (
                  <div className="py-10 text-center text-[11px] font-bold uppercase tracking-widest text-[#1A1A1D]/30 border border-dashed border-gray-200 rounded-[24px]">
                     No acquisitions yet
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
