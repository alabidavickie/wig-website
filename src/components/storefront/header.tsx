"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Heart, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = mounted ? getItemCount() : 0;

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
      <header className={`relative px-6 md:px-12 py-4 lg:py-5 transition-all duration-300 border-b border-gray-100 bg-white shadow-sm`} suppressHydrationWarning>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Mobile Menu Trigger & Left Mobile Nav */}
          <div className="flex items-center justify-between w-full lg:w-auto lg:hidden" suppressHydrationWarning>
            <div className="flex items-center gap-4">
              <button 
                className="hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center p-2 -ml-2"
                onClick={() => setIsMobileMenuOpen(true)}
                suppressHydrationWarning
              >
                <Menu className="w-[22px] h-[22px] text-[#1A1A1D]" strokeWidth={1.5} />
              </button>
              <button className="hover:opacity-60 transition-opacity cursor-pointer" suppressHydrationWarning>
                <Search className="w-[20px] h-[20px] text-[#1A1A1D]" strokeWidth={1.5} />
              </button>
            </div>
            <Link href="/" className="cursor-pointer mx-auto absolute left-1/2 -translate-x-1/2">
               <span className="inline-block bg-[#C5A880] rounded-lg px-4 py-2">
                 <Image 
                 src="/images/logo2.png" 
                 alt="SILK HAUS" 
                 width={100}
                 height={50}
                 className="h-[40px] w-auto object-contain scale-110" 
               />
               </span>
            </Link>
            <Link href="/cart" className="hover:opacity-60 transition-opacity relative cursor-pointer flex items-center justify-end w-[60px]" suppressHydrationWarning>
              <ShoppingBag className="w-[20px] h-[20px] text-[#1A1A1D]" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#1A1A1D] text-white text-[9px] w-[16px] h-[16px] flex items-center justify-center rounded-full shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Left: Logo + Navigation */}
          <div className="hidden lg:flex items-center gap-12 xl:gap-16">
            
            {/* Logo */}
            <Link href="/" className="cursor-pointer shrink-0">
              <span className="inline-block bg-[#C5A880] rounded-xl px-6 py-2.5 uppercase font-bold text-white tracking-widest text-[14px]">
                <Image 
                  src="/images/logo2.png" 
                  alt="SILK HAUS" 
                  width={140}
                  height={70}
                  className="h-[60px] xl:h-[70px] w-auto object-contain scale-125" 
                  priority
                />
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-8 xl:gap-10 text-[11px] xl:text-[12px] font-medium tracking-[0.15em] text-[#1A1A1D]/80 uppercase" suppressHydrationWarning>
              <Link href="/" className="hover:text-black hover:opacity-100 transition-colors cursor-pointer">
                HOME
              </Link>
              <Link href="/shop" className="hover:text-black hover:opacity-100 transition-colors cursor-pointer flex items-center gap-1">
                SHOP
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 mt-0.5"><path d="m6 9 6 6 6-6"/></svg>
              </Link>
              <Link href="/contact" className="hover:text-black hover:opacity-100 transition-colors cursor-pointer">
                CONTACT
              </Link>
              <Link href="/faq" className="hover:text-black hover:opacity-100 transition-colors cursor-pointer">
                FAQ
              </Link>
              <Link href="/about" className="hover:text-black hover:opacity-100 transition-colors cursor-pointer">
                ABOUT
              </Link>
            </nav>
          </div>

          {/* Desktop Right: Utility Icons */}
          <div className="hidden lg:flex items-center justify-end gap-6" suppressHydrationWarning>
            <button className="hover:opacity-60 transition-opacity cursor-pointer p-2 flex items-center" suppressHydrationWarning>
              <Search className="w-[18px] h-[18px] text-[#1A1A1D]" strokeWidth={1.5} />
            </button>
            <Link href="/dashboard/wishlist" className="hover:opacity-60 transition-opacity cursor-pointer p-2" suppressHydrationWarning>
              <User className="w-[18px] h-[18px] text-[#1A1A1D]" strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className="hover:opacity-60 transition-opacity relative cursor-pointer flex items-center p-2" suppressHydrationWarning>
              <ShoppingBag className="w-[18px] h-[18px] text-[#1A1A1D]" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#1A1A1D] text-white text-[9px] w-[15px] h-[15px] flex items-center justify-center rounded-full font-medium shadow-sm">
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
