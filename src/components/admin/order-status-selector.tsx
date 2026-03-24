"use client";

import { useState } from "react";
import { adminUpdateOrderStatus, type OrderStatus } from "@/lib/actions/orders";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  orderId: string;
  currentStatus: string;
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function OrderStatusSelector({ orderId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setStatus(newStatus);
    setLoading(true);
    
    try {
      await adminUpdateOrderStatus(orderId, newStatus as OrderStatus);
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
      setStatus(currentStatus); // Revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm border cursor-pointer outline-none transition-all appearance-none
          ${status === 'delivered' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
            status === 'shipped' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' :
            status === 'processing' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
            status === 'paid' ? 'border-[#D5A754]/30 text-[#D5A754] bg-[#D5A754]/5' :
            'border-amber-500/30 text-amber-500 bg-amber-500/5'}
        `}
      >
        <option value="pending" className="bg-[#0A0A0A] text-white">🚧 Pending</option>
        <option value="paid" className="bg-[#0A0A0A] text-white">💳 Paid</option>
        <option value="processing" className="bg-[#0A0A0A] text-white">📦 Processing</option>
        <option value="shipped" className="bg-[#0A0A0A] text-white">🚚 Shipped</option>
        <option value="delivered" className="bg-[#0A0A0A] text-white">✅ Delivered</option>
        <option value="cancelled" className="bg-[#0A0A0A] text-white">❌ Cancelled</option>
      </select>
      {loading && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
    </div>
  );
}
