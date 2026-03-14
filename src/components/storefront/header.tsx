"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Heart, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const itemCount = useCartStore((state) => 
    mounted ? state.items.reduce((total, item) => total + item.quantity, 0) : 0
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50" suppressHydrationWarning>
      {/* Announcement Bar */}
      <div className="bg-[#C5A880] text-white py-2 flex justify-center items-center" suppressHydrationWarning>
        <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em]" suppressHydrationWarning>
          CRAFTED FOR SOFTNESS • DESIGNED FOR CONFIDENCE
        </span>
      </div>

      {/* Main Header */}
      <header className="fixed w-full top-[31px] lg:top-[35px] left-0 z-40 px-6 md:px-12 py-2.5 lg:py-3.5 transition-all duration-500 border-b border-[#1A1A1D]/5 bg-white/70 backdrop-blur-md" suppressHydrationWarning>
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-3 items-center">
          
          {/* Mobile Menu Trigger & Left Mobile Nav */}
          <div className="flex items-center gap-4 lg:hidden" suppressHydrationWarning>
            <button 
              className="hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
              suppressHydrationWarning
            >
              <Menu className="w-[20px] h-[20px] text-[#1A1A1D]" strokeWidth={1.2} />
            </button>
            <button className="hover:opacity-60 transition-opacity cursor-pointer" suppressHydrationWarning>
              <Search className="w-[18px] h-[18px] text-[#1A1A1D]" strokeWidth={1.2} />
            </button>
          </div>

          {/* Desktop Left: Navigation */}
          <nav className="hidden lg:flex items-center gap-10 text-[10px] xl:text-[11px] font-semibold tracking-[0.25em] text-[#1A1A1D]/60 uppercase" suppressHydrationWarning>
            <Link href="/" className="hover:text-black transition-all duration-300 relative group cursor-pointer">
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/shop" className="hover:text-black transition-all duration-300 relative group cursor-pointer">
              SHOP
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="hover:text-black transition-all duration-300 relative group cursor-pointer">
              ABOUT
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Center: Logo */}
          <div className="flex justify-center flex-1">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image 
                src="/images/logo_premium_v2.png" 
                alt="SILK HAUS" 
                width={150}
                height={75}
                className="h-[40px] lg:h-[55px] w-auto object-contain" 
                priority
              />
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center justify-end gap-2 md:gap-5" suppressHydrationWarning>
            <button className="hidden sm:flex hover:opacity-60 transition-opacity cursor-pointer p-2 items-center" suppressHydrationWarning>
              <Search className="w-[17px] h-[17px] text-[#1A1A1D]" strokeWidth={1.2} />
            </button>
            <Link href="/login" className="hover:opacity-60 transition-opacity cursor-pointer p-2" suppressHydrationWarning>
              <User className="w-[17px] h-[17px] text-[#1A1A1D]" strokeWidth={1.2} />
            </Link>
            <Link href="/dashboard/wishlist" className="hidden sm:flex hover:opacity-60 transition-opacity cursor-pointer p-2" suppressHydrationWarning>
              <Heart className="w-[17px] h-[17px] text-[#1A1A1D]" strokeWidth={1.2} />
            </Link>
            <Link href="/cart" className="hover:opacity-60 transition-opacity relative cursor-pointer flex items-center p-2" suppressHydrationWarning>
              <ShoppingBag className="w-[17px] h-[17px] text-[#1A1A1D]" strokeWidth={1.2} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#1A1A1D] text-white text-[8px] w-[13px] h-[13px] flex items-center justify-center rounded-full font-medium">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu - Moved outside <header> for true isolation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col p-8 animate-in slide-in-from-left duration-500 overflow-y-auto" suppressHydrationWarning>
          <div className="flex justify-between items-center mb-16" suppressHydrationWarning>
            <span className="inline-block bg-[#C5A880] rounded-lg px-4 py-2">
              <Image 
                src="/images/logo2.png" 
                alt="SILK HAUS" 
                width={80}
                height={40}
                className="h-[40px] w-auto object-contain scale-110" 
              />
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer" suppressHydrationWarning>
              <X className="w-6 h-6 text-[#1A1A1D]" />
            </button>
          </div>
          
          <nav className="flex flex-col gap-8 text-[12px] font-bold tracking-[0.2em] text-[#1A1A1D]/90" suppressHydrationWarning>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 transition-all duration-300 cursor-pointer">HOME</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 transition-all duration-300 cursor-pointer">SHOP</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 transition-all duration-300 cursor-pointer">ABOUT</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 transition-all duration-300 cursor-pointer">FAQ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 transition-all duration-300 cursor-pointer">CONTACT</Link>
          </nav>

          <div className="mt-auto border-t border-[#1A1A1D]/10 pt-12 space-y-6" suppressHydrationWarning>
             <Link href="/dashboard/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#1A1A1D]/70 cursor-pointer hover:text-black transition-colors">
                <Heart className="w-4 h-4" /> Wishlist
             </Link>
             <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#1A1A1D]/70 cursor-pointer hover:text-black transition-colors">
                <User className="w-4 h-4" /> My Account
             </Link>
          </div>
        </div>
      )}
    </div>
  );
};
