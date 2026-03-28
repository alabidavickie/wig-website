"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, Search, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { OrderStatusSelector } from "@/components/admin/order-status-selector";
import Link from "next/link";

interface OrderItem {
  quantity: number;
  product_name: string;
}

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_provider?: string;
  created_at: string;
  order_items: OrderItem[];
  is_guest?: boolean;
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.email.toLowerCase().includes(q) ||
      order.order_items.some((item) =>
        item.product_name.toLowerCase().includes(q)
      )
    );
  });

  const handleExportCSV = () => {
    const rows = [
      ["Order ID", "Customer Email", "Date", "Items", "Total", "Currency", "Payment Provider", "Status", "Guest"],
      ...filteredOrders.map(order => [
        order.id,
        order.email,
        new Date(order.created_at).toISOString(),
        order.order_items.map(i => `${i.product_name} x${i.quantity}`).join("; "),
        Number(order.total_amount).toFixed(2),
        order.currency ?? "",
        order.payment_provider ?? "",
        order.status,
        order.is_guest ? "Yes" : "No",
      ]),
    ];

    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `silk-haus-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to get status styles
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return { bg: 'bg-blue-500/5', text: 'text-blue-400' };
      case 'shipped': return { bg: 'bg-indigo-500/5', text: 'text-indigo-400' };
      case 'delivered': return { bg: 'bg-emerald-500/5', text: 'text-emerald-400' };
      case 'pending': return { bg: 'bg-amber-500/5', text: 'text-amber-400' };
      default: return { bg: 'bg-zinc-500/5', text: 'text-muted-foreground' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-foreground pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Orders</h1>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold opacity-80">Review and fulfill luxury hair orders from your clients.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-9 h-9 rounded-full border-2 border-[#141414] bg-[#2A2A2D] flex items-center justify-center text-[10px] font-bold text-[#D5A754] shadow-xl">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
           </div>
           <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">+{orders.length} orders</span>
        </div>
      </div>

      {/* Stats Quick View — Live from DB */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Pending", value: orders.filter((o: Order) => o.status === "pending").length.toString().padStart(2, "0"), icon: Clock, color: "text-amber-400", bg: "bg-amber-400/5", border: "border-amber-400/20" },
          { label: "Processing", value: orders.filter((o: Order) => o.status === "paid" || o.status === "processing").length.toString().padStart(2, "0"), icon: Package, color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" },
          { label: "Shipped", value: orders.filter((o: Order) => o.status === "shipped").length.toString().padStart(2, "0"), icon: Truck, color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" },
          { label: "Fulfilled", value: orders.filter((o: Order) => o.status === "delivered").length.toString(), icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card p-6 border border-border shadow-sm flex items-center gap-5 group hover:border-[#D5A754]/30 transition-all rounded-sm">
            <div className={`p-3.5 ${stat.bg} ${stat.color} border ${stat.border} rounded-sm group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border shadow-sm rounded-sm">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-6 justify-between items-center bg-background/30">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#D5A754] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID, Customer, or Product..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-[12px] font-bold uppercase tracking-widest border-border focus:border-[#D5A754] focus:ring-0 transition-colors bg-background placeholder:text-muted-foreground/50 outline-none"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white transition-all bg-background"
          >
            <Download className="w-4 h-4 text-[#D5A754]" /> Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Items</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                    {searchQuery ? "No orders match your search." : "No active orders in the fulfillment queue."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: Order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const itemCount = order.order_items.reduce((acc: number, item: OrderItem) => acc + item.quantity, 0);
                  const productsPreview = order.order_items.map((item: OrderItem) => item.product_name).join(", ");
                  
                  return (
                    <tr key={order.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="text-[12px] font-bold font-mono text-muted-foreground group-hover:text-foreground transition-colors uppercase">{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold uppercase tracking-wide text-foreground">{order.email}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-70">{format(new Date(order.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] text-muted-foreground uppercase tracking-widest max-w-xs truncate italic">
                        {itemCount} {itemCount === 1 ? 'Unit' : 'Units'}: {productsPreview}
                      </td>
                      <td className="px-8 py-6 text-[13px] font-bold text-foreground tracking-tighter">
                        ${Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                          {order.is_guest && (
                            <span className="px-3 py-1 text-[8px] font-black uppercase tracking-tighter bg-zinc-800 text-muted-foreground border border-zinc-700 w-fit rounded-sm">
                              Guest Account
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/admin/orders/${order.id}`} className="p-2.5 border border-border hover:border-white hover:text-foreground text-muted-foreground transition-all rounded-sm bg-background inline-block">
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
