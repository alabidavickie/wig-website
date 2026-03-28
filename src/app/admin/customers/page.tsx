import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Search, Mail, ShoppingBag, DollarSign, Calendar, ChevronRight, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // SECURE: Check if current user is an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all non-admin profiles using adminClient to bypass RLS
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  // Fetch all orders for stats using adminClient
  const { data: allOrders } = await adminClient
    .from("orders")
    .select("id, email, total_amount, currency, status, created_at");

  interface Profile {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    is_suspended?: boolean;
    created_at?: string;
  }

  interface Order {
    id: string;
    email: string;
    total_amount: number;
    currency: string;
    status: string;
    created_at: string;
  }

  const customers = (profiles || []).map((profile: Profile) => {
    const customerOrders = (allOrders || []).filter(
      (o: Order) => o.email === profile.email
    );
    const totalSpent = customerOrders
      .filter((o: Order) => ["paid", "processing", "shipped", "delivered"].includes(o.status))
      .reduce((sum: number, o: Order) => sum + Number(o.total_amount || 0), 0);
    const lastOrder = customerOrders.length > 0 ? customerOrders[0] : null;

    return {
      ...profile,
      orderCount: customerOrders.length,
      totalSpent,
      lastOrderDate: lastOrder?.created_at || null,
    };
  });

  interface CustomerWithStats extends Profile {
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string | null;
  }

  const totalCustomers = customers.length;
  const customersWithOrders = customers.filter((c: CustomerWithStats) => c.orderCount > 0).length;
  const totalLifetimeValue = customers.reduce((sum: number, c: CustomerWithStats) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Customers</h1>
          <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-bold">
            All registered customers &amp; their order history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-card px-4 py-2 border border-border">
            Total: <span className="text-[#D5A754]">{totalCustomers}</span> Clients
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 border border-border rounded-sm flex items-center gap-4">
          <div className="bg-[#2A2A2D] p-3 rounded-sm border border-border">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Total Customers</p>
            <p className="text-xl font-bold tracking-tighter">{totalCustomers}</p>
          </div>
        </div>
        <div className="bg-card p-5 border border-border rounded-sm flex items-center gap-4">
          <div className="bg-[#2A2A2D] p-3 rounded-sm border border-border">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Active Buyers</p>
            <p className="text-xl font-bold tracking-tighter">{customersWithOrders}</p>
          </div>
        </div>
        <div className="bg-card p-5 border border-border rounded-sm flex items-center gap-4">
          <div className="bg-[#2A2A2D] p-3 rounded-sm border border-border">
            <DollarSign className="w-5 h-5 text-[#D5A754]" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Total Lifetime Value</p>
            <p className="text-xl font-bold tracking-tighter">${totalLifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/30">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-[#D5A754]" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">All Customers</h3>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {customersWithOrders} of {totalCustomers} have placed orders
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                <th className="px-6 md:px-8 py-5">Client</th>
                <th className="px-6 md:px-8 py-5">Email</th>
                <th className="px-6 md:px-8 py-5">Joined</th>
                <th className="px-6 md:px-8 py-5">Orders</th>
                <th className="px-6 md:px-8 py-5">Total Spent</th>
                <th className="px-6 md:px-8 py-5">Last Order</th>
                <th className="px-6 md:px-8 py-5">Status</th>
                <th className="px-6 md:px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                    No registered clients yet. Clients will appear here after signing up.
                  </td>
                </tr>
              ) : (
                customers.map((customer: CustomerWithStats) => (
                  <tr key={customer.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                    {/* Name / Avatar */}
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#2A2A2D] border border-border rounded-sm flex items-center justify-center text-[10px] font-bold text-[#D5A754] uppercase group-hover:border-[#D5A754]/50 transition-colors flex-shrink-0">
                          {(customer.first_name?.[0] || "")}{(customer.last_name?.[0] || "")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-widest truncate group-hover:text-[#D5A754] transition-colors">
                            {customer.first_name || ""} {customer.last_name || ""}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                            {customer.role || "client"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 md:px-8 py-5">
                      <span className="text-[11px] text-zinc-300 tracking-wide">{customer.email}</span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 md:px-8 py-5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {customer.created_at ? format(new Date(customer.created_at), "MMM dd, yyyy") : "—"}
                      </span>
                    </td>

                    {/* Order Count */}
                    <td className="px-6 md:px-8 py-5">
                      <span className={`text-[12px] font-bold tracking-tighter ${customer.orderCount > 0 ? "text-foreground" : "text-zinc-600"}`}>
                        {customer.orderCount}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-6 md:px-8 py-5">
                      <span className={`text-[12px] font-bold tracking-tighter ${customer.totalSpent > 0 ? "text-[#D5A754]" : "text-zinc-600"}`}>
                        ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Last Order */}
                    <td className="px-6 md:px-8 py-5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {customer.lastOrderDate
                          ? format(new Date(customer.lastOrderDate), "MMM dd, yyyy")
                          : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 md:px-8 py-5">
                      {customer.is_suspended ? (
                        <span className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] border border-red-500/30 text-red-500 bg-red-500/5 rounded-sm">
                          Suspended
                        </span>
                      ) : customer.orderCount > 0 ? (
                        <span className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 rounded-sm">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.2em] border border-zinc-500/30 text-muted-foreground bg-zinc-500/5 rounded-sm">
                          Registered
                        </span>
                      )}
                    </td>

                    <td className="px-6 md:px-8 py-5 text-right">
                      <Link href={`/admin/customers/${customer.id}`} className="p-2.5 border border-border hover:border-white hover:text-foreground text-muted-foreground transition-all rounded-sm bg-background inline-block">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {customers.length > 0 && (
          <div className="p-6 md:p-8 border-t border-border bg-background/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Showing {customers.length} client{customers.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-emerald-400">{customersWithOrders}</span> active buyers
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-[#D5A754]">${totalLifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> lifetime value
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
