import Link from "next/link";
import { Filter, ChevronDown, ChevronRight } from "lucide-react";
import { getProducts } from "@/lib/actions/products";
import ShopClient from "./shop-client";

interface Product {
  id: string;
  name: string;
  base_price?: number;
  image?: string;
  category?: string;
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const activeCategory = params.category || null;
  const productsResult = await getProducts(activeCategory || undefined);

  // Ensure we have an array even if something fails
  const products = Array.isArray(productsResult) ? productsResult : [];

  const categoryFilters = [
    { label: "All", href: "/shop", value: null },
    { label: "Closure", href: "/shop?category=Closure", value: "Closure" },
    { label: "Frontals", href: "/shop?category=Frontals", value: "Frontals" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" suppressHydrationWarning>
      {/* Header Spacer */}
      <div className="h-[90px] sm:h-[110px] lg:h-[120px]"></div>

      {/* Page Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 reveal">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-3">Storefront</h3>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif text-foreground uppercase tracking-tighter mb-4 sm:mb-6 italic">
          {activeCategory ? <>{activeCategory} <br /> Collection</> : <>The <br /> Collection</>}
        </h1>
        <p className="text-[13px] sm:text-[15px] text-muted-foreground max-w-xl leading-relaxed">
          Curated with meticulous precision for the modern elite. Discover ethically sourced raw human hair and hand-crafted Silk Haus pieces.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12 flex flex-col lg:flex-row gap-8 md:gap-16">
        {/* Sidebar Filtering — hidden on mobile/tablet, visible on desktop */}
        <aside className="hidden lg:block w-72 shrink-0 reveal" suppressHydrationWarning>
          <div className="sticky top-[140px] space-y-12" suppressHydrationWarning>
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Refine By</h3>
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-10">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Category</h4>
                  <div className="space-y-3" suppressHydrationWarning>
                    {categoryFilters.map((cat) => {
                      const isActive = activeCategory?.toLowerCase() === cat.value?.toLowerCase() || (!activeCategory && !cat.value);
                      return (
                        <Link key={cat.label} href={cat.href} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 border flex items-center justify-center transition-all rounded-full ${isActive ? 'border-[#D5A754] bg-[#D5A754]' : 'border-gray-200 group-hover:border-white/20'}`}>
                            {isActive && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                          </div>
                          <span className={`text-[13px] transition-colors ${isActive ? 'text-[#D5A754] font-bold' : 'text-foreground/80 group-hover:text-foreground'}`}>{cat.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>


                <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-gray-100 italic text-[12px] text-zinc-300 leading-relaxed">
                  &quot;Each piece is uniquely hand-finished by our master stylists. No two wings are identical.&quot;
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="flex-1" suppressHydrationWarning>
          {/* Mobile/Tablet sort bar */}
          <div className="flex justify-between items-center mb-8 sm:mb-10 md:mb-12 reveal">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{products.length} Products Found</span>
            <div className="flex items-center gap-2 cursor-pointer group px-3 sm:px-4 py-2 border border-gray-100 rounded-full hover:border-white transition-all">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest group-hover:text-foreground transition-colors">Sort: Featured</span>
              <ChevronDown className="w-3 h-3 text-zinc-300 group-hover:text-foreground transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-10 sm:gap-y-12 md:gap-y-16" suppressHydrationWarning>
            {products.length === 0 ? (
               <div className="col-span-full py-20 text-center text-gray-400 font-serif italic uppercase tracking-widest">
                 No products have been curated for this collection yet.
               </div>
            ) : (
               products.map((product: Product) => (
                 <ShopClient key={product.id} product={product} />
               ))
            )}
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="mt-24 pt-12 border-t border-gray-100 flex justify-center items-center gap-6 reveal">
              <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:bg-black hover:text-foreground transition-all bg-black text-foreground cursor-pointer">
                <span className="text-[12px] font-bold">01</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-transparent rounded-full hover:bg-gray-50 transition-all cursor-pointer">
                <span className="text-[12px] font-bold text-muted-foreground">02</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full hover:bg-black hover:text-foreground transition-all cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
