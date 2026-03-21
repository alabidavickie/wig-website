"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Search, Filter, Edit, Trash2, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories, deleteProduct, type Product, type Category } from "@/lib/actions/products";
import { format } from "date-fns";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
    setCategories(cats);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-white pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Inventory Vault</h1>
          <p className="text-zinc-400 text-xs mt-2 uppercase tracking-widest font-bold opacity-80">Manage your luxury hair collection and variants.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#D5A754] transition-all flex items-center gap-3 w-fit shadow-2xl group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add New Unit
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#141414] p-4 border border-[#2A2A2D] shadow-sm flex flex-col md:flex-row gap-4 items-center rounded-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D5A754] transition-colors" />
          <input 
            type="text" 
            placeholder="Search the vault..." 
            className="w-full pl-12 pr-4 py-3 text-[12px] font-bold uppercase tracking-widest border-[#2A2A2D] focus:border-[#D5A754] focus:ring-0 transition-colors bg-[#0A0A0A] placeholder:text-zinc-700 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-3 border border-[#2A2A2D] text-[10px] font-bold uppercase tracking-widest hover:border-[#D5A754] transition-all bg-[#0A0A0A] text-zinc-400 hover:text-white whitespace-nowrap">
            <Filter className="w-4 h-4 text-[#D5A754]" /> Refine
          </button>
          <select className="px-6 py-3 border border-[#2A2A2D] text-[10px] font-bold uppercase tracking-widest hover:border-[#D5A754] transition-all bg-[#0A0A0A] text-zinc-400 hover:text-white outline-none cursor-pointer appearance-none min-w-[160px]">
            <option>All Collections</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#141414] border border-[#2A2A2D] shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1A1A1D] text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 border-b border-[#2A2A2D]">
                <th className="px-8 py-6">Unit Description</th>
                <th className="px-8 py-6">Collection</th>
                <th className="px-8 py-6">Valuation</th>
                <th className="px-8 py-6">Archived On</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D5A754]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Decrypting Vault Data...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-400">
                      <Package className="w-12 h-12 stroke-[0.5]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Vault is currently vacant</p>
                      <Link href="/admin/products/new" className="text-[10px] text-[#D5A754] font-bold uppercase tracking-widest hover:underline mt-4">Initialize First Unit</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-18 bg-[#0A0A0A] border border-[#2A2A2D] flex-shrink-0 overflow-hidden relative group-hover:border-[#D5A754] transition-colors rounded-sm">
                          <Image 
                            src={product.image || "/hero_luxury_wig_1773402385371.png"} 
                            alt={product.name} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold uppercase tracking-wide group-hover:text-white transition-colors text-zinc-300">{product.name}</span>
                          <span className="text-[9px] text-zinc-400 font-mono tracking-tighter truncate max-w-[150px] mt-1 uppercase">ID: {product.id.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-[#2A2A2D]/50 px-3 py-1 rounded-full border border-[#3F3F46]/30">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[13px] font-bold text-white tracking-tighter">
                      ${Number(product.base_price).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      {product.created_at ? format(new Date(product.created_at), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/admin/products/${product.id}`} className="p-2.5 border border-[#2A2A2D] hover:bg-white hover:text-black hover:border-white transition-all text-zinc-400">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-2.5 border border-[#2A2A2D] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all disabled:opacity-50 text-zinc-400"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
