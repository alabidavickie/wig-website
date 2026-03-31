"use client";

import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
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
  }, []);

  const handleAddToCart = (item: any) => {
    addItemToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success("Added to Bag", { description: item.name });
  };

  const handleRemoveFromWishlist = (item: any) => {
    removeItem(item.id);
    toast.info("Removed from Wishlist", { description: item.name });
  };

  const handleAddAll = () => {
    if (items.length === 0) return;
    items.forEach(handleAddToCart);
    toast.success(`${items.length} item${items.length > 1 ? "s" : ""} added to Bag`);
  };

  // Don't render until hydrated — prevents localStorage mismatch
  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <Heart className="w-8 h-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl text-foreground bg-background mx-auto font-sans p-8 md:p-12 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-4">Saved Masterpieces</h3>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter uppercase italic leading-none">Your <br /> Wishlist</h1>
        </div>
        {items.length > 0 && (
          <Button
            onClick={handleAddAll}
            className="bg-[#D5A754] hover:bg-[#E6B964] text-black font-bold rounded-full px-10 h-14 text-[11px] uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3"
          >
            <ShoppingBag className="w-4 h-4" />
            Add All to Bag
          </Button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-8">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
            <Heart className="w-10 h-10 text-foreground/20" />
          </div>
          <div className="text-center space-y-3">
            <p className="text-[14px] font-bold uppercase tracking-[0.3em] text-foreground">Your Wishlist is Empty</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Save items you love to find them here later</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full px-10 h-14 bg-[#D5A754] hover:bg-[#E6B964] text-black text-[11px] font-bold uppercase tracking-widest transition-all shadow-xl"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-10">
            {items.length} saved item{items.length > 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
            {items.map((item) => (
              <div key={item.id} className="group flex flex-col">
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-[32px] border border-border shadow-sm transition-all duration-500">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    className="absolute top-4 right-4 w-10 h-10 bg-background/90 backdrop-blur-sm flex items-center justify-center rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Add to bag - appears on hover */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="absolute bottom-6 left-6 right-6 bg-background text-foreground py-4 text-[11px] font-bold uppercase tracking-widest rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 shadow-2xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </button>
                </div>

                <div className="pt-6 px-2">
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-foreground mb-1">{item.name}</h3>
                  {item.category && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3">{item.category}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-[18px] font-serif italic text-foreground">
                      <Price amount={item.price} />
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#D5A754] hover:underline transition-all"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
