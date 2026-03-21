"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/useCartStore';
import { toast } from "sonner";
import { Heart, Share2, ShieldCheck, Truck } from 'lucide-react';

import { Price } from "@/components/storefront/price";

export default function ProductClient({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState<any>(product.variants?.[0] || null);
  const [isAdded, setIsAdded] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [product]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: selectedVariant?.price_override || product.base_price || product.price,
      image: product.image || product.images?.[0],
      quantity: 1,
      variant: selectedVariant ? {
        name: selectedVariant.name,
        ...selectedVariant.attributes
      } : undefined,
    });
    
    toast.success("Added to Bag", {
      description: product.name,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1D]" suppressHydrationWarning>
      <div className="h-[80px] sm:h-[100px] md:h-[120px]"></div>

      <div className="max-w-[1600px] mx-auto py-8 sm:py-12 px-4 sm:px-6 md:px-12">
        <div className="mb-8 sm:mb-12 reveal">
          <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[120px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-20" suppressHydrationWarning>
          <div className="space-y-6 reveal">
            {(product.images || [product.image]).map((src: string, idx: number) => (
              <div key={idx} className="bg-[#FAF9F6] aspect-[3/4] overflow-hidden rounded-[32px] border border-gray-100/50 group relative">
                <Image
                  src={src}
                  alt={`${product.name} view ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority={idx === 0}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-[160px] h-fit space-y-8 md:space-y-12 reveal" suppressHydrationWarning>
            <div className="space-y-4 md:space-y-6" suppressHydrationWarning>
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400">{product.category}</h3>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl uppercase tracking-tighter leading-tight italic">
                  {product.name}
                </h1>
              </div>
              <div className="text-xl md:text-2xl font-serif text-white">
                <Price amount={selectedVariant?.price_override || product.base_price || product.price} />
              </div>
            </div>

            <div className="space-y-6" suppressHydrationWarning>
              <p className="text-[14px] md:text-[15px] leading-relaxed text-white/80 max-w-lg">
                {product.description}
              </p>
              
              <div className="flex flex-wrap gap-4 md:gap-8" suppressHydrationWarning>
                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-300 whitespace-nowrap">
                  <Truck className="w-4 h-4" /> Complimentary Shipping
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-300 whitespace-nowrap">
                  <ShieldCheck className="w-4 h-4" /> Lifetime Warranty
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {product.variants.length > 0 && (
                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Select Options</label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`min-w-[100px] px-6 py-4 text-[11px] font-bold border transition-all rounded-full uppercase tracking-widest cursor-pointer ${
                          selectedVariant?.id === v.id 
                          ? 'border-black bg-black text-white shadow-lg' 
                          : 'border-gray-100 hover:border-black text-zinc-300'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 sm:gap-4">
                <Button 
                  onClick={handleAddToCart}
                  className={`flex-1 py-7 sm:py-8 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] transition-all rounded-full shadow-2xl cursor-pointer ${
                    isAdded 
                    ? 'bg-green-600 text-white hover:bg-green-600' 
                    : 'bg-[#1A1A1D] text-white hover:bg-black'
                  }`}
                >
                  {isAdded ? 'Piece Added to Bag' : 'Add to Bag'}
                </Button>
                <button className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-100 rounded-full flex items-center justify-center hover:border-white transition-all cursor-pointer">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-100 rounded-full flex items-center justify-center hover:border-white transition-all cursor-pointer">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="p-8 bg-[#FAF9F6] rounded-[32px] border border-gray-100 flex items-center gap-6">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                   <ShieldCheck className="w-6 h-6 text-[#D5A754]" />
                 </div>
                 <div>
                   <h4 className="text-[12px] font-bold uppercase tracking-widest mb-1">Authenticity Guaranteed</h4>
                   <p className="text-[11px] text-zinc-400 uppercase font-bold tracking-widest">Silk Haus Certificate Included</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
