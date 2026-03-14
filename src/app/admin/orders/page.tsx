import { Package, Truck, CheckCircle, Clock, Search, Filter, MoreVertical, Eye } from "lucide-react";
import { format } from "date-fns";
import { getAllOrders } from "@/lib/actions/orders";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  // Helper to get status styles
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing': return { bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'shipped': return { bg: 'bg-purple-50', text: 'text-purple-600' };
      case 'delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600' };
    }
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review and fulfill luxury hair orders from your clients.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex -space-x-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
           </div>
           <span className="text-xs text-gray-400 font-medium">+12 active shoppers</span>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: "08", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Processing", value: "04", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Shipped", value: "21", icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Fulfilled", value: "142", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              className="w-full pl-10 pr-4 py-2 text-sm border-gray-100 bg-gray-50/50 outline-none focus:border-[#1A1A1D] transition-colors"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-100 text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter className="w-4 h-4" /> Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400 uppercase tracking-widest text-xs font-bold">
                    No orders in the fulfillment queue.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const statusInfo = getStatusInfo(order.status);
                  const itemCount = order.order_items.reduce((acc: number, item: any) => acc + item.quantity, 0);
                  const productsPreview = order.order_items.map((item: any) => item.product_name).join(", ");
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="text-[13px] font-bold font-mono text-[#1A1A1D]">{order.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold uppercase tracking-wide">{order.email}</span>
                          <span className="text-[11px] text-gray-400 truncate max-w-[150px]">{format(new Date(order.created_at), 'MMM dd, HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[12px] text-gray-500 italic max-w-xs truncate">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}: {productsPreview}
                      </td>
                      <td className="px-8 py-5 text-[13px] font-bold">
                        ${Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest w-fit ${statusInfo.bg} ${statusInfo.text}`}>
                            {order.status}
                          </span>
                          {order.is_guest && (
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter bg-gray-900 text-white w-fit">
                              Guest Account
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 border border-gray-100 hover:border-[#1A1A1D] transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
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
