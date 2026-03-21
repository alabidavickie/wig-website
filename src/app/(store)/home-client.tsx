"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

import { Price } from '@/components/storefront/price';

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
    <div className="bg-background min-h-screen font-sans text-white" suppressHydrationWarning>
      {/* Header Spacer */}
      <div className="h-[90px] sm:h-[110px] lg:h-[130px]" suppressHydrationWarning></div>

      {/* Hero Section — Full-bleed responsive hero with 4 breakpoints */}
      <section className="px-2 sm:px-3 md:px-6 lg:px-10 mb-8 md:mb-12">
        <section className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[4/3] lg:aspect-auto lg:h-[88vh] w-full flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl group" suppressHydrationWarning>
          
          {/* Mobile Image (< 640px) — Tall portrait */}
          <div className="block sm:hidden absolute inset-0 w-full h-full">
            <Image 
              src="/images/hero_mobile_v3.jpg" 
              alt="Silk Haus by Follienn" 
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover object-top scale-100 transition-transform duration-[5s] ease-out group-hover:scale-[1.03]" 
            />
          </div>

          {/* Mini Tablet Image (640px - 768px) — Narrower portrait */}
          <div className="hidden sm:block md:hidden absolute inset-0 w-full h-full">
            <Image 
              src="/images/hero_mini_tablet_v3.jpg" 
              alt="Silk Haus by Follienn" 
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover object-top scale-100 transition-transform duration-[5s] ease-out group-hover:scale-[1.03]" 
            />
          </div>

          {/* Tablet Image (768px - 1024px) — Landscape with silks */}
          <div className="hidden md:block lg:hidden absolute inset-0 w-full h-full">
            <Image 
              src="/images/hero_tablet_v3.jpg" 
              alt="Silk Haus by Follienn" 
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover object-center scale-100 transition-transform duration-[5s] ease-out group-hover:scale-[1.03]" 
            />
          </div>

          {/* Desktop Image (>= 1024px) — Wide landscape with logo on right */}
          <div className="hidden lg:block absolute inset-0 w-full h-full">
            <Image 
              src="/images/hero_desktop_v3.jpg" 
              alt="Silk Haus by Follienn" 
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover object-center scale-100 transition-transform duration-[5s] ease-out group-hover:scale-[1.03]" 
            />
          </div>

          {/* Subtle gradient overlay at bottom for button legibility */}
          <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-52 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
          
          {/* Shop Now CTA + Shop Icon */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-8 sm:pb-10 md:pb-14 lg:pb-20 text-center px-4">
            <Link 
              href="/shop" 
              className="group/btn relative inline-flex items-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-sm text-[#1A1A1D] px-7 sm:px-10 md:px-14 py-3 sm:py-3.5 md:py-4 text-[10px] sm:text-[11px] md:text-[12px] uppercase tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.35em] font-extrabold hover:bg-[#1A1A1D] hover:text-white transition-all duration-500 rounded-full shadow-2xl cursor-pointer hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] transition-transform duration-300 group-hover/btn:scale-110" strokeWidth={1.5} />
              Shop Now
            </Link>
          </div>
        </section>
      </section>

      {/* Intro Text */}
      <section className="py-12 md:py-16 lg:py-20 px-6 text-center max-w-4xl mx-auto">
        <h3 className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 mb-4 md:mb-8">Curated Editorial</h3>
        <p className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-5xl leading-tight text-white">
          "We don't just sell hair; we provide the ultimate foundation for your <span className="italic text-zinc-300">most confident self</span>."
        </p>
      </section>

      {/* Category Banners */}
      <section className="px-4 sm:px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-24">
        {[
          { title: "HD Lace Frontal", img: "/hero_luxury_wig_1773402385371.png" },
          { title: "Virgin Bundles", img: "/hair_bundles_gold_1773402406137.png" },
          { title: "Silk Maintenance", img: "/wig_atelier_salon_1773402424116.png" }
        ].map((cat, i) => (
          <div key={i} className={cn(
            "relative aspect-[4/5] group overflow-hidden cursor-pointer rounded-xl md:rounded-2xl bg-secondary/20",
            i === 2 && "sm:col-span-2 md:col-span-1"
          )}>
            <Image 
              src={cat.img} 
              alt={cat.title} 
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s] ease-out mix-blend-multiply" 
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 flex flex-col items-center justify-end pb-8 md:pb-12">
              <h3 className="font-serif text-white text-xl sm:text-2xl md:text-3xl uppercase tracking-widest mb-3 md:mb-4 italic">{cat.title}</h3>
              <div className="w-10 h-px bg-white/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          </div>
        ))}
      </section>

      {/* Trending Section */}
      <section className="bg-secondary/10 py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-12 mb-16 md:mb-24 rounded-[24px] md:rounded-[40px] mx-3 sm:mx-6">
        <div className="max-w-[1600px] mx-auto" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 md:mb-16 gap-4">
            <div className="space-y-2 md:space-y-4">
              <h3 className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400">Silk Haus Selection</h3>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter italic">Top <br className="hidden sm:block" /> Favorites</h2>
            </div>
            <Link href="/shop" className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest border-b border-white/20 pb-1 hover:opacity-50 transition-opacity cursor-pointer self-start sm:self-auto">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400 font-serif italic uppercase tracking-widest text-sm">
                 No Custom Pieces Available Yet.
              </div>
            ) : (
              products.map((product, i) => (
                <div key={i} className="flex flex-col group cursor-pointer relative">
                  <Link href={`/shop/${product.id}`} className="block overflow-hidden rounded-xl md:rounded-2xl border border-gray-100/50 aspect-[3/4] relative mb-4 md:mb-8">
                    <Image 
                      src={product.image || product.img} 
                      alt={product.name} 
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Quick Add Button — always visible on mobile, hover on desktop */}
                    <button 
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="absolute bottom-3 md:bottom-6 left-3 md:left-6 right-3 md:right-6 bg-background text-white py-2.5 md:py-4 text-[9px] md:text-[11px] font-bold uppercase tracking-widest rounded-full md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" /> Quick Add
                    </button>
                  </Link>

                  {/* Wishlist Button — always visible on mobile, hover on desktop */}
                  <button 
                    onClick={(e) => handleToggleWishlist(e, product)}
                    className={cn(
                      "absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer",
                      isInWishlist(product.id) ? "bg-black text-white" : "bg-white text-gray-400 md:opacity-0 md:group-hover:opacity-100"
                    )}
                  >
                    <Heart className={cn("w-3 h-3 md:w-4 md:h-4", isInWishlist(product.id) && "fill-current")} />
                  </button>

                  <Link href={`/shop/${product.id}`}>
                    <h4 className="text-[11px] sm:text-[12px] md:text-[14px] font-bold uppercase tracking-wider md:tracking-widest text-white mb-1 truncate">{product.name}</h4>
                    <div className="text-zinc-300 text-[12px] md:text-[14px] font-medium">
                      <Price amount={product.base_price || product.price} />
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="px-4 sm:px-6 md:px-12 mb-16 md:mb-24">
        <div className="max-w-[1200px] mx-auto text-center mb-10 md:mb-16">
          <h3 className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400 mb-3 md:mb-4">What Our Clients Say</h3>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter italic">Loved by <br /> Thousands</h2>
        </div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
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
              className="bg-[#FAF9F6] border border-gray-100 rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between text-left hover:shadow-lg transition-shadow duration-500"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4 md:mb-6">
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <svg key={s} className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C5A880]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-[13px] md:text-[14px] leading-[1.8] md:leading-[1.9] text-[#1A1A1D]/70 mb-6 md:mb-8 font-light">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              {/* Reviewer Info */}
              <div className="border-t border-gray-100 pt-4 md:pt-6">
                <p className="text-[12px] md:text-[13px] font-bold uppercase tracking-widest text-[#1A1A1D]">{review.name}</p>
                <p className="text-[10px] md:text-[11px] text-[#C5A880] font-medium uppercase tracking-widest mt-1">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full width Feature */}
      <section className="px-3 sm:px-6 md:px-12 mb-16 md:mb-24">
        <div className="relative aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/7] w-full overflow-hidden rounded-[24px] md:rounded-[40px] group">
          <Image 
            src="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Craftsmanship" 
            fill
            sizes="100vw"
            className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 md:bg-black/10 flex flex-col items-center justify-center text-center p-6 sm:p-8 md:p-12">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white uppercase tracking-tighter mb-4 sm:mb-6 md:mb-8 italic">The Silk Haus <br /> Standard</h2>
            <Link href="/about" className="bg-background text-white px-8 md:px-10 py-3.5 md:py-4 text-[11px] md:text-[13px] font-bold uppercase tracking-widest rounded-full hover:bg-[#1A1A1D] hover:text-white transition-all cursor-pointer">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
