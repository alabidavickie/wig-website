"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, updateOrderTracking, processRefund } from "@/lib/actions/orders";
import { ArrowLeft, Package, Truck, CreditCard, Clock, RotateCcw, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_name: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  price?: number;
  image_url?: string;
  attributes?: Record<string, unknown>;
}

interface ShippingInfo {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  zip?: string;
}

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_provider?: string;
  payment_reference?: string;
  is_refunded?: boolean;
  refund_amount?: number;
  tracking_number?: string;
  tracking_url?: string;
  created_at: string;
  shipping_info?: ShippingInfo;
  order_items?: OrderItem[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (params.id) {
        const data = await getOrderById(params.id as string);
        if (data) {
          setOrder(data);
          setTrackingNumber(data.tracking_number || "");
          setTrackingUrl(data.tracking_url || "");
        }
      }
      setLoading(false);
    };
    fetchOrder();
  }, [params.id]);

  const handleSaveTracking = async () => {
    if (!order) return;
    setSavingTracking(true);
    try {
      const updatedOrder = await updateOrderTracking(order.id, {
        tracking_number: trackingNumber,
        tracking_url: trackingUrl
      });
      setOrder(updatedOrder);
      toast.success("Tracking updated and order marked as shipped.");
    } catch (err) {
      toast.error("Failed to update tracking.");
    } finally {
      setSavingTracking(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    const confirmRefund = window.confirm(`Are you sure you want to refund ${order.currency === 'NGN' ? '₦' : '£'}${order.total_amount}? This action cannot be undone.`);
    if (!confirmRefund) return;

    setRefunding(true);
    try {
      const updatedOrder = await processRefund(order.id, order.total_amount);
      setOrder(updatedOrder);
      toast.success("Order successfully refunded.");
    } catch (err) {
      toast.error("Failed to process refund.");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-[#D5A754]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-foreground">
        <Package className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-widest">Order Not Found</h2>
        <Link href="/admin/orders" className="text-[#D5A754] uppercase text-[10px] tracking-widest mt-4 inline-block hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-foreground pb-20 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 border border-border hover:bg-white hover:text-black transition-colors rounded-sm bg-card">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase tracking-[0.1em] flex items-center gap-3">
            Order #{order.id.slice(0, 8)}
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border ${
              order.status === 'delivered' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
              order.status === 'shipped' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
              order.status === 'paid' || order.status === 'processing' ? 'border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5' :
              order.status === 'pending' ? 'border-zinc-500/30 text-muted-foreground bg-zinc-500/5' :
              'border-red-500/30 text-red-400 bg-red-500/5'
            }`}>
              {order.status}
            </span>
          </h1>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold opacity-80">
            Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' HH:mm")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Items & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754] mb-6 flex items-center gap-2">
              <Package className="w-4 h-4" /> Purchased Items
            </h2>
            <div className="space-y-6">
              {order.order_items?.map((item: OrderItem) => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="relative w-20 h-24 bg-background border border-border rounded-sm overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><Package className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[13px] font-bold uppercase tracking-widest">{item.product_name}</h3>
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                        {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[14px] tracking-tighter">
                      {order.currency === 'NGN' ? '₦' : order.currency === 'GBP' ? '£' : '$'}
                      {(item.unit_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-sm shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754] mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Details
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Provider</p>
                <p className="text-[12px] uppercase tracking-widest bg-zinc-800 border border-zinc-700 w-fit px-3 py-1 font-bold">
                  {order.payment_provider}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-xl font-bold tracking-tighter text-foreground">
                  {order.currency === 'NGN' ? '₦' : order.currency === 'GBP' ? '£' : '$'}
                  {order.total_amount.toLocaleString()}
                </p>
              </div>
              {order.payment_reference && (
                <div className="col-span-2">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Transaction Ref</p>
                  <p className="text-[11px] font-mono text-zinc-300 break-all bg-background p-2 border border-border">{order.payment_reference}</p>
                </div>
              )}
            </div>

            {/* Refund Action */}
            <div className="mt-8 pt-8 border-t border-border">
              {order.is_refunded ? (
                <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-4">
                  <RotateCcw className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Order Refunded</h4>
                    <p className="text-[10px] text-red-400/80 uppercase tracking-widest mt-1">
                      {order.currency === 'NGN' ? '₦' : order.currency === 'GBP' ? '£' : '$'}{order.refund_amount} has been returned to the customer.
                    </p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleRefund}
                  disabled={refunding || order.status === 'cancelled'}
                  className="flex items-center gap-2 px-6 py-3 bg-red-950/30 text-red-500 border border-red-900 hover:bg-red-900 hover:text-foreground transition-all text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm disabled:opacity-50"
                >
                  {refunding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Issue Full Refund
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Shipping */}
        <div className="space-y-8">
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754] mb-6 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipping & Fulfillment
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Customer</p>
                <p className="text-[13px] font-bold tracking-wide">{order.shipping_info?.firstName} {order.shipping_info?.lastName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{order.email}</p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Address</p>
                <p className="text-[12px] leading-relaxed text-zinc-300">
                  {order.shipping_info?.address}<br />
                  {order.shipping_info?.city}, {order.shipping_info?.zip}
                </p>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tracking Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Tracking Number / Courier</label>
                    <input 
                      type="text" 
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="e.g. DHL-123456789"
                      className="w-full bg-background border border-border p-3 text-[12px] focus:border-[#D5A754] outline-none transition-colors"
                      disabled={order.status === 'cancelled'}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Tracking URL (Optional)</label>
                    <input 
                      type="text" 
                      value={trackingUrl}
                      onChange={e => setTrackingUrl(e.target.value)}
                      placeholder="https://dhl.com/track/..."
                      className="w-full bg-background border border-border p-3 text-[12px] focus:border-[#D5A754] outline-none transition-colors"
                      disabled={order.status === 'cancelled'}
                    />
                  </div>
                  
                  <button 
                    onClick={handleSaveTracking}
                    disabled={savingTracking || order.status === 'cancelled'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#D5A754] text-black hover:bg-[#E6B964] transition-all text-[10px] font-bold uppercase tracking-[0.2em] rounded-none disabled:opacity-50 mt-2"
                  >
                    {savingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save & Mark Shipped
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
