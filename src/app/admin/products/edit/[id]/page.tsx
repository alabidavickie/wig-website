"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { getProductById, getCategories, updateProduct } from "@/lib/actions/products";
import { createClient } from "@/lib/supabase/client";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    base_price: "",
    category_id: "",
    is_featured: false,
    variants: [] as any[],
    images: [] as any[]
  });

  useEffect(() => {
    const fetchData = async () => {
      const [product, cats] = await Promise.all([
        getProductById(id),
        getCategories()
      ]);
      
      setCategories(cats);
      
      if (product) {
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          base_price: product.base_price.toString(),
          category_id: product.category_id || "",
          is_featured: product.is_featured || false,
          variants: product.product_variants || [],
          images: (product.product_images || []).map((img: any) => ({ url: img.image_url }))
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProduct(id, {
        ...formData,
        base_price: parseFloat(formData.base_price),
      });
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const newImages = [...formData.images];
      newImages[index] = { url: publicUrl };
      setFormData({ ...formData, images: newImages });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#D5A754]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Retrieving Unit Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto text-white pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-3 border border-[#2A2A2D] hover:bg-white hover:text-black hover:border-white transition-all rounded-sm bg-[#141414]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Update Inventory Unit</h1>
          <p className="text-zinc-400 text-xs mt-2 uppercase tracking-widest font-bold opacity-80">Modify the specifications and valuation of this luxury piece.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">General Information</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Product Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  className="w-full h-12 px-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all bg-[#0A0A0A] font-bold text-sm tracking-wide"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Base Price (£)</label>
                  <input 
                    required
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                    type="number" 
                    className="w-full h-12 px-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all bg-[#0A0A0A] font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={6}
                  className="w-full p-4 border border-[#2A2A2D] focus:border-[#D5A754] outline-none transition-all bg-[#0A0A0A] resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">Media Gallary</h3>
            <div className="space-y-6">
              {formData.images.map((img, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="relative group space-y-3">
                    <div className="flex gap-2">
                      <input 
                        required
                        value={img.url}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[idx] = { url: e.target.value };
                          setFormData({...formData, images: newImages});
                        }}
                        className="flex-1 h-12 px-4 border border-[#2A2A2D] text-[12px] bg-[#0A0A0A] focus:border-[#D5A754] outline-none transition-colors"
                      />
                      <label className="cursor-pointer bg-[#2A2A2D] hover:bg-[#D5A754] text-white px-4 flex items-center justify-center transition-all">
                        <ImageIcon className="w-4 h-4" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, idx)}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                  {img.url && (
                    <div className="aspect-[3/4] border border-[#2A2A2D] bg-[#0A0A0A] relative overflow-hidden group/img rounded-sm">
                      <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#141414] p-8 border border-[#2A2A2D] shadow-sm space-y-8 rounded-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] border-l-2 border-[#D5A754] pl-4">Organization</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Collection</label>
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

          <div className="space-y-4 pt-4">
            <button 
              disabled={saving}
              type="submit" 
              className="w-full bg-white text-black py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#D5A754] transition-all flex items-center justify-center gap-3 shadow-2xl"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Commit Adjustments
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
