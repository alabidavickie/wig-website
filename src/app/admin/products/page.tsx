"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Search, Filter, Edit, Trash2, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories, deleteProduct, toggleProductVisibility, type Product, type Category } from "@/lib/actions/products";
import { format } from "date-fns";
import { Eye, EyeOff } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  // Filter/Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

  const handleToggleVisibility = async (id: string, currentStatus: boolean | undefined) => {
    setTogglingId(id);
    try {
      // Assuming toggle logic exists or falls back to server action
      await toggleProductVisibility(id, !currentStatus);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    } catch (error) {
      alert("Failed to toggle visibility");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.base_price - b.base_price;
      if (sortBy === "price_desc") return b.base_price - a.base_price;
      if (sortBy === "oldest") return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-foreground pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Inventory Vault</h1>
          <p className="text-muted-foreground text-xs mt-2 uppercase tracking-widest font-bold opacity-80">Manage your luxury hair collection and variants.</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#D5A754] transition-all flex items-center gap-3 w-fit shadow-2xl group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add New Unit
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center rounded-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#D5A754] transition-colors" />
          <input 
            type="text" 
            placeholder="Search the vault by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-[12px] font-bold uppercase tracking-widest border-border focus:border-[#D5A754] focus:ring-0 transition-colors bg-background placeholder:text-muted-foreground/50 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="px-6 py-3 border border-border text-[10px] font-bold uppercase tracking-widest hover:border-[#D5A754] transition-all bg-background text-muted-foreground hover:text-foreground outline-none cursor-pointer appearance-none min-w-[160px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
          <select 
            className="px-6 py-3 border border-border text-[10px] font-bold uppercase tracking-widest hover:border-[#D5A754] transition-all bg-background text-muted-foreground hover:text-foreground outline-none cursor-pointer appearance-none min-w-[160px]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Collections</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                <th className="px-8 py-6">Unit Description</th>
                <th className="px-8 py-6">Collection</th>
                <th className="px-8 py-6">Valuation</th>
                <th className="px-8 py-6">Stock</th>
                <th className="px-8 py-6">Archived On</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D5A754]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Package className="w-12 h-12 stroke-[0.5]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Vault is currently vacant</p>
                      <Link href="/admin/products/new" className="text-[10px] text-[#D5A754] font-bold uppercase tracking-widest hover:underline mt-4">Initialize First Unit</Link>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Search className="w-12 h-12 stroke-[0.5]" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No products match your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-[#2A2A2D]/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-18 bg-background border border-border flex-shrink-0 overflow-hidden relative group-hover:border-[#D5A754] transition-colors rounded-sm">
                          <Image 
                            src={product.image || "/hero_luxury_wig_1773402385371.png"} 
                            alt={product.name} 
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold uppercase tracking-wide group-hover:text-foreground transition-colors text-zinc-300">{product.name}</span>
                          <span className="text-[9px] text-muted-foreground font-mono tracking-tighter truncate max-w-[150px] mt-1 uppercase">ID: {product.id.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-[#2A2A2D]/50 px-3 py-1 rounded-full border border-border/30">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[13px] font-bold text-foreground tracking-tighter">
                      £{Number(product.base_price).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      {(() => {
                        const stock = (product as any).stock ?? 0;
                        return (
                          <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${stock === 0 ? 'text-red-400 border-red-500/30 bg-red-500/10' : stock < 5 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'}`}>
                            {stock === 0 ? 'Out of stock' : stock < 5 ? `Low — ${stock}` : stock}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      {product.created_at ? format(new Date(product.created_at), 'MMM dd, yyyy') : '—'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button 
                          onClick={() => handleToggleVisibility(product.id, product.is_active)}
                          disabled={togglingId === product.id}
                          className={`p-2.5 border border-border transition-all disabled:opacity-50 ${product.is_active !== false ? 'hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400 text-muted-foreground' : 'hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400 text-zinc-600'}`}
                          title={product.is_active !== false ? "Hide product" : "Show product"}
                        >
                          {product.is_active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/products/edit/${product.id}`} className="p-2.5 border border-border hover:bg-white hover:text-black hover:border-white transition-all text-muted-foreground" title="Edit product">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-2.5 border border-border hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all disabled:opacity-50 text-muted-foreground"
                          title="Delete product"
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
