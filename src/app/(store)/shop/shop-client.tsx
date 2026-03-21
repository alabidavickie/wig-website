"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Search } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { useEffect, useState } from "react";

import { Price } from "@/components/storefront/price";

export default function ShopClient({ product }: { product: any }) {
  const [mounted, setMounted] = useState(false);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

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
  }, [mounted]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.image,
      quantity: 1,
    });
    toast.success("Added to Bag", {
      description: product.name,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const beingAdded = !isInWishlist(product.id);
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.image,
      category: product.category,
    });
    if (beingAdded) {
      toast.success("Added to Wishlist", {
        description: product.name,
      });
    } else {
      toast.info("Removed from Wishlist", {
        description: product.name,
      });
    }
  };

  return (
    <div className="reveal group cursor-pointer flex flex-col">
      <Link href={`/shop/${product.id}`} className="relative aspect-[3/4] bg-[#FAF9F6] border border-gray-50 overflow-hidden rounded-[16px] sm:rounded-[20px] md:rounded-[24px] mb-5 sm:mb-8 shadow-sm">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
        
        {/* Actions overlay — always visible on mobile, hover on desktop */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-2 md:opacity-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all">
          <button 
            onClick={handleWishlistToggle}
            className={`w-10 h-10 sm:w-11 sm:h-11 bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-full shadow-lg cursor-pointer ${mounted && isInWishlist(product.id) ? 'bg-black text-white' : 'text-[#1A1A1D]'}`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${mounted && isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button className="w-10 h-10 sm:w-11 sm:h-11 bg-white text-[#1A1A1D] flex items-center justify-center hover:bg-black hover:text-white transition-all rounded-full shadow-lg cursor-pointer">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Quick Add Pill — always visible on mobile, hover on desktop */}
        <button 
          onClick={handleQuickAdd}
          className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 bg-white text-[#1A1A1D] py-2.5 sm:py-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded-full md:opacity-0 md:translate-y-6 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 shadow-xl cursor-pointer"
        >
          Quick Add to Bag
        </button>
      </Link>
      <div className="flex flex-col text-center px-4">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#1A1A1D] mb-1">{product.name}</h3>
        <p className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold mb-4">{product.category} • SILK HAUS</p>
        <div className="text-[16px] font-serif italic text-[#1A1A1D]">
          <Price amount={product.base_price} />
        </div>
      </div>
    </div>
  );
}
