import { Package, Truck, CheckCircle, Clock, Search, Filter, MoreVertical, Eye } from "lucide-react";
import { format } from "date-fns";
import { getAllOrders } from "@/lib/actions/orders";
import { OrderStatusSelector } from "@/components/admin/order-status-selector";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  // Helper to get status styles
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return { bg: 'bg-blue-500/5', text: 'text-blue-400' };
      case 'shipped': return { bg: 'bg-indigo-500/5', text: 'text-indigo-400' };
      case 'delivered': return { bg: 'bg-emerald-500/5', text: 'text-emerald-400' };
      case 'pending': return { bg: 'bg-amber-500/5', text: 'text-amber-400' };
      default: return { bg: 'bg-zinc-500/5', text: 'text-zinc-400' };
    }
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-white pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Orders</h1>
          <p className="text-zinc-400 text-xs mt-2 uppercase tracking-widest font-bold opacity-80">Review and fulfill luxury hair orders from your clients.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-9 h-9 rounded-full border-2 border-[#141414] bg-[#2A2A2D] flex items-center justify-center text-[10px] font-bold text-[#D5A754] shadow-xl">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
           </div>
           <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">+12 active shoppers</span>
        </div>
      </div>

      {/* Stats Quick View — Live from DB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Pending", value: orders.filter((o: any) => o.status === "pending").length.toString().padStart(2, "0"), icon: Clock, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
          { label: "Processing", value: orders.filter((o: any) => o.status === "paid" || o.status === "processing").length.toString().padStart(2, "0"), icon: Package, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" },
          { label: "Shipped", value: orders.filter((o: any) => o.status === "shipped").length.toString().padStart(2, "0"), icon: Truck, color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" },
          { label: "Fulfilled", value: orders.filter((o: any) => o.status === "delivered").length.toString(), icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141414] p-6 border border-[#2A2A2D] shadow-sm flex items-center gap-5 group hover:border-[#D5A754]/30 transition-all rounded-sm">
            <div className={`p-3.5 ${stat.bg} ${stat.color} border ${stat.border} rounded-sm group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#141414] border border-[#2A2A2D] shadow-sm rounded-sm">
        <div className="p-6 border-b border-[#2A2A2D] flex flex-col sm:flex-row gap-6 justify-between items-center bg-[#0A0A0A]/30">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D5A754] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID or Customer..." 
              className="w-full pl-12 pr-4 py-3 text-[12px] font-bold uppercase tracking-widest border-[#2A2A2D] focus:border-[#D5A754] focus:ring-0 transition-colors bg-[#0A0A0A] placeholder:text-zinc-700 outline-none"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 border border-[#2A2A2D] text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white transition-all bg-[#0A0A0A]">
            <Filter className="w-4 h-4 text-[#D5A754]" /> Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1A1A1D] text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 border-b border-[#2A2A2D]">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Items</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                    No active orders in the fulfillment queue.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const statusInfo = getStatusInfo(order.status);
                  const itemCount = order.order_items.reduce((acc: number, item: any) => acc + item.quantity, 0);
                  const productsPreview = order.order_items.map((item: any) => item.product_name).join(", ");
                  
                  return (
                    <tr key={order.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-[12px] font-bold font-mono text-zinc-400 group-hover:text-white transition-colors uppercase">{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold uppercase tracking-wide text-white">{order.email}</span>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1 opacity-70">{format(new Date(order.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] text-zinc-400 uppercase tracking-widest max-w-xs truncate italic">
                        {itemCount} {itemCount === 1 ? 'Unit' : 'Units'}: {productsPreview}
                      </td>
                      <td className="px-8 py-6 text-[13px] font-bold text-white tracking-tighter">
                        ${Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                          {order.is_guest && (
                            <span className="px-3 py-1 text-[8px] font-black uppercase tracking-tighter bg-zinc-800 text-zinc-400 border border-zinc-700 w-fit rounded-sm">
                              Guest Account
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/admin/orders/${order.id}`} className="p-2.5 border border-[#2A2A2D] hover:border-white hover:text-white text-zinc-400 transition-all rounded-sm bg-[#0A0A0A] inline-block">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
