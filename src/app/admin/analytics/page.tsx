import { BarChart3, Users, DollarSign, ArrowUpRight, ArrowDownRight, Package, ShoppingBag, TrendingUp, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { getAllOrders } from "@/lib/actions/orders";
import { getProducts, getCategories } from "@/lib/actions/products";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  email: string;
  payment_provider?: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  product_id?: string;
  product_name?: string;
  product_category?: string;
  price?: number;
  quantity?: number;
}

interface Product {
  id: string;
  base_price?: number;
  category_id?: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
}

export default async function AnalyticsPage() {
  const allOrders = await getAllOrders() as Order[];
  const products = await getProducts() as Product[];
  const categories = await getCategories() as Category[];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // ── Live Metrics ──────────────────────────────────
  const paidStatuses = ["paid", "processing", "shipped", "delivered"];

  // Total Revenue (ALL TIME)
  const totalRevenue = allOrders
    .filter((o: Order) => paidStatuses.includes(o.status))
    .reduce((sum: number, o: Order) => sum + Number(o.total_amount || 0), 0);

  // Revenue This Month
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const revenueThisMonth = allOrders
    .filter((o: Order) => new Date(o.created_at) >= startOfMonth && paidStatuses.includes(o.status))
    .reduce((sum: number, o: Order) => sum + Number(o.total_amount || 0), 0);

  // Revenue Last Month (for comparison)
  const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfLastMonth = new Date(currentYear, currentMonth, 0);
  const revenueLastMonth = allOrders
    .filter((o: Order) => {
      const d = new Date(o.created_at);
      return d >= startOfLastMonth && d <= endOfLastMonth && paidStatuses.includes(o.status);
    })
    .reduce((sum: number, o: Order) => sum + Number(o.total_amount || 0), 0);

  const revenueChange = revenueLastMonth > 0
    ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
    : revenueThisMonth > 0 ? "+100" : "0";

  // Total Orders
  const totalOrders = allOrders.length;
  const ordersThisMonth = allOrders.filter((o: Order) => new Date(o.created_at) >= startOfMonth).length;

  // Unique Customers
  const uniqueCustomers = new Set(allOrders.map((o: Order) => o.email)).size;

  // Average Order Value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const metrics = [
    {
      label: "Total Revenue",
      value: `£${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%`,
      trend: Number(revenueChange) >= 0 ? "up" : "down",
      subtitle: "All time"
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      change: `${ordersThisMonth} this month`,
      trend: "up",
      subtitle: "All time"
    },
    {
      label: "Unique Customers",
      value: uniqueCustomers.toString(),
      change: "All time",
      trend: "up",
      subtitle: "Distinct emails"
    },
    {
      label: "Average Order Value",
      value: `£${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: totalOrders > 0 ? "Healthy" : "No data",
      trend: "up",
      subtitle: "Per order"
    },
  ];

  // ── Category Revenue (Live) ──────────────────────
  const categoryRevenue: Record<string, number> = {};
  const categorySales: Record<string, number> = {};

  allOrders.forEach((order: Order) => {
    if (!paidStatuses.includes(order.status)) return;
    order.order_items?.forEach((item: OrderItem) => {
      const cat = item.product_category || "Uncategorised";
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + Number(item.price || 0) * Number(item.quantity || 1);
      categorySales[cat] = (categorySales[cat] || 0) + Number(item.quantity || 1);
    });
  });

  // Fallback to product categories if order items don't have category info
  if (Object.keys(categoryRevenue).length === 0) {
    categories.forEach((cat: Category) => {
      const catProducts = products.filter((p: Product) => p.category_id === cat.id || p.category === cat.name);
      categoryRevenue[cat.name] = catProducts.reduce((sum: number, p: Product) => sum + Number(p.base_price || 0), 0);
      categorySales[cat.name] = catProducts.length;
    });
  }

  const maxCatRevenue = Math.max(...Object.values(categoryRevenue), 1);
  const categoryData = Object.entries(categoryRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // ── Monthly Revenue Chart (Live) ─────────────────
  const monthlyRevenue = new Array(12).fill(0);
  allOrders.forEach((order: Order) => {
    const d = new Date(order.created_at);
    if (d.getFullYear() === currentYear && paidStatuses.includes(order.status)) {
      monthlyRevenue[d.getMonth()] += Number(order.total_amount || 0);
    }
  });
  const maxMonthRevenue = Math.max(...monthlyRevenue, 1);

  // ── Payment Provider Split (Live) ────────────────
  const providerTotals: Record<string, number> = {};
  allOrders
    .filter((o: Order) => paidStatuses.includes(o.status))
    .forEach((o: Order) => {
      const provider = o.payment_provider || "unknown";
      providerTotals[provider] = (providerTotals[provider] || 0) + Number(o.total_amount || 0);
    });
  const providerTotal = Object.values(providerTotals).reduce((a, b) => a + b, 0) || 1;

  // ── Top Products by Revenue (Live) ───────────────
  const productRevenue: Record<string, { name: string; revenue: number; qty: number }> = {};
  allOrders.forEach((order: Order) => {
    if (!paidStatuses.includes(order.status)) return;
    order.order_items?.forEach((item: OrderItem) => {
      const key = item.product_id || item.product_name || 'unknown';
      if (!productRevenue[key]) {
        productRevenue[key] = { name: item.product_name || "Unknown", revenue: 0, qty: 0 };
      }
      productRevenue[key].revenue += Number(item.price || 0) * Number(item.quantity || 1);
      productRevenue[key].qty += Number(item.quantity || 1);
    });
  });
  const topProducts = Object.values(productRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // ── Fulfillment Pipeline (Live) ──────────────────
  const pendingOrders = allOrders.filter((o: Order) => o.status === 'pending').length;
  const processingOrders = allOrders.filter((o: Order) => o.status === 'paid' || o.status === 'processing').length;
  const shippedOrders = allOrders.filter((o: Order) => o.status === 'shipped').length;
  const deliveredOrders = allOrders.filter((o: Order) => o.status === 'delivered').length;
  const cancelledOrders = allOrders.filter((o: Order) => o.status === 'cancelled').length;

  const fulfillmentRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0';
  const shipmentRate = totalOrders > 0 ? (((shippedOrders + deliveredOrders) / totalOrders) * 100).toFixed(1) : '0';

  // Avg fulfillment time (orders that have been delivered)
  const deliveredOrdersList = allOrders.filter((o: Order) => o.status === 'delivered');
  const avgFulfillmentDays = deliveredOrdersList.length > 0
    ? Math.round(
        deliveredOrdersList.reduce((sum: number, o: Order) => {
          const created = new Date(o.created_at).getTime();
          const now = Date.now();
          return sum + (now - created) / (1000 * 60 * 60 * 24);
        }, 0) / deliveredOrdersList.length
      )
    : 0;

  const pipeline = [
    { label: 'Pending', count: pendingOrders, color: 'bg-amber-400', textColor: 'text-amber-400', icon: Clock },
    { label: 'Processing', count: processingOrders, color: 'bg-blue-400', textColor: 'text-blue-400', icon: Package },
    { label: 'Shipped', count: shippedOrders, color: 'bg-indigo-400', textColor: 'text-indigo-400', icon: Truck },
    { label: 'Delivered', count: deliveredOrders, color: 'bg-emerald-400', textColor: 'text-emerald-400', icon: CheckCircle },
  ];

  // Month labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-foreground">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Business Analytics</h1>
          <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-bold">Live data from your store.</p>
        </div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Live Data
        </div>
      </header>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="bg-card p-4 sm:p-6 border border-border shadow-sm relative overflow-hidden group rounded-sm transition-all hover:border-[#D5A754]/30">
             <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-8 sm:w-12 h-8 sm:h-12 text-[#D5A754]" />
             </div>
             <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground mb-1 sm:mb-2">{m.label}</h3>
             <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tighter break-all sm:break-normal">{m.value}</p>
             <div className="flex items-center gap-1 mt-2">
                <span className={`text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 ${m.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {m.change}
                   {m.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </span>
             </div>
          </div>
        ))}
      </div>

      {/* Fulfillment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-4 sm:p-8 border border-border shadow-sm rounded-sm">
          <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-6 sm:mb-8 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D5A754]" /> Shipping & Fulfillment Pipeline
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {pipeline.map((stage) => (
              <div key={stage.label} className="text-center p-4 bg-background border border-border rounded-sm">
                <stage.icon className={`w-5 h-5 mx-auto mb-2 ${stage.textColor}`} />
                <p className="text-2xl font-bold tracking-tighter">{stage.count}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{stage.label}</p>
              </div>
            ))}
          </div>
          {/* Visual funnel bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Order Flow</span>
              <span className="flex-1 h-px bg-[#2A2A2D]"></span>
              <span>{totalOrders} Total</span>
            </div>
            <div className="h-6 flex rounded-sm overflow-hidden bg-background border border-border">
              {pipeline.map((stage) => (
                totalOrders > 0 && stage.count > 0 && (
                  <div
                    key={stage.label}
                    className={`${stage.color} opacity-80 hover:opacity-100 transition-opacity relative group`}
                    style={{ width: `${(stage.count / totalOrders) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] py-0.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold rounded-sm">
                      {stage.label}: {stage.count}
                    </div>
                  </div>
                )
              ))}
              {cancelledOrders > 0 && totalOrders > 0 && (
                <div
                  className="bg-red-500 opacity-60 hover:opacity-100 transition-opacity relative group"
                  style={{ width: `${(cancelledOrders / totalOrders) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] py-0.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold rounded-sm">
                    Cancelled: {cancelledOrders}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fulfillment Stats */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm rounded-sm flex flex-col justify-between">
          <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-6 sm:mb-8 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D5A754]" /> Delivery Stats
          </h3>
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fulfillment Rate</p>
              <p className="text-3xl font-bold tracking-tighter text-emerald-400">{fulfillmentRate}%</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">{deliveredOrders} of {totalOrders} orders delivered</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Shipment Rate</p>
              <p className="text-2xl font-bold tracking-tighter text-blue-400">{shipmentRate}%</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">{shippedOrders + deliveredOrders} shipped or delivered</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Fulfillment Time</p>
              <p className="text-2xl font-bold tracking-tighter text-[#D5A754]">{avgFulfillmentDays || '—'} <span className="text-[11px] text-muted-foreground">days</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm rounded-sm">
          <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-6 sm:mb-8">Monthly Revenue ({currentYear})</h3>
          <div className="h-48 sm:h-64 flex items-end gap-1 sm:gap-2 px-1 pb-2 border-b border-l border-border">
            {monthlyRevenue.map((rev, i) => (
              <div
                key={i}
                style={{ height: `${Math.max((rev / maxMonthRevenue) * 100, 3)}%` }}
                className={`flex-1 transition-all duration-700 ease-out ${i === currentMonth ? 'bg-[#D5A754]' : 'bg-[#2A2A2D]'} hover:bg-white relative group rounded-t-sm`}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] sm:text-[9px] py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl font-bold rounded-sm">
                  £{rev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 sm:mt-4 px-1 overflow-x-auto">
            {monthNames.map((m, i) => (
              <span key={m} className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-wider shrink-0 ${i === currentMonth ? 'text-[#D5A754]' : 'text-zinc-600'}`}>{m}</span>
            ))}
          </div>
        </div>

        {/* Category Revenue Share */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm rounded-sm">
          <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-6 sm:mb-8">Category Revenue Share</h3>
          <div className="space-y-5 sm:space-y-6">
            {categoryData.length === 0 ? (
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-10 text-center">No category data yet. Revenue will appear after orders are placed.</p>
            ) : (
              categoryData.map(([name, revenue]) => (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between items-end gap-2">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground truncate">{name}</span>
                    <span className="text-[11px] sm:text-[12px] font-bold text-foreground tracking-tighter shrink-0">
                      £{revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-[#D5A754] transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${Math.max((revenue / maxCatRevenue) * 100, 2)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Provider Split */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm rounded-sm">
          <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-6 sm:mb-8">Payment Provider Split</h3>
          <div className="space-y-4 sm:space-y-5">
            {Object.keys(providerTotals).length === 0 ? (
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-10 text-center">No payment data yet.</p>
            ) : (
              Object.entries(providerTotals).sort(([, a], [, b]) => b - a).map(([provider, amount]) => (
                <div key={provider} className="flex items-center gap-4 sm:gap-6 group">
                  <div className={`w-3 h-3 shrink-0 rounded-sm ${provider === 'stripe' ? 'bg-indigo-500' : provider === 'paystack' ? 'bg-teal-500' : 'bg-zinc-500'}`}></div>
                  <span className="flex-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors capitalize">{provider}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">{((amount / providerTotal) * 100).toFixed(1)}%</span>
                  <span className="text-[11px] sm:text-[12px] font-bold text-foreground">£{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products by Revenue */}
        <div className="bg-card p-4 sm:p-8 border border-border shadow-sm rounded-sm">
          <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 mb-6 sm:mb-8">Top Products by Revenue</h3>
          <div className="space-y-4 sm:space-y-5">
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-10 text-center">No product data yet.</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                  <span className="text-[10px] font-bold text-zinc-600 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest truncate group-hover:text-[#D5A754] transition-colors">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{p.qty} sold</p>
                  </div>
                  <span className="text-[11px] sm:text-[12px] font-bold text-foreground tracking-tighter shrink-0">
                    £{p.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
