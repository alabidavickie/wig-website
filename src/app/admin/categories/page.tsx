"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Loader2, Check } from "lucide-react";
import { getCategories, createCategory, deleteCategory } from "@/lib/actions/products";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will become uncategorized.`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert("Failed to delete category. It may still have products assigned.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCategory(newCategory);
      setNewCategory({ name: "", slug: "", description: "" });
      setIsAdding(false);
      await fetchCategories();
    } catch (error) {
      alert("Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Categories</h1>
          <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-widest font-bold">Organize your products into luxury collections.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-white text-black px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all flex items-center gap-2 rounded-sm"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Category</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#141414] p-8 border border-[#D5A754]/20 shadow-2xl animate-in slide-in-from-top-4 duration-300 rounded-sm">
          <form onSubmit={handleCreate} className="space-y-6 max-w-2xl text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Category Name</label>
                <input 
                  required
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
                    setNewCategory({ ...newCategory, name, slug });
                  }}
                  type="text" 
                  className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#0A0A0A] focus:border-[#D5A754] outline-none transition-all text-[13px] font-bold tracking-wide"
                  placeholder="e.g. Lace Frontals"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Slug</label>
                <input 
                  required
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  type="text" 
                  className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#0A0A0A] focus:border-[#D5A754] outline-none transition-all text-[12px] font-mono opacity-60"
                  placeholder="lace-frontals"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
              <textarea 
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full p-4 border border-[#2A2A2D] bg-[#0A0A0A] focus:border-[#D5A754] outline-none transition-all resize-none text-[13px] leading-relaxed"
                placeholder="Brief description for SEO and UI..."
              />
            </div>
            <button 
              disabled={submitting}
              className="bg-white text-black px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all flex items-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Category
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#141414] border border-[#2A2A2D] shadow-sm overflow-hidden rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1A1A1D] text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-[#2A2A2D]">
              <th className="px-8 py-5">Name</th>
              <th className="px-8 py-5">Slug</th>
              <th className="px-8 py-5 text-center">Products</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2D]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 uppercase tracking-widest text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading Collections...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-gray-400 uppercase tracking-widest text-xs">
                  No categories found. Add your first collection above.
                </td>
              </tr>
            ) : (
                  categories.map((cat: Category) => (
                    <tr key={cat.id} className="hover:bg-[#1A1A1D] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0A0A0A] flex items-center justify-center border border-[#2A2A2D]">
                            <Tag className="w-3.5 h-3.5 text-[#D5A754]" />
                          </div>
                          <span className="text-[13px] font-bold uppercase tracking-wide text-white group-hover:text-[#D5A754] transition-colors">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[11px] font-mono text-zinc-500">{cat.slug}</td>
                      <td className="px-8 py-5 text-[12px] font-bold text-center text-zinc-400">--</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          className="p-2 text-zinc-500 hover:text-rose-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
