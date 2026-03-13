"use client";

export const OrdersTable = ({ orders = [] }: { orders: any[] }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 py-12 text-center">
        <p className="text-[12px] font-bold uppercase tracking-widest text-[#1A1A1D]/40">No past orders found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block w-full overflow-x-auto bg-white border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FAF9F6]">
            <tr className="border-b border-gray-200">
              <th className="py-4 px-6 text-[10px] font-bold text-[#1A1A1D] uppercase tracking-widest whitespace-nowrap">Order ID</th>
              <th className="py-4 px-6 text-[10px] font-bold text-[#1A1A1D] uppercase tracking-widest whitespace-nowrap">Date</th>
              <th className="py-4 px-6 text-[10px] font-bold text-[#1A1A1D] uppercase tracking-widest whitespace-nowrap">Item Name</th>
              <th className="py-4 px-6 text-[10px] font-bold text-[#1A1A1D] uppercase tracking-widest whitespace-nowrap">Status</th>
              <th className="py-4 px-6 text-[10px] font-bold text-[#1A1A1D] uppercase tracking-widest text-right whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {orders.map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              
              let badgeStyle = "border-gray-300 text-[#1A1A1D]/60 bg-[#FAF9F6]";
              if (order.status.toLowerCase() === "delivered") badgeStyle = "border-black text-[#1A1A1D] bg-white";
              if (order.status.toLowerCase() === "processing" || order.status.toLowerCase() === "paid") badgeStyle = "border-black text-[#1A1A1D] bg-[#1A1A1D]/5";
              if (order.status.toLowerCase() === "shipped") badgeStyle = "border-gray-400 text-[#1A1A1D] bg-white";

              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#1A1A1D]">#SH-{order.id.slice(0, 8)}</td>
                  <td className="py-4 px-6 text-[13px] text-[#1A1A1D]/60">{dateStr}</td>
                  <td className="py-4 px-6 text-[13px] text-[#1A1A1D] uppercase tracking-wide truncate max-w-[200px]">{order.order_items[0]?.product_name || "Premium Virgin Hair"} {order.order_items.length > 1 && `+${order.order_items.length - 1} more`}</td>
                  <td className="py-4 px-6">
                     <span className={`inline-flex items-center px-3 py-1.5 border-[1px] rounded-none text-[10px] font-bold uppercase tracking-widest ${badgeStyle}`}>
                        {order.status}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-bold text-[#1A1A1D] text-right">{order.currency === 'NGN' ? '₦' : '£'}{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => {
          const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          
          let badgeStyle = "border-gray-300 text-[#1A1A1D]/60 bg-[#FAF9F6]";
          if (order.status.toLowerCase() === "delivered") badgeStyle = "border-black text-[#1A1A1D] bg-white";
          if (order.status.toLowerCase() === "processing" || order.status.toLowerCase() === "paid") badgeStyle = "border-black text-[#1A1A1D] bg-[#1A1A1D]/5";
          if (order.status.toLowerCase() === "shipped") badgeStyle = "border-gray-400 text-[#1A1A1D] bg-white";

          return (
            <div key={order.id} className="bg-white border border-gray-200 p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1D]/40 mb-1">Order ID</p>
                  <p className="text-[13px] font-bold text-[#1A1A1D]">#SH-{order.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1D]/40 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 border-[1px] rounded-none text-[9px] font-bold uppercase tracking-widest ${badgeStyle}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1D]/40 mb-1">Date</p>
                  <p className="text-[12px] text-[#1A1A1D]/60">{dateStr}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1D]/40 mb-1">Total</p>
                  <p className="text-[15px] font-bold text-[#1A1A1D]">{order.currency === 'NGN' ? '₦' : '£'}{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1D]/40 mb-2">Items</p>
                <p className="text-[11px] text-[#1A1A1D] uppercase tracking-wide">
                  {order.order_items[0]?.product_name || "Premium Virgin Hair"} 
                  {order.order_items.length > 1 && <span className="text-[#1A1A1D]/60 font-medium ml-1"> (+{order.order_items.length - 1} others)</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
