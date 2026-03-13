"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { Heart, Plus } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

export default function HomeClient({ products }: { products: any[] }) {
  const [mounted, setMounted] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.base_price ? parseFloat(product.base_price.toString().replace(/[^0-9.]/g, '')) : parseFloat(product.price?.toString().replace(/[^0-9.]/g, '') || '0'),
      image: product.image || product.img,
      quantity: 1
    });
    toast.success("Added to Bag", {
      description: product.name,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const beingAdded = !isInWishlist(product.id);
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.base_price || product.price,
      image: product.image || product.img,
      category: "Silk Haus Piece"
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

  if (!mounted) return null;

  return (
    <div className="bg-background min-h-screen font-sans text-[#1A1A1D]" suppressHydrationWarning>
      {/* Header Spacer */}
      <div className="h-[120px]" suppressHydrationWarning></div>

      {/* Hero Section */}
      <section className="px-6 md:px-12 mb-12">
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden rounded-2xl group" suppressHydrationWarning>
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <Image 
            src="/hero_luxury_wig_1773402385371.png" 
            alt="Luxury HD Lace Wig" 
            fill
            priority
            className="w-full h-full object-cover scale-105 active transition-transform duration-[2s] ease-out group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center text-center px-4">
            <h2 className="font-serif text-5xl md:text-8xl lg:text-9xl text-white mb-10 uppercase tracking-tighter leading-none italic">
              Silk <br /> Living
            </h2>
            <Link 
              href="/shop" 
              className="bg-white text-[#1A1A1D] px-12 py-5 text-[14px] uppercase tracking-[0.3em] font-bold hover:bg-[#1A1A1D] hover:text-white transition-all rounded-full shadow-xl cursor-pointer"
            >
              Enter The Salon
            </Link>
          </div>
        </section>
      </section>

      {/* Intro Text */}
      <section className="section-spacing px-6 text-center max-w-4xl mx-auto">
        <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[#1A1A1D]/40 mb-8">Curated Editorial</h3>
        <p className="font-serif text-3xl md:text-5xl leading-tight text-[#1A1A1D]">
          "We don't just sell hair; we provide the ultimate foundation for your <span className="italic text-[#1A1A1D]/60">most confident self</span>."
        </p>
      </section>

      {/* Category Banners */}
      <section className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {[
          { title: "HD Lace Frontal", img: "/hero_luxury_wig_1773402385371.png" },
          { title: "Virgin Bundles", img: "/hair_bundles_gold_1773402406137.png" },
          { title: "Silk Maintenance", img: "/wig_atelier_salon_1773402424116.png" }
        ].map((cat, i) => (
          <div key={i} className="relative aspect-[4/5] group overflow-hidden cursor-pointer rounded-2xl bg-secondary/20">
            <Image 
              src={cat.img} 
              alt={cat.title} 
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s] ease-out mix-blend-multiply" 
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 flex flex-col items-center justify-end pb-12">
              <h3 className="font-serif text-white text-3xl uppercase tracking-widest mb-4 italic">{cat.title}</h3>
              <div className="w-10 h-px bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          </div>
        ))}
      </section>

      {/* Trending Section */}
      <section className="bg-secondary/10 section-spacing px-6 md:px-12 mb-24 rounded-[40px] mx-6">
        <div className="max-w-[1600px] mx-auto" suppressHydrationWarning>
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[#1A1A1D]/40">Silk Haus Selection</h3>
              <h2 className="font-serif text-5xl md:text-6xl uppercase tracking-tighter italic">Top <br /> Favorites</h2>
            </div>
            <Link href="/shop" className="text-[12px] font-bold uppercase tracking-widest border-b border-[#1A1A1D] pb-1 hover:opacity-50 transition-opacity cursor-pointer">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400 font-serif italic uppercase tracking-widest text-sm">
                 No Custom Pieces Available Yet.
              </div>
            ) : (
              products.map((product, i) => (
                <div key={i} className="flex flex-col group cursor-pointer relative">
                  <Link href={`/shop/${product.id}`} className="block overflow-hidden rounded-2xl border border-gray-100/50 aspect-[4/5] relative mb-8">
                    <Image 
                      src={product.image || product.img} 
                      alt={product.name} 
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Quick Add Overlay Button */}
                    <button 
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="absolute bottom-6 left-6 right-6 bg-white text-[#1A1A1D] py-4 text-[11px] font-bold uppercase tracking-widest rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Quick Add
                    </button>
                  </Link>

                  {/* Wishlist Button */}
                  <button 
                    onClick={(e) => handleToggleWishlist(e, product)}
                    className={cn(
                      "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer",
                      isInWishlist(product.id) ? "bg-black text-white" : "bg-white text-gray-400 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isInWishlist(product.id) && "fill-current")} />
                  </button>

                  <Link href={`/shop/${product.id}`}>
                    <h4 className="text-[14px] font-bold uppercase tracking-widest text-[#1A1A1D] mb-1 truncate">{product.name}</h4>
                    <p className="text-[#1A1A1D]/60 text-[14px] font-medium">${product.base_price || product.price}</p>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="px-6 md:px-12 mb-24">
        <div className="max-w-[1200px] mx-auto text-center mb-16">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-[#1A1A1D]/40 mb-4">What Our Clients Say</h3>
          <h2 className="font-serif text-4xl md:text-5xl uppercase tracking-tighter italic">Loved by <br /> Thousands</h2>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Amara J.",
              location: "Lagos, Nigeria",
              stars: 5,
              text: "I've tried so many wig brands, but Silk Haus is in a league of its own. The HD lace melted into my skin perfectly — people genuinely thought it was my real hair. I've never felt more beautiful and confident. This is luxury redefined.",
            },
            {
              name: "Chioma E.",
              location: "London, UK",
              stars: 5,
              text: "From the unboxing experience to the quality of the hair, everything screams premium. The texture is buttery soft, zero shedding after 3 months, and the curl pattern is still intact. Silk Haus has a customer for life. 💕",
            },
            {
              name: "Destiny A.",
              location: "Atlanta, USA",
              stars: 5,
              text: "I ordered the Virgin Bundles for my wedding and I cried when I saw myself in the mirror. The hair was flawless. My stylist even asked where I got it because she wants to stock it in her salon. Silk Haus, you did THAT! ✨",
            },
          ].map((review, i) => (
            <div
              key={i}
              className="bg-[#FAF9F6] border border-gray-100 rounded-2xl p-8 md:p-10 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-500"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-[#C5A880]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[14px] leading-[1.9] text-[#1A1A1D]/70 mb-8 font-light">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Reviewer Info */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-[13px] font-bold uppercase tracking-widest text-[#1A1A1D]">{review.name}</p>
                <p className="text-[11px] text-[#C5A880] font-medium uppercase tracking-widest mt-1">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full width Feature */}
      <section className="px-6 md:px-12 mb-24">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-[40px] group">
          <Image 
            src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Craftsmanship" 
            fill
            sizes="100vw"
            className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center text-center p-12">
            <h2 className="font-serif text-5xl md:text-7xl text-white uppercase tracking-tighter mb-8 italic">The Silk Haus <br /> Standard</h2>
            <Link href="/about" className="bg-white text-[#1A1A1D] px-10 py-4 text-[13px] font-bold uppercase tracking-widest rounded-full hover:bg-[#1A1A1D] hover:text-white transition-all cursor-pointer">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
