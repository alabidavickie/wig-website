"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { suspendCustomer, sendPasswordReset } from "@/lib/actions/customers";
import { ArrowLeft, UserCircle, Mail, Calendar, DollarSign, Ban, RefreshCcw, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_suspended?: boolean;
  role?: string;
  created_at?: string;
}

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

export default function AdminCustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [suspending, setSuspending] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();
        
      if (profile) {
        setCustomer(profile);
        
        // Fetch orders by email
        const { data: userOrders } = await supabase
          .from("orders")
          .select("*")
          .eq("email", profile.email)
          .order("created_at", { ascending: false });
          
        setOrders(userOrders || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [params.id, supabase]);

  const handleToggleSuspend = async () => {
    if (!customer) return;

    const newStatus = !customer.is_suspended;
    const action = newStatus ? "suspend" : "reactivate";

    if (!window.confirm(`Are you sure you want to ${action} this customer?`)) return;

    setSuspending(true);
    try {
      await suspendCustomer(customer.id, newStatus);
      setCustomer({ ...customer, is_suspended: newStatus });
      alert(`Customer successfully ${action}d.`);
      router.refresh();
    } catch (err) {
      alert(`Failed to ${action} customer.`);
    } finally {
      setSuspending(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!customer) return;
    if (!window.confirm(`Send password reset link to ${customer.email}?`)) return;

    setSendingReset(true);
    try {
      await sendPasswordReset(customer.email);
      alert("Password reset email sent successfully.");
    } catch (err) {
      alert("Failed to send password reset email.");
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-[#D5A754]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20 text-foreground">
        <UserCircle className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-widest">Customer Not Found</h2>
        <Link href="/admin/customers" className="text-[#D5A754] uppercase text-[10px] tracking-widest mt-4 inline-block hover:underline">
          Return to Customers
        </Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => ["paid", "processing", "shipped", "delivered"].includes(o.status) ? sum + Number(o.total_amount) : sum, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-foreground pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 border border-border hover:bg-white hover:text-black transition-colors rounded-sm bg-card">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase tracking-[0.1em] flex items-center gap-3">
            Client Profile
            {customer.is_suspended && (
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-red-500/30 text-red-400 bg-red-500/5">
                Suspended
              </span>
            )}
            {customer.role === "admin" && (
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/5">
                Admin
              </span>
            )}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Info & Actions */}
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#2A2A2D] border border-border rounded-sm flex items-center justify-center text-2xl font-bold text-[#D5A754] uppercase mb-4">
               {customer.first_name?.[0] || ""}{customer.last_name?.[0] || ""}
            </div>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-1">
              {customer.first_name} {customer.last_name}
            </h2>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-6">{customer.email}</p>
            
            <div className="w-full grid grid-cols-2 gap-4 text-left border-t border-border pt-6">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Joined</p>
                <p className="text-[11px] font-mono text-zinc-300">
                  {customer.created_at ? format(new Date(customer.created_at), "MMM yyyy") : "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Lifetime Value</p>
                <p className="text-[13px] font-bold text-[#D5A754]">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4 border-b border-border pb-2">Administrative Actions</h3>
            
            <button 
              onClick={handlePasswordReset}
              disabled={sendingReset}
              className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border hover:border-white transition-all text-[11px] font-bold uppercase tracking-widest rounded-sm disabled:opacity-50"
            >
              <span className="flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-blue-400"/> Password Reset</span>
              {sendingReset && <Loader2 className="w-4 h-4 animate-spin" />}
            </button>

            <button 
              onClick={handleToggleSuspend}
              disabled={suspending || customer.role === "admin"}
              className={`w-full flex items-center justify-between px-4 py-3 border transition-all text-[11px] font-bold uppercase tracking-widest rounded-sm disabled:opacity-50 ${
                customer.is_suspended 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                  : "bg-red-500/5 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Ban className="w-4 h-4"/> 
                {customer.is_suspended ? "Reactivate Account" : "Suspend Account"}
              </span>
              {suspending && <Loader2 className="w-4 h-4 animate-spin" />}
            </button>
            {customer.role === "admin" && (
              <p className="text-[9px] text-muted-foreground text-center uppercase tracking-widest mt-2">Cannot suspend an admin account</p>
            )}
          </div>
        </div>

        {/* Right Col - Orders */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center gap-3 bg-background/30">
                 <Package className="w-4 h-4 text-[#D5A754]" />
                 <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Order History</h2>
              </div>
              
              <div className="p-0">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-[10px] font-bold uppercase tracking-widest">No order records found</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2D]">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#2A2A2D]/20 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/admin/orders/${order.id}`} className="text-[12px] font-mono text-foreground hover:text-[#D5A754] transition-colors">
                              {order.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                          </td>
                          <td className="px-6 py-4 text-[13px] font-bold tracking-tighter">
                            {order.currency === 'NGN' ? '₦' : order.currency === 'GBP' ? '£' : '$'}{Number(order.total_amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em] rounded-full border ${
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
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
