"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { createProduct, getCategories } from "@/lib/actions/products";
import { useEffect } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
    category_id: "",
    is_featured: false,
    variants: [{ name: "Standard", sku: "", inventory_count: 5, price_override: null, attributes: {} }],
    images: [{ url: "" }]
  });

  useEffect(() => {
    const fetchCats = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      alert("Please select a category");
      return;
    }
    setLoading(true);
    try {
      await createProduct({
        ...formData,
        base_price: parseFloat(formData.base_price),
      });
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", sku: "", inventory_count: 0, price_override: null, attributes: {} }]
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, { url: "" }] });
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...formData.images];
    newImages[index].url = url;
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto text-white pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-3 border border-[#2A2A2D] hover:bg-white hover:text-black hover:border-white transition-all rounded-sm bg-[#141414]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Initialize New Unit</h1>
          <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-bold opacity-80">Create a new entry in your luxury collection.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">General Information</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Product Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="e.g. HD Lace Frontal Wig - 24 inch" 
                  className="w-full h-12 px-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all placeholder:text-zinc-800 bg-[#0A0A0A] font-bold text-sm tracking-wide"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Slug</label>
                  <input 
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    type="text" 
                    placeholder="hd-lace-frontal-24" 
                    className="w-full h-12 px-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all placeholder:text-zinc-800 bg-[#0A0A0A] font-mono text-xs"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Base Price ($)</label>
                  <input 
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                    type="number" 
                    placeholder="1250" 
                    className="w-full h-12 px-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all placeholder:text-zinc-800 bg-[#0A0A0A] font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  placeholder="Describe the texture, lace quality, and origin..." 
                  className="w-full p-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all placeholder:text-zinc-800 bg-[#0A0A0A] resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">Inventory Variants</h3>
              <button 
                type="button" 
                onClick={addVariant}
                className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.variants.map((variant, idx) => (
                <div key={idx} className="p-6 border border-[#2A2A2D] flex flex-col md:flex-row gap-6 items-end bg-[#0A0A0A]/50 relative rounded-sm group/var">
                  <div className="flex-1 space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Variant Name</label>
                    <input 
                      required
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].name = e.target.value;
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#0A0A0A] focus:border-[#D5A754] outline-none transition-colors" 
                      placeholder="e.g. 24 inch / Straight" 
                    />
                  </div>
                  <div className="w-32 space-y-3">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Stock Count</label>
                    <input 
                      type="number" 
                      value={variant.inventory_count}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].inventory_count = parseInt(e.target.value);
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full h-12 px-4 border border-[#2A2A2D] bg-[#0A0A0A] focus:border-[#D5A754] outline-none" 
                    />
                  </div>
                  {formData.variants.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeVariant(idx)}
                      className="p-3 border border-transparent text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-all mb-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Status & Category */}
          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">Organization</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Collection</label>
                <select 
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full h-12 px-4 border border-[#2A2A2D] outline-none bg-[#0A0A0A] font-bold uppercase tracking-widest text-[11px] cursor-pointer focus:border-[#D5A754] appearance-none"
                >
                  <option value="">Select Collection</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-4 cursor-pointer group p-4 border border-[#2A2A2D] bg-[#0A0A0A]/50 hover:bg-[#D5A754]/5 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-5 h-5 accent-[#D5A754] border-[#2A2A2D] bg-[#0A0A0A] rounded-sm" 
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Promote as Featured</span>
              </label>
            </div>
          </div>

          {/* Media */}
          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">Media Gallary</h3>
              <button 
                type="button" 
                onClick={addImage}
                className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline"
              >
                Add Image URL
              </button>
            </div>
            <div className="space-y-6">
              {formData.images.map((img, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="relative group">
                    <input 
                      required
                      value={img.url}
                      onChange={(e) => updateImage(idx, e.target.value)}
                      placeholder="Insert URL..." 
                      className="w-full h-12 px-4 border border-[#2A2A2D] text-[12px] bg-[#0A0A0A] focus:border-[#D5A754] outline-none transition-colors"
                    />
                  </div>
                  {img.url && (
                    <div className="aspect-[3/4] border border-[#2A2A2D] bg-[#0A0A0A] relative overflow-hidden group/img rounded-sm">
                      <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-white text-black py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#D5A754] transition-all flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Commence Publication
            </button>
            <p className="text-[9px] text-center text-zinc-600 uppercase tracking-widest italic font-bold">Changes will reflect immediately in the showroom.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
