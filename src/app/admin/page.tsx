import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  Clock,
  ChevronRight,
  Mail
} from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/lib/actions/products";
import { getAllOrders } from "@/lib/actions/orders";
import { getSubscriberCount } from "@/lib/actions/newsletter";
import Image from "next/image";
import { format } from "date-fns";

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_provider?: string;
  created_at: string;
  shipping_info?: { exchangeRate?: number };
  order_items?: OrderItem[];
}

function orderToGbp(o: Order): number {
  if (o.currency !== "NGN") return Number(o.total_amount || 0);
  const rate = o.shipping_info?.exchangeRate || 2050;
  return Number(o.total_amount || 0) / rate;
}

interface OrderItem {
  quantity: number;
  product_name: string;
}

interface Product {
  id: string;
  name: string;
  image?: string;
  category?: string;
  base_price: number;
  stock?: number;
}

export default async function AdminDashboardPage() {
  const products = await getProducts() as Product[];
  const allOrders = await getAllOrders() as Order[];
  const subscriberCount = await getSubscriberCount();

  const now = new Date();
  
  // 1. Orders Today
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const ordersToday = allOrders.filter((o: Order) => new Date(o.created_at) >= startOfDay);
  const ordersTodayCount = ordersToday.length;

  // 2. Orders Awaiting Dispatch
  const awaitingDispatchCount = allOrders.filter((o: Order) => o.status === "paid" || o.status === "processing").length;

  // 3. Revenue This Month — converted to GBP equivalent
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueThisMonth = allOrders
    .filter((o: Order) => new Date(o.created_at) >= startOfMonth && ["paid", "processing", "shipped", "delivered"].includes(o.status))
    .reduce((sum: number, o: Order) => sum + orderToGbp(o), 0);

  // 4. Low Stock Alert
  const lowStockCount = products.filter((p: Product) => Number(p.stock) <= 5).length;

  // 5. New Customers This Week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0,0,0,0);
  const recentOrderCustomers = allOrders.filter((o: Order) => new Date(o.created_at) >= startOfWeek);
  const newCustomersWeekCount = new Set(recentOrderCustomers.map((o: Order) => o.email)).size;


  const stats = [
    { 
      label: "Orders Today", 
      value: ordersTodayCount.toString(), 
      change: "Today", 
      trend: "up" as const, 
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-[#2A2A2D]"
    },
    { 
      label: "Awaiting Dispatch", 
      value: awaitingDispatchCount.toString(), 
      change: "Needs attention", 
      trend: awaitingDispatchCount > 0 ? "down" : "up" as const, 
      icon: Package,
      color: "text-amber-400",
      bg: "bg-[#2A2A2D]"
    },
    { 
      label: "Revenue This Month", 
      value: `£${revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      change: "Current month", 
      trend: "up" as const, 
      icon: DollarSign,
      color: "text-[#D5A754]",
      bg: "bg-[#2A2A2D]"
    },
    { 
      label: "Low Stock Alert", 
      value: lowStockCount.toString(), 
      change: "Items \u2264 5 stock", 
      trend: lowStockCount > 0 ? "down" : "up" as const, 
      icon: Clock,
      color: "text-red-400",
      bg: "bg-[#2A2A2D]"
    },
    { 
      label: "New Customers", 
      value: newCustomersWeekCount.toString(), 
      change: "This week", 
      trend: "up" as const, 
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-[#2A2A2D]"
    },
    { 
      label: "Subscribers", 
      value: subscriberCount.toString(), 
      change: "Newsletter", 
      trend: "up" as const, 
      icon: Mail,
      color: "text-emerald-400",
      bg: "bg-[#2A2A2D]"
    },
  ];

  // Real recent orders (latest 5)
  const recentOrders = allOrders.slice(0, 5);

  // Generate real monthly revenue data (Current Year)
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = new Array(12).fill(0);
  
  allOrders.forEach((order: Order) => {
    const orderDate = new Date(order.created_at);
    if (orderDate.getFullYear() === currentYear && ["paid", "processing", "shipped", "delivered"].includes(order.status)) {
      monthlyRevenue[orderDate.getMonth()] += orderToGbp(order);
    }
  });

  const maxRevenue = Math.max(...monthlyRevenue, 100); // Scale relative to max month, min 100
  const chartHeights = monthlyRevenue.map(rev => Math.max((rev / maxRevenue) * 100, 2)); // Minimum 2% height for visibility of zero months

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500 pb-20 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground uppercase tracking-[0.1em]">Dashboard</h1>
          <p className="text-muted-foreground mt-1 uppercase tracking-widest text-[10px] font-bold">Silk Haus Overview</p>
        </div>
        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-card px-3 sm:px-4 py-2 border border-border shadow-sm">
           System Status: <span className="text-emerald-500">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card p-4 sm:p-6 border border-border shadow-sm transition-all hover:border-[#D5A754]/30 group rounded-sm">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className={`bg-[#2A2A2D] ${stat.color} p-2 sm:p-3 rounded-sm group-hover:scale-110 transition-transform border border-border`}>
                <stat.icon className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[9px] sm:text-[11px] font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
                <span className="hidden sm:inline">{stat.change}</span>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" strokeWidth={3} /> : <ArrowDownRight className="w-3 h-3" strokeWidth={3} />}
              </div>
            </div>
            <h3 className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1">{stat.label}</h3>
            <p className="text-lg sm:text-2xl font-bold tracking-tighter text-foreground break-all sm:break-normal">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts / Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 sm:gap-8">
        {/* Sales Chart Mockup */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm min-h-[300px] sm:min-h-[450px] flex flex-col rounded-sm">
          <div className="flex justify-between items-center mb-6 sm:mb-10">
            <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4">Monthly Revenue</h3>
          </div>
          
          <div className="flex-1 flex items-end gap-1 sm:gap-3 px-1 sm:px-2 pb-2 border-b border-l border-border">
             {chartHeights.map((h, i) => (
               <div 
                 key={i} 
                 style={{ height: `${h}%` }} 
                 className={`flex-1 transition-all duration-700 ease-out ${i === new Date().getMonth() ? 'bg-[#D5A754]' : 'bg-secondary'} hover:bg-white relative group rounded-t-sm`}
               >
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] sm:text-[9px] py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl font-bold rounded-sm">
                   £{monthlyRevenue[i].toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-3 sm:mt-6 px-1 sm:px-2 overflow-x-auto">
             {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
               <span key={`${m}-${i}`} className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0 ${i === new Date().getMonth() ? 'text-[#D5A754]' : 'text-zinc-600'}`}>{m}</span>
             ))}
          </div>
        </div>

        {/* Recently Added Products (Real Data) */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm flex flex-col rounded-sm text-foreground">
          <div className="flex justify-between items-center mb-6 sm:mb-10">
            <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4">Recent Products</h3>
            <Link href="/admin/products" className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline flex items-center gap-1 group">
               MANAGE <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-5 sm:space-y-8 flex-1">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex gap-3 sm:gap-5 items-center group cursor-pointer">
                  <div className="w-10 h-12 sm:w-14 sm:h-[72px] bg-background border border-border flex-shrink-0 group-hover:border-[#D5A754] transition-colors overflow-hidden relative rounded-sm">
                    <Image 
                      src={product.image || "/hero_luxury_wig_1773402385371.png"} 
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest truncate group-hover:text-[#D5A754] transition-colors">{product.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase italic mt-1 tracking-tighter">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] sm:text-[12px] font-bold tracking-tighter text-foreground">£{product.base_price}</p>
                    <p className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mt-0.5 italic ${(product.stock ?? 0) === 0 ? 'text-red-400' : (product.stock ?? 0) <= 5 ? 'text-amber-400' : 'text-emerald-500'}`}>
                      {(product.stock ?? 0) === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <Link href="/admin/products" className="block w-full text-center mt-6 sm:mt-10 py-3 sm:py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D5A754] hover:tracking-[0.3em] transition-all rounded-sm">
            View All Products
          </Link>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {(() => {
        const lowStockProducts = products.filter((p: Product) => (p.stock ?? 0) <= 5);
        if (lowStockProducts.length === 0) return null;
        return (
          <div className="bg-amber-500/5 border border-amber-500/30 rounded-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                {lowStockProducts.length} Product{lowStockProducts.length > 1 ? "s" : ""} Need Restocking
              </h3>
              <Link href="/admin/products" className="ml-auto text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Manage Stock →
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {lowStockProducts.map((p: Product) => (
                <Link
                  key={p.id}
                  href={`/admin/products/edit/${p.id}`}
                  className="flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-sm hover:border-amber-500/50 transition-colors group"
                >
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wide group-hover:text-amber-400 transition-colors">{p.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${(p.stock ?? 0) === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {(p.stock ?? 0) === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Recent Orders Table — Now from real DB data */}
      <div className="bg-card border border-border shadow-sm overflow-hidden rounded-sm">
        <div className="p-4 sm:p-8 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-background/30">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#D5A754]" />
            <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Recent Orders</h3>
          </div>
          <Link href="/admin/orders" className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                <th className="px-8 py-6">Order ID</th>
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
                  <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                    No orders yet. Orders will appear here in real-time.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: Order) => {
                  const itemCount = order.order_items?.reduce((acc: number, item: OrderItem) => acc + item.quantity, 0) || 0;
                  const productsPreview = order.order_items?.map((item: OrderItem) => item.product_name).join(", ") || "—";
                  return (
                    <tr key={order.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                      <td className="px-8 py-6 text-[12px] font-bold tracking-tighter font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[12px] uppercase tracking-wide font-bold text-foreground">{order.email}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            {format(new Date(order.created_at), "MMM dd, HH:mm")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] text-muted-foreground uppercase tracking-widest max-w-[200px] truncate">
                        {itemCount} {itemCount === 1 ? "item" : "items"}: <span className="text-muted-foreground italic">{productsPreview}</span>
                      </td>
                      <td className="px-8 py-6 text-[13px] font-bold text-foreground tracking-tighter">
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
                          order.status === 'pending' ? 'border-zinc-500/30 text-muted-foreground bg-zinc-500/5' :
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
