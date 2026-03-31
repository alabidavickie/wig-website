"use client";

import { useEffect, useState, useTransition } from "react";
import { Percent, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Tag, Calendar, ShoppingBag, Hash } from "lucide-react";
import { format } from "date-fns";
import {
  getAllDiscountCodes,
  createDiscountCode,
  deleteDiscountCode,
  toggleDiscountCode,
  type DiscountCode,
} from "@/lib/actions/discounts";
import { toast } from "sonner";

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "flat",
  value: "",
  min_order_amount: "",
  expiry_date: "",
  max_uses: "",
};

export default function DiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    setLoading(true);
    try {
      const data = await getAllDiscountCodes();
      setCodes(data);
    } catch {
      toast.error("Failed to load discount codes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const handleCreate = () => {
    if (!form.code.trim() || !form.value) {
      toast.error("Code and value are required.");
      return;
    }
    startTransition(async () => {
      try {
        await createDiscountCode({
          code: form.code,
          type: form.type,
          value: parseFloat(form.value),
          min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
          expiry_date: form.expiry_date || null,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        });
        toast.success(`Code "${form.code.toUpperCase()}" created.`);
        setForm(EMPTY_FORM);
        setShowForm(false);
        await refresh();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to create code.");
      }
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      try {
        await toggleDiscountCode(id, !current);
        await refresh();
      } catch {
        toast.error("Failed to update code.");
      }
    });
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Delete code "${code}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteDiscountCode(id);
        toast.success(`Code "${code}" deleted.`);
        await refresh();
      } catch {
        toast.error("Failed to delete code.");
      }
    });
  };

  const activeCount = codes.filter(c => c.is_active).length;
  const totalUses = codes.reduce((sum, c) => sum + c.current_uses, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-[0.1em]">Discounts & Promotions</h1>
          <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-bold">
            Create and manage coupon codes for Silk Haus.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#D5A754] text-black px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#C09040] transition-all rounded-sm"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Cancel" : "New Code"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Codes", value: codes.length, icon: Tag, color: "text-[#D5A754]", bg: "bg-[#D5A754]/10", border: "border-[#D5A754]/20" },
          { label: "Active", value: activeCount, icon: Percent, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
          { label: "Inactive", value: codes.length - activeCount, icon: ToggleLeft, color: "text-muted-foreground", bg: "bg-zinc-400/10", border: "border-zinc-400/20" },
          { label: "Total Redemptions", value: totalUses, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border p-5 rounded-sm flex items-center gap-4">
            <div className={`p-3 ${stat.bg} ${stat.color} border ${stat.border} rounded-sm`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-card border border-[#D5A754]/30 p-6 md:p-8 rounded-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4">New Discount Code</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Code *</label>
              <input
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SILK20"
                className="w-full h-11 px-4 border border-border bg-background text-[13px] font-bold uppercase outline-none focus:border-[#D5A754] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as "percentage" | "flat" })}
                className="w-full h-11 px-4 border border-border bg-background text-[13px] font-bold outline-none focus:border-[#D5A754] transition-colors"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (£)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Value * {form.type === "percentage" ? "(%)" : "(£)"}
              </label>
              <input
                type="number"
                min="0"
                max={form.type === "percentage" ? "100" : undefined}
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === "percentage" ? "20" : "10.00"}
                className="w-full h-11 px-4 border border-border bg-background text-[13px] font-bold outline-none focus:border-[#D5A754] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Min Order (£)</label>
              <input
                type="number"
                min="0"
                value={form.min_order_amount}
                onChange={e => setForm({ ...form, min_order_amount: e.target.value })}
                placeholder="50.00"
                className="w-full h-11 px-4 border border-border bg-background text-[13px] outline-none focus:border-[#D5A754] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expiry Date</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full h-11 px-4 border border-border bg-background text-[13px] outline-none focus:border-[#D5A754] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.max_uses}
                onChange={e => setForm({ ...form, max_uses: e.target.value })}
                placeholder="Unlimited"
                className="w-full h-11 px-4 border border-border bg-background text-[13px] outline-none focus:border-[#D5A754] transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all disabled:opacity-50 rounded-sm"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Code
          </button>
        </div>
      )}

      {/* Codes Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-background/30">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">All Codes</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-[#D5A754]" />
          </div>
        ) : codes.length === 0 ? (
          <div className="py-24 text-center">
            <Percent className="w-8 h-8 text-zinc-600 mx-auto mb-4" />
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">No discount codes yet.</p>
            <p className="text-[10px] text-zinc-600 mt-1">Click &quot;New Code&quot; to create your first coupon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min Order</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Uses</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2D]">
                {codes.map(c => {
                  const isExpired = c.expiry_date ? new Date(c.expiry_date) < new Date() : false;
                  const isExhausted = c.max_uses !== null && c.current_uses >= c.max_uses;
                  const effectivelyInactive = !c.is_active || isExpired || isExhausted;

                  return (
                    <tr key={c.id} className="hover:bg-[#2A2A2D]/20 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-[#D5A754]" />
                          <span className="font-mono font-bold text-[13px] text-[#D5A754] uppercase tracking-wider">{c.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[13px] font-bold text-foreground">
                          {c.type === "percentage" ? `${c.value}% off` : `£${c.value.toFixed(2)} off`}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[12px] text-muted-foreground">
                        {c.min_order_amount ? `£${c.min_order_amount.toFixed(2)}` : <span className="text-zinc-600 italic">None</span>}
                      </td>
                      <td className="px-6 py-5">
                        {c.expiry_date ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className={`text-[11px] font-bold ${isExpired ? "text-red-400" : "text-zinc-300"}`}>
                              {format(new Date(c.expiry_date), "MMM d, yyyy")}
                              {isExpired && " (Expired)"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-600 italic">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-bold text-foreground">
                          {c.current_uses}{c.max_uses !== null ? ` / ${c.max_uses}` : ""}
                        </span>
                        {isExhausted && (
                          <span className="ml-2 text-[9px] font-bold uppercase text-red-400">(Limit Reached)</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleToggle(c.id, c.is_active)}
                          disabled={isPending}
                          className="flex items-center gap-2"
                        >
                          {c.is_active && !isExpired && !isExhausted ? (
                            <><ToggleRight className="w-5 h-5 text-emerald-400" /><span className="text-[10px] font-bold uppercase text-emerald-400">Active</span></>
                          ) : (
                            <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-[10px] font-bold uppercase text-muted-foreground">{effectivelyInactive && !c.is_active ? "Disabled" : isExpired ? "Expired" : "Exhausted"}</span></>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={isPending}
                          className="p-2 border border-border hover:border-red-400 hover:text-red-400 text-muted-foreground transition-all rounded-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}
