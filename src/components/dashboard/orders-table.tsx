"use client";

export const OrdersTable = ({ orders = [] }: { orders: any[] }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="w-full bg-[#141414] border border-[#2A2A2D] py-12 text-center rounded-sm">
        <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">No past orders found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto bg-[#141414] border border-[#2A2A2D] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1A1A1D]">
            <tr className="border-b border-[#2A2A2D]">
              <th className="py-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Order ID</th>
              <th className="py-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Date</th>
              <th className="py-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Item Name</th>
              <th className="py-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th className="py-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2D] bg-[#141414]">
            {orders.map((order) => {
              const dateObj = new Date(order.created_at);
              const dateStr = isNaN(dateObj.getTime()) ? "Awaiting Data" : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              let badgeStyle = "border-zinc-700 text-zinc-400 bg-[#1A1A1D]";
              if (order.status.toLowerCase() === "delivered") badgeStyle = "border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5";
              if (order.status.toLowerCase() === "processing" || order.status.toLowerCase() === "paid") badgeStyle = "border-[#D5A754]/50 text-white bg-[#D5A754]/10";
              if (order.status.toLowerCase() === "shipped") badgeStyle = "border-zinc-600 text-white bg-[#1A1A1D]";

              return (
                <tr key={order.id} className="hover:bg-[#1A1A1D] transition-colors group">
                  <td className="py-4 px-6 text-[13px] font-bold text-white uppercase tracking-tight">#SH-{order.id.slice(0, 8)}</td>
                  <td className="py-4 px-6 text-[13px] text-zinc-400">{dateStr}</td>
                  <td className="py-4 px-6 text-[13px] text-zinc-400 uppercase tracking-wide truncate max-w-[200px] font-sans">
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
          let badgeStyle = "border-zinc-700 text-zinc-400 bg-[#1A1A1D]";
          if (order.status.toLowerCase() === "delivered") badgeStyle = "border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5";

          return (
            <div key={order.id} className="bg-[#141414] border border-[#2A2A2D] p-6 space-y-4 rounded-sm">
              <div className="flex justify-between items-start border-b border-[#2A2A2D] pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Order ID</p>
                  <p className="text-[13px] font-bold text-white uppercase italic">#SH-{order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 border-[1px] rounded-none text-[9px] font-bold uppercase tracking-widest ${badgeStyle}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date</p>
                  <p className="text-[12px] text-zinc-400">{dateStr}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Total</p>
                  <p className="text-[15px] font-bold text-[#D5A754]">
                    {order.currency === 'NGN' ? '₦' : '£'}
                    {isNaN(Number(order.total_amount)) ? '0.00' : Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="bg-[#1A1A1D] p-4 rounded-sm border border-[#2A2A2D]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Acquisitions</p>
                <p className="text-[11px] text-zinc-400 uppercase tracking-wide">
                  {order.order_items?.[0]?.product_name || "Premium Unit"} 
                  {order.order_items?.length > 1 && <span className="text-zinc-400 font-medium ml-1"> (+{order.order_items.length - 1} others)</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
