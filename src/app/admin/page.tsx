import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Clock,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/actions/products";
import { getAllOrders } from "@/lib/actions/orders";
import Image from "next/image";
import { format } from "date-fns";

export default async function AdminDashboardPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const allOrders = await getAllOrders();

  // Compute live stats from real orders
  const totalRevenue = allOrders
    .filter((o: any) => o.status === "paid" || o.status === "processing" || o.status === "shipped" || o.status === "delivered")
    .reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

  const totalOrders = allOrders.length;

  // Unique customers by email
  const uniqueEmails = new Set(allOrders.map((o: any) => o.email));
  const totalCustomers = uniqueEmails.size;

  // Order counts by status
  const pendingCount = allOrders.filter((o: any) => o.status === "pending").length;
  const paidCount = allOrders.filter((o: any) => o.status === "paid" || o.status === "processing").length;
  const shippedCount = allOrders.filter((o: any) => o.status === "shipped").length;
  const deliveredCount = allOrders.filter((o: any) => o.status === "delivered").length;

  const stats = [
    { 
      label: "Total Revenue", 
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: `${totalOrders} orders`, 
      trend: "up" as const, 
      icon: DollarSign,
      color: "text-[#C5A880]",
      bg: "bg-[#FAF9F6]"
    },
    { 
      label: "Total Orders", 
      value: totalOrders.toString(), 
      change: `${pendingCount} pending`, 
      trend: "up" as const, 
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "Active Customers", 
      value: totalCustomers.toLocaleString(), 
      change: `${deliveredCount} fulfilled`, 
      trend: "up" as const, 
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    { 
      label: "Inventory Items", 
      value: products.length.toString(), 
      change: `${categories.length} Collections`, 
      trend: "up" as const, 
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
  ];

  // Real recent orders (latest 5)
  const recentOrders = allOrders.slice(0, 5);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-white">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-[0.1em]">Executive Overview</h1>
          <p className="text-zinc-400 text-sm mt-1 uppercase tracking-widest text-[10px] font-bold">Silk Haus Performance Monitor</p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-[#141414] px-4 py-2 border border-[#2A2A2D] shadow-sm">
           System Status: <span className="text-emerald-500">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#141414] p-6 border border-[#2A2A2D] shadow-sm transition-all hover:border-[#D5A754]/30 group rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`bg-[#2A2A2D] ${stat.color} p-3 rounded-sm group-hover:scale-110 transition-transform border border-[#3F3F46]`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" strokeWidth={3} /> : <ArrowDownRight className="w-3 h-3" strokeWidth={3} />}
              </div>
            </div>
            <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold tracking-tighter text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts / Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* Sales Chart Mockup */}
        <div className="bg-white p-8 border border-gray-100 shadow-sm min-h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#C5A880] pl-4">Revenue Trajectory</h3>
            <div className="flex gap-2">
              {['W', 'M', 'Y'].map((t) => (
                <button key={t} className={`w-10 h-10 text-[10px] font-bold border transition-all ${t === 'M' ? 'bg-[#1A1A1D] text-white border-[#1A1A1D]' : 'text-gray-400 border-gray-100 hover:border-gray-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-3 px-2 pb-2 border-b border-l border-gray-50">
             {[35, 60, 40, 85, 50, 70, 45, 80, 95, 55, 75, 65].map((h, i) => (
               <div 
                 key={i} 
                 style={{ height: `${h}%` }} 
                 className={`flex-1 transition-all duration-700 ease-out ${i === 8 ? 'bg-[#C5A880]' : 'bg-gray-100'} hover:bg-[#1A1A1D] relative group`}
               >
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] py-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-tighter whitespace-nowrap z-10 shadow-xl">
                   ${h * 125}.00
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-6 px-2">
             {['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'].map(m => (
               <span key={m} className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">{m}</span>
             ))}
          </div>
        </div>

        {/* Recently Added Products (Real Data) */}
        <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm flex flex-col rounded-sm text-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4">Inventory Snap</h3>
            <Link href="/admin/products" className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline flex items-center gap-1 group">
               MANAGE <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-8 flex-1">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex gap-5 items-center group cursor-pointer">
                  <div className="w-14 h-18 bg-[#0A0A0A] border border-[#2A2A2D] flex-shrink-0 group-hover:border-[#D5A754] transition-colors overflow-hidden relative rounded-sm">
                    <Image 
                      src={product.image || "/hero_luxury_wig_1773402385371.png"} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest truncate group-hover:text-[#D5A754] transition-colors">{product.name}</p>
                    <p className="text-[10px] text-zinc-400 uppercase italic mt-1 tracking-tighter">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold tracking-tighter text-white">${product.base_price}</p>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5 italic">In Stock</p>
                  </div>
                </div>
              ))}
          </div>
          <Link href="/admin/products" className="block w-full text-center mt-10 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D5A754] hover:tracking-[0.3em] transition-all rounded-sm">
            Audit Full Inventory
          </Link>
        </div>
      </div>

      {/* Recent Orders Table — Now from real DB data */}
      <div className="bg-[#141414] border border-[#2A2A2D] shadow-sm overflow-hidden rounded-sm">
        <div className="p-8 border-b border-[#2A2A2D] flex justify-between items-center bg-[#0A0A0A]/30">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#D5A754]" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Recent Fulfillment Queue</h3>
          </div>
          <Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">View All Orders</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1A1A1D] text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 border-b border-[#2A2A2D]">
                <th className="px-8 py-6">Identifier</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Items</th>
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6">Provider</th>
                <th className="px-8 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
                    No orders yet. Orders will appear here in real-time.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => {
                  const itemCount = order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  const productsPreview = order.order_items?.map((item: any) => item.product_name).join(", ") || "—";
                  return (
                    <tr key={order.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                      <td className="px-8 py-6 text-[12px] font-bold tracking-tighter font-mono text-zinc-400 group-hover:text-white transition-colors">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[12px] uppercase tracking-wide font-bold text-white">{order.email}</span>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                            {format(new Date(order.created_at), "MMM dd, HH:mm")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] text-zinc-400 uppercase tracking-widest max-w-[200px] truncate">
                        {itemCount} {itemCount === 1 ? "item" : "items"}: <span className="text-zinc-400 italic">{productsPreview}</span>
                      </td>
                      <td className="px-8 py-6 text-[13px] font-bold text-white tracking-tighter">
                        {order.currency === "NGN" ? "₦" : order.currency === "GBP" ? "£" : "$"}
                        {Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest border ${
                          order.payment_provider === "stripe"
                            ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/5"
                            : "border-teal-500/30 text-teal-400 bg-teal-500/5"
                        }`}>
                          {order.payment_provider}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full border ${
                          order.status === 'delivered' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                          order.status === 'shipped' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
                          order.status === 'paid' || order.status === 'processing' ? 'border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5' :
                          order.status === 'pending' ? 'border-zinc-500/30 text-zinc-400 bg-zinc-500/5' :
                          'border-red-500/30 text-red-400 bg-red-500/5'
                        }`}>
                          {order.status}
                        </span>
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
