"use client";

import { useEffect, useState } from "react";
import { Heart, SlidersHorizontal, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";

import { Price } from "@/components/storefront/price";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleAddToCart = (item: any) => {
    addItemToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    toast.success("Added to Bag", {
      description: item.name,
    });
  };

  const handleRemoveFromWishlist = (item: any) => {
    removeItem(item.id);
    toast.info("Removed from Wishlist", {
      description: item.name,
    });
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-7xl text-white bg-background mx-auto font-sans p-8 md:p-12 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 reveal">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-4">Saved Masterpieces</h3>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase italic leading-none">Your <br /> Wishlist</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-gray-200 bg-transparent text-zinc-300 hover:text-white hover:border-white rounded-full px-8 h-14 gap-3 text-[11px] font-bold uppercase tracking-widest transition-all">
             <SlidersHorizontal className="w-4 h-4" />
             Refine
          </Button>
          <Button 
            onClick={() => {
              items.forEach(handleAddToCart);
              toast.success(`Added ${items.length} items to Bag`);
            }}
            className="bg-[#1A1A1D] hover:bg-black text-white font-bold rounded-full px-10 h-14 text-[11px] uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3"
          >
            <ShoppingBag className="w-4 h-4" />
            Add All to Bag
          </Button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 reveal">
           <Heart className="w-12 h-12 text-white/10" />
           <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-zinc-400">Your wishlist is empty</p>
           <Link href="/shop" className="inline-flex items-center justify-center rounded-full px-8 h-12 border border-gray-200 text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
              Browse Collection
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 pb-20">
           {items.map((item) => (
              <div key={item.id} className="reveal group cursor-pointer flex flex-col">
                 <div className="relative aspect-[3/4] bg-[#FAF9F6] overflow-hidden rounded-[40px] border border-gray-100 shadow-sm transition-all duration-700">
                     <Image 
                       src={item.image} 
                       alt={item.name} 
                       fill
                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                       className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" 
                     />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                    
                    <button 
                      onClick={() => handleRemoveFromWishlist(item)}
                      className="absolute top-6 right-6 w-12 h-12 bg-white flex items-center justify-center rounded-full text-[#1A1A1D] shadow-xl hover:bg-black hover:text-white transition-all scale-100 duration-300"
                    >
                       <Heart className="w-5 h-5 fill-current text-red-500" />
                    </button>

                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="absolute bottom-8 left-8 right-8 bg-background text-white py-5 text-[11px] font-bold uppercase tracking-widest rounded-full opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-2xl flex items-center justify-center gap-2"
                    >
                       <Plus className="w-4 h-4" /> Add to Bag
                    </button>
                 </div>
                 
                 <div className="pt-8 px-4 text-center">
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">{item.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4">{item.category}</p>
                    <div className="text-[20px] font-serif italic text-white">
                      <Price amount={item.price} />
                    </div>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
