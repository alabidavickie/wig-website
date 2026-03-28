"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { searchProducts } from "@/lib/actions/products";
import { Price } from "@/components/storefront/price";

interface Product {
  id: string;
  name: string;
  base_price?: number;
  image?: string;
  category?: string;
  slug?: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Debounced search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        setHasSearched(true);
        try {
          const data = await searchProducts(value);
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-border">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Search the Collection
        </span>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#2A2A2D] transition-colors rounded-full cursor-pointer"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-6 sm:px-12 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 text-[#D5A754]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for wigs, closures, frontals..."
            className="w-full bg-transparent border-b-2 border-border focus:border-[#D5A754] pl-12 pr-4 py-4 text-xl sm:text-2xl md:text-3xl font-serif text-foreground placeholder:text-zinc-600 outline-none transition-colors tracking-tight"
          />
          {loading && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D5A754] animate-spin" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-12 pb-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-[#D5A754] animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
                Searching...
              </p>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-serif italic text-lg mb-2">
                No results found
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
                Try a different search term
              </p>
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8">
                {results.length} Result{results.length !== 1 ? "s" : ""} Found
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    onClick={onClose}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] bg-secondary border border-border overflow-hidden rounded-lg sm:rounded-xl mb-3 sm:mb-4 group-hover:border-[#D5A754]/40 transition-colors">
                      <Image
                        src={product.image || "/hero_luxury_wig_1773402385371.png"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-foreground group-hover:text-[#D5A754] transition-colors truncate">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                      {product.category}
                    </p>
                    <div className="text-[14px] font-serif italic text-foreground mt-1">
                      <Price amount={product.base_price || 0} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-zinc-600 font-serif italic text-lg">
                Start typing to search our luxury collection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
