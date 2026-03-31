"use client";

import Link from "next/link";
import { Eye, MessageSquarePlus } from "lucide-react";

export const OrdersTable = ({ orders = [] }: { orders: any[] }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="w-full bg-card border border-border py-12 text-center rounded-sm">
        <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">No past orders found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto bg-card border border-border rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-secondary">
            <tr className="border-b border-border">
              <th className="py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Order ID</th>
              <th className="py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Date</th>
              <th className="py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Item Name</th>
              <th className="py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Status</th>
              <th className="py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right whitespace-nowrap">Total</th>
              <th className="py-4 px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2D] bg-card">
            {orders.map((order) => {
              const dateObj = new Date(order.created_at);
              const dateStr = isNaN(dateObj.getTime()) ? "Awaiting Data" : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              let badgeStyle = "border-zinc-700 text-muted-foreground bg-secondary";
              if (order.status.toLowerCase() === "delivered") badgeStyle = "border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5";
              if (order.status.toLowerCase() === "processing" || order.status.toLowerCase() === "paid") badgeStyle = "border-[#D5A754]/50 text-foreground bg-[#D5A754]/10";
              if (order.status.toLowerCase() === "shipped") badgeStyle = "border-zinc-600 text-foreground bg-secondary";

              const isDelivered = order.status.toLowerCase() === "delivered";
              const firstItem = order.order_items?.[0];

              return (
                <tr key={order.id} className="hover:bg-secondary transition-colors group">
                  <td className="py-4 px-6 text-[13px] font-bold text-foreground uppercase tracking-tight">#SH-{order.id.slice(0, 8)}</td>
                  <td className="py-4 px-6 text-[13px] text-muted-foreground">{dateStr}</td>
                  <td className="py-4 px-6 text-[13px] text-muted-foreground uppercase tracking-wide truncate max-w-[200px] font-sans">
                    {order.order_items?.[0]?.product_name || "Premium Unit"} {order.order_items?.length > 1 && `+${order.order_items.length - 1} more`}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1.5 border-[1px] rounded-none text-[10px] font-bold uppercase tracking-widest ${badgeStyle}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#D5A754] text-right">
                    {order.currency === 'NGN' ? '₦' : '£'}
                    {isNaN(Number(order.total_amount)) ? '0.00' : Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isDelivered && firstItem && (
                        <Link
                          href={`/dashboard/orders/${order.id}/review?productId=${firstItem.product_id}&productName=${encodeURIComponent(firstItem.product_name)}&productImage=${encodeURIComponent(firstItem.image_url || "")}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D5A754]/40 text-[#D5A754] text-[9px] font-bold uppercase tracking-widest hover:bg-[#D5A754]/10 transition-colors rounded-sm whitespace-nowrap"
                          title="Leave a Review"
                        >
                          <MessageSquarePlus className="w-3 h-3" />
                          Review
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground text-[9px] font-bold uppercase tracking-widest hover:text-foreground hover:border-white transition-colors rounded-sm whitespace-nowrap"
                        title="View Order Details"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => {
          const dateObj = new Date(order.created_at);
          const dateStr = isNaN(dateObj.getTime()) ? "Awaiting Data" : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          let badgeStyle = "border-zinc-700 text-muted-foreground bg-secondary";
          if (order.status.toLowerCase() === "delivered") badgeStyle = "border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5";

          const isDelivered = order.status.toLowerCase() === "delivered";
          const firstItem = order.order_items?.[0];

          return (
            <div key={order.id} className="bg-card border border-border p-6 space-y-4 rounded-sm">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Order ID</p>
                  <p className="text-[13px] font-bold text-foreground uppercase italic">#SH-{order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 border-[1px] rounded-none text-[9px] font-bold uppercase tracking-widest ${badgeStyle}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                  <p className="text-[12px] text-muted-foreground">{dateStr}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                  <p className="text-[15px] font-bold text-[#D5A754]">
                    {order.currency === 'NGN' ? '₦' : '£'}
                    {isNaN(Number(order.total_amount)) ? '0.00' : Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="bg-secondary p-4 rounded-sm border border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Items</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {order.order_items?.[0]?.product_name || "Premium Unit"}
                  {order.order_items?.length > 1 && <span className="text-muted-foreground font-medium ml-1"> (+{order.order_items.length - 1} others)</span>}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white transition-colors rounded-sm"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </Link>
                {isDelivered && firstItem && (
                  <Link
                    href={`/dashboard/orders/${order.id}/review?productId=${firstItem.product_id}&productName=${encodeURIComponent(firstItem.product_name)}&productImage=${encodeURIComponent(firstItem.image_url || "")}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#D5A754]/40 text-[#D5A754] text-[10px] font-bold uppercase tracking-widest hover:bg-[#D5A754]/10 transition-colors rounded-sm"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" /> Review
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
