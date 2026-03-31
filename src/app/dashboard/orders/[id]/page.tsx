import { getOrderById } from "@/lib/actions/orders";
import { getReviewsByOrderId } from "@/lib/actions/reviews";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  CreditCard,
  MapPin,
  Star,
  CheckCircle2,
  Truck,
  Clock,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { DeleteReviewButton } from "./delete-review-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const order = await getOrderById(id);
  if (!order || order.user_id !== user.id) notFound();

  const reviews = await getReviewsByOrderId(id);
  const reviewedProductIds = new Set(reviews.map((r) => r.product_id));

  const currencySymbol = order.currency === "NGN" ? "₦" : "£";
  const isDelivered = order.status === "delivered";

  const statusSteps = [
    { label: "Order Placed", icon: Clock, done: true },
    { label: "Processing", icon: Package, done: ["paid", "processing", "shipped", "delivered"].includes(order.status) },
    { label: "Shipped", icon: Truck, done: ["shipped", "delivered"].includes(order.status) },
    { label: "Delivered", icon: CheckCircle2, done: order.status === "delivered" },
  ];

  const badgeColor =
    order.status === "delivered" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" :
    order.status === "shipped" ? "border-blue-500/30 text-blue-400 bg-blue-500/5" :
    order.status === "paid" || order.status === "processing" ? "border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5" :
    order.status === "cancelled" ? "border-red-500/30 text-red-400 bg-red-500/5" :
    "border-zinc-500/30 text-muted-foreground bg-zinc-500/5";

  return (
    <div className="flex flex-col gap-10 w-full max-w-5xl mx-auto text-foreground bg-background p-6 md:p-8 font-sans min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link
          href="/dashboard/orders"
          className="p-2 border border-border hover:bg-card transition-colors rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif uppercase tracking-widest">
            Order <span className="italic">#SH-{order.id.slice(0, 8)}</span>
          </h1>
          <p className="text-muted-foreground text-xs mt-1 uppercase tracking-widest font-bold">
            Placed on {format(new Date(order.created_at), "MMMM dd, yyyy")}
          </p>
        </div>
        <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border rounded-full ${badgeColor}`}>
          {order.status}
        </span>
      </div>

      {/* Progress Stepper */}
      {order.status !== "cancelled" && (
        <div className="bg-card border border-border p-6 md:p-8 rounded-sm">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D5A754] mb-6">Order Status</h2>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-px bg-border hidden md:block" />
            <div className="flex justify-between relative z-10">
              {statusSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-background transition-all z-10
                    ${step.done ? "border-[#D5A754] bg-[#D5A754] text-black" : "border-border text-muted-foreground/40"}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest whitespace-nowrap
                    ${step.done ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Package className="w-4 h-4 text-[#D5A754]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Ordered Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.order_items?.map((item) => {
                const hasReview = reviewedProductIds.has(item.product_id);
                const itemReview = reviews.find((r) => r.product_id === item.product_id);

                return (
                  <div key={item.id} className="p-6">
                    <div className="flex gap-4">
                      {/* Product image */}
                      <div className="relative w-20 h-24 bg-background border border-border rounded-sm overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold uppercase tracking-wide leading-tight">{item.product_name}</h3>
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
                            {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-widest">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-[13px] font-bold text-[#D5A754] mt-2">
                          {currencySymbol}{(item.unit_price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Review section for this item */}
                    {isDelivered && (
                      <div className="mt-4 pt-4 border-t border-border">
                        {hasReview && itemReview ? (
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < itemReview.product_rating ? "fill-[#D5A754] text-[#D5A754]" : "text-border"}`}
                                    />
                                  ))}
                                  <span className="text-[9px] text-muted-foreground ml-2 uppercase tracking-widest font-bold">Product</span>
                                </div>
                                <p className="text-[11px] font-bold uppercase tracking-widest">{itemReview.review_title}</p>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{itemReview.description}</p>
                                <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">
                                  Delivery: {itemReview.delivery_rating}/5 &bull; Submitted {format(new Date(itemReview.created_at), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <DeleteReviewButton reviewId={itemReview.id} />
                            </div>
                          </div>
                        ) : (
                          <Link
                            href={`/dashboard/orders/${order.id}/review?productId=${item.product_id}&productName=${encodeURIComponent(item.product_name)}&productImage=${encodeURIComponent(item.image_url || "")}`}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-[#D5A754]/40 text-[#D5A754] text-[10px] font-bold uppercase tracking-widest hover:bg-[#D5A754]/10 transition-colors rounded-sm"
                          >
                            <MessageSquarePlus className="w-3.5 h-3.5" />
                            Leave a Review
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-card border border-border rounded-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#D5A754]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Payment</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Provider</p>
                <p className="text-[12px] font-bold uppercase tracking-widest">{order.payment_provider}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-xl font-bold tracking-tighter text-[#D5A754]">
                  {currencySymbol}{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              {order.payment_reference && (
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Reference</p>
                  <p className="text-[10px] font-mono text-zinc-400 break-all bg-background p-2 border border-border">
                    {order.payment_reference}
                  </p>
                </div>
              )}
              {order.tracking_number && (
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tracking</p>
                  {order.tracking_url ? (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#D5A754] hover:underline uppercase tracking-widest"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <p className="text-[11px] font-bold uppercase tracking-widest">{order.tracking_number}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-card border border-border rounded-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D5A754]" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Shipping Address</h2>
            </div>
            <div className="p-6 space-y-1">
              <p className="text-[13px] font-bold uppercase tracking-wide">
                {order.shipping_info?.firstName} {order.shipping_info?.lastName}
              </p>
              <p className="text-[11px] text-muted-foreground">{order.email}</p>
              <div className="pt-2 text-[12px] text-zinc-300 leading-relaxed">
                <p>{order.shipping_info?.address}</p>
                <p>{order.shipping_info?.city}{order.shipping_info?.zip ? `, ${order.shipping_info.zip}` : ""}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border rounded-sm">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#D5A754]">Order Summary</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground uppercase tracking-widest font-bold">Subtotal</span>
                <span className="font-bold">
                  {currencySymbol}
                  {order.order_items
                    ? order.order_items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
                    : "—"}
                </span>
              </div>
              {order.shipping_info?.shippingFee != null && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted-foreground uppercase tracking-widest font-bold">Shipping</span>
                  <span className="font-bold">
                    {currencySymbol}{Number(order.shipping_info.shippingFee).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[14px] pt-3 border-t border-border">
                <span className="font-bold uppercase tracking-widest">Total</span>
                <span className="font-bold text-[#D5A754]">
                  {currencySymbol}{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
