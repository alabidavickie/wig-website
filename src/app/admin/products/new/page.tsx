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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 border border-gray-100 hover:bg-gray-50 transition-all rounded-none">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new entry in your luxury collection.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[14px] font-bold uppercase tracking-widest border-l-2 border-[#1A1A1D] pl-4">General Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="e.g. HD Lace Frontal Wig - 24 inch" 
                  className="w-full h-12 px-4 border border-gray-100 focus:border-[#1A1A1D] outline-none transition-all placeholder:text-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Slug</label>
                  <input 
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    type="text" 
                    placeholder="hd-lace-frontal-24" 
                    className="w-full h-12 px-4 border border-gray-100 focus:border-[#1A1A1D] outline-none transition-all placeholder:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Base Price ($)</label>
                  <input 
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                    type="number" 
                    placeholder="1250" 
                    className="w-full h-12 px-4 border border-gray-100 focus:border-[#1A1A1D] outline-none transition-all placeholder:text-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  placeholder="Describe the texture, lace quality, and origin..." 
                  className="w-full p-4 border border-gray-100 focus:border-[#1A1A1D] outline-none transition-all placeholder:text-gray-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-bold uppercase tracking-widest border-l-2 border-[#1A1A1D] pl-4">Inventory Variants</h3>
              <button 
                type="button" 
                onClick={addVariant}
                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Variant
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.variants.map((variant, idx) => (
                <div key={idx} className="p-4 border border-gray-100 flex flex-col md:flex-row gap-4 items-end bg-gray-50/30 relative">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Variant Name</label>
                    <input 
                      required
                      value={variant.name}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].name = e.target.value;
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full h-10 px-3 border border-gray-100 bg-white" 
                      placeholder="e.g. 24 inch / Straight" 
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock</label>
                    <input 
                      type="number" 
                      value={variant.inventory_count}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[idx].inventory_count = parseInt(e.target.value);
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full h-10 px-3 border border-gray-100 bg-white" 
                    />
                  </div>
                  {formData.variants.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeVariant(idx)}
                      className="p-2.5 text-red-400 hover:text-red-500 transition-colors"
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
          <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-[14px] font-bold uppercase tracking-widest border-l-2 border-[#1A1A1D] pl-4">Organization</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                <select 
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  className="w-full h-12 px-4 border border-gray-100 outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-5 h-5 accent-[#1A1A1D] rounded-none" 
                />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black transition-colors">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[14px] font-bold uppercase tracking-widest border-l-2 border-[#1A1A1D] pl-4">Media</h3>
              <button 
                type="button" 
                onClick={addImage}
                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
              >
                Add Link
              </button>
            </div>
            <div className="space-y-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="relative group">
                    <input 
                      required
                      value={img.url}
                      onChange={(e) => updateImage(idx, e.target.value)}
                      placeholder="Image URL..." 
                      className="w-full h-10 px-3 border border-gray-100 text-[12px] bg-gray-50/50"
                    />
                  </div>
                  {img.url && (
                    <div className="aspect-[3/4] border border-gray-100 bg-[#FAF9F6] relative overflow-hidden">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
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
              className="w-full bg-[#1A1A1D] text-white py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Publish Product
            </button>
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest italic">Changes will reflect immediately on storefront.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
