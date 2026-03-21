"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scissors, ChevronRight, Crown, Star, Calendar } from "lucide-react";
import { type OrderWithItems } from "@/lib/actions/orders";
import DashboardLoading from "./loading";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const loadData = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          setUser(authUser);
          
          // Check for admin role
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authUser.id)
            .single();
          
          if (profile?.role === "admin") {
            setIsAdmin(true);
          }

          const { getOrdersByUserId } = await import("@/lib/actions/orders");
          const data = await getOrdersByUserId(authUser.id);
          if (data && Array.isArray(data)) {
            setOrders(data);
          }
        }
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
      return () => {
        observer.disconnect();
      };
    }
  }, [mounted, isLoading]);

  if (!mounted || isLoading) return <DashboardLoading />;

  // Calculate Real Stats
  const itemsOwned = orders.reduce((acc, order) => acc + (order.order_items?.length || 0), 0);
  const totalSpent = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
  const points = Math.floor(totalSpent * 10);
  const purchasedItems = orders.flatMap(order => order.order_items || []).slice(0, 3);

  // Dynamic Tier
  const tier = totalSpent > 5000 ? "Diamond Member" : totalSpent > 1000 ? "Gold Member" : "Silk Patron";
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || "Patron";

  return (
    <div className="w-full max-w-7xl text-white bg-[#0A0A0A] mx-auto space-y-24 pb-20 font-sans p-8 md:p-12 min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 reveal">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D5A754]/10 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#D5A754]" />
            </div>
            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.4em] uppercase">
              Silk Haus Prestige Access
            </span>
          </div>
          <h1 className="text-5xl md:text-8xl font-serif tracking-tighter mb-8 uppercase italic leading-none text-white">
            Silk Haus <br /> Hub
          </h1>
          <p className="text-zinc-400 text-[16px] leading-relaxed max-w-xl font-sans">
            Welcome back, {firstName}. Your status as a <span className="text-[#D5A754] font-bold">{tier}</span> grants you priority maintenance and bespoke styling privileges.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="border-[#D5A754]/50 text-[#D5A754] hover:bg-[#D5A754] hover:text-black px-10 h-16 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] transition-all shrink-0 w-full">
                Admin Console
              </Button>
            </Link>
          )}
          <Button className="bg-[#D5A754] hover:bg-[#E6B964] text-black px-10 h-16 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] transition-all shrink-0">
            Silk Haus Benefits
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 reveal">
        {/* Card 1 */}
        <div className="bg-[#141414] p-10 flex flex-col justify-between h-56 rounded-sm border border-[#2A2A2D] hover:border-[#D5A754]/30 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase">Inventory Owned</span>
            <Star className="w-5 h-5 text-[#D5A754] scale-0 group-hover:scale-100 transition-all" />
          </div>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-serif italic text-white leading-none">{itemsOwned}</span>
            <span className="text-zinc-500 text-[11px] font-bold pb-2 uppercase tracking-widest">Units</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#141414] p-10 flex flex-col justify-between h-56 rounded-sm border border-[#2A2A2D] hover:border-[#D5A754]/30 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase">Royalty Points</span>
            <Crown className="w-5 h-5 text-[#D5A754] scale-0 group-hover:scale-100 transition-all" />
          </div>
          <div className="flex items-end gap-4">
            <span className="text-6xl font-serif italic text-white leading-none">{points > 1000 ? `${(points/1000).toFixed(1)}k` : points}</span>
            <span className="text-zinc-500 text-[11px] font-bold pb-2 uppercase tracking-widest">{points > 5000 ? 'Diamond Tier' : points > 1000 ? 'Gold Tier' : 'Standard'}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#141414] p-10 flex flex-col justify-between h-56 rounded-sm border border-[#2A2A2D] hover:border-[#D5A754]/30 transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase">Maintenance Due</span>
            <Calendar className="w-5 h-5 text-[#D5A754] scale-0 group-hover:scale-100 transition-all" />
          </div>
          <div className="flex items-end gap-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D5A754] mb-1">{orders.length > 0 ? 'OCTOBER' : 'SCHEDULE'}</span>
              <span className="text-6xl font-serif italic text-white leading-none">{orders.length > 0 ? '24' : '—'}</span>
            </div>
            <span className="text-zinc-500 text-[10px] font-bold pb-2 max-w-[120px] leading-tight flex-1 uppercase tracking-widest">{orders.length > 0 ? 'Silk Haus Revival' : 'No Active Plan'}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 reveal">
        {/* Left Side (Spotlight) */}
        <div className="lg:col-span-2 flex flex-col">
           <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-500">Spotlight Unit</h3>
            <div className="flex-1 h-px bg-[#2A2A2D]"></div>
          </div>
          
          <div className="relative overflow-hidden bg-[#141414] aspect-[16/9] group rounded-sm border border-[#2A2A2D]">
            <img 
               src="/hero_luxury_wig_1773402385371.png" 
               alt="Spotlight Wig" 
               className="w-full h-full object-cover object-top transition-transform duration-[2s] group-hover:scale-110 opacity-80" 
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12 pt-32 text-white">
              <div className="flex gap-4 mb-6">
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.4em] border border-[#D5A754]/30 px-4 py-2 bg-[#D5A754]/10 backdrop-blur-md rounded-sm">New Collection</span>
              </div>
              <h2 className="text-5xl font-serif italic mb-6 uppercase tracking-tighter">The Signature <br /> Gold Mist</h2>
              <p className="text-zinc-400 text-[15px] mb-10 max-w-lg leading-relaxed font-sans">
                Ultra-high density 24" Virgin Slavic hair with a custom-contoured signature HD lace front.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-[#D5A754] hover:bg-[#E6B964] text-black px-10 h-16 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] transition-all">
                  Reserve Unit
                </Button>
                <Button variant="outline" className="border-[#2A2A2D] bg-[#1A1A1D]/50 backdrop-blur-sm hover:bg-[#1A1A1D] text-white px-10 h-16 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] transition-all">
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
              <h3 className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-500">Stylist Link</h3>
              <div className="flex-1 h-px bg-[#2A2A2D]"></div>
            </div>
             <div className="bg-[#141414] p-10 relative overflow-hidden text-white flex-1 flex flex-col justify-center rounded-sm group cursor-pointer border border-[#2A2A2D] transition-all duration-500 hover:border-[#D5A754]/50">
                <Scissors className="absolute -right-8 top-12 w-48 h-48 text-white/5 transition-transform duration-[1s] group-hover:scale-110 group-hover:-rotate-12" />
                <h4 className="text-4xl font-serif italic uppercase tracking-tighter mb-4 z-10 leading-none">Private <br/> Consultation</h4>
                <p className="text-zinc-500 text-[14px] mb-10 z-10 font-sans leading-relaxed">
                  Book an exclusive session with our Master Stylist or @follien.
                </p>
                <Button className="w-full bg-white hover:bg-zinc-200 text-black h-16 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] transition-all z-10 shadow-xl">
                  Message Stylist
                </Button>
             </div>
          </div>

          {/* Your Collection */}
          <div className="flex flex-col space-y-10">
             <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-500">Owned Units</h3>
              <div className="flex-1 h-px bg-[#2A2A2D]"></div>
            </div>
             <div className="space-y-6">
                {purchasedItems.length > 0 ? purchasedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-6 cursor-pointer group p-3 hover:bg-[#141414] rounded-sm transition-all border border-transparent hover:border-[#2A2A2D]">
                     <div className="w-20 h-20 bg-[#1A1A1D] overflow-hidden shrink-0 rounded-sm border border-[#2A2A2D]">
                        <img src={item.image_url || "/hero_luxury_wig_1773402385371.png"} alt={item.product_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                     </div>
                     <div className="flex-1">
                        <h5 className="font-bold text-[13px] text-white uppercase tracking-widest mb-1 truncate max-w-[150px]">{item.product_name}</h5>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Qty: {item.quantity}</p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#D5A754] transition-all group-hover:translate-x-1" />
                  </div>
                )) : (
                  <div className="py-10 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-600 border border-dashed border-[#2A2A2D] rounded-sm">
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
