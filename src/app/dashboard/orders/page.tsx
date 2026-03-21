import { OrdersTable } from "@/components/dashboard/orders-table";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { getOrdersByUserId } from "@/lib/actions/orders";

export default async function OrdersPage() {
  const supabase = await (await import("@/lib/supabase/server")).createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }

  const userId = user!.id;
  const orders = await getOrdersByUserId(userId);

  // Find most recent active order (not delivered/cancelled)
  const activeOrder = orders.find(o => 
    o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const pastOrders = orders.filter(o => o.id !== activeOrder?.id);
  return ( 
    <div className="flex flex-col gap-10 w-full max-w-6xl mx-auto text-white bg-[#0A0A0A] p-8 font-sans min-h-screen">
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-3xl font-serif text-white tracking-widest uppercase mb-2">Order History</h2>
          <p className="text-zinc-500 text-sm">Track shipments and review your Silk Haus acquisitions.</p>
        </div>
        <Button variant="outline" className="border-[#2A2A2D] bg-transparent text-white hover:bg-[#141414] text-xs h-10 px-6 rounded-none font-medium uppercase tracking-widest transition-colors">
          Help Center
        </Button>
      </div>

      <div className="space-y-12">
        {/* Active Order Tracker (Only show if there is an active order) */}
        {activeOrder ? (
          <div className="bg-[#141414] border border-[#2A2A2D] p-8 md:p-12 mb-16 relative overflow-hidden group">
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D5A754]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D5A754] mb-2">Active Commission</h2>
                <div className="flex items-center gap-4">
                  <p className="font-serif italic text-3xl md:text-4xl text-white">Order #SH-{activeOrder.id.slice(0, 8)}</p>
                  <span className="bg-[#1A1A1D] border border-[#2A2A2D] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#D5A754]">
                    {activeOrder.status}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">Estimated Arrival</p>
                <p className="text-[14px] font-bold text-white uppercase tracking-widest">
                  {activeOrder.status === 'shipped' ? 'In 2-3 Days' : 'Processing...'}
                </p>
              </div>
            </div>

            {/* Minimalist 4-Stage Stepper */}
            <div className="relative mt-4">
              <div className="relative pt-6 pb-2 z-10 w-full overflow-x-auto hide-scrollbar">
                <div className="min-w-[600px] md:min-w-full">
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-[#2A2A2D] z-0 hidden md:block"></div>
                  
                  {/* Progress Line Fill */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] bg-[#D5A754] z-0 hidden md:block transition-all duration-1000 ease-out" 
                    style={{ 
                      width: activeOrder.status === 'pending' ? '12%' : 
                             (activeOrder.status === 'paid' || activeOrder.status === 'processing') ? '37%' : 
                             activeOrder.status === 'shipped' ? '62%' : 
                             activeOrder.status === 'delivered' ? '100%' : '0%' 
                    }}
                  ></div>

                  <div className="relative z-10 flex justify-between">
                    {[
                      { icon: Clock, label: "Order Placed", active: true, done: true },
                      { icon: Package, label: "Processing", active: activeOrder.status === 'paid' || activeOrder.status === 'processing' || activeOrder.status === 'shipped', done: activeOrder.status === 'shipped' || activeOrder.status === 'delivered' },
                      { icon: Truck, label: "Shipped", active: activeOrder.status === 'shipped', done: activeOrder.status === 'delivered' },
                      { icon: CheckCircle2, label: "Delivered", active: activeOrder.status === 'delivered', done: activeOrder.status === 'delivered' }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center gap-4 relative group cursor-default">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 bg-[#0A0A0A]
                          ${step.done ? 'border-[#D5A754] text-black bg-[#D5A754]' : step.active ? 'border-[#D5A754] text-white shadow-[0_0_20px_rgba(213,167,84,0.1)]' : 'border-[#2A2A2D] text-zinc-700'}`}
                        >
                          <step.icon className={`w-5 h-5 ${step.active && !step.done ? 'animate-pulse' : ''}`} />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 whitespace-nowrap
                          ${step.active || step.done ? 'text-white' : 'text-zinc-700'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#141414] border border-dashed border-[#2A2A2D] py-16 text-center mb-16 rounded-[24px]">
             <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-700">No active commissions</p>
          </div>
        )}

        {/* Past Orders Table */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#D5A754]">Order History</h3>
          </div>
          <OrdersTable orders={pastOrders} />
        </div>
      </div>
    </div>
   );
}
