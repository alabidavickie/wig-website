"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Heart, Search, Menu, X, LogOut, LayoutDashboard, UserCircle, Settings, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SearchOverlay } from '@/components/storefront/search-overlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  const itemCount = useCartStore((state) => 
    mounted ? state.items.reduce((total, item) => total + item.quantity, 0) : 0
  );

  useEffect(() => {
    setMounted(true);
    
    // Fetch initial user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50" suppressHydrationWarning>
      {/* Announcement Bar */}
      <div className="bg-[#C5A880] text-foreground py-2 flex justify-center items-center" suppressHydrationWarning>
        <span className="text-[9px] sm:text-[10px] md:text-[11px] font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em]" suppressHydrationWarning>
          CRAFTED FOR SOFTNESS • DESIGNED FOR CONFIDENCE
        </span>
      </div>

      {/* Main Header */}
      <header className="fixed w-full top-[29px] sm:top-[31px] lg:top-[35px] left-0 z-40 px-4 sm:px-6 md:px-12 py-2 sm:py-2.5 lg:py-3.5 transition-all duration-500 border-b border-border/50 bg-background/90 backdrop-blur-xl text-foreground" suppressHydrationWarning>
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center" suppressHydrationWarning>
          
          {/* Left: Mobile Menu Trigger + Search (mobile) or Desktop Nav (desktop) */}
          <div className="flex items-center gap-3 sm:gap-4 lg:hidden" suppressHydrationWarning>
            <button 
              className="hover:opacity-60 transition-opacity cursor-pointer flex items-center justify-center p-1.5 sm:p-2 -ml-1"
              onClick={() => setIsMobileMenuOpen(true)}
              suppressHydrationWarning
            >
              <Menu className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-foreground" strokeWidth={1.2} />
            </button>
            <button 
              className="hover:opacity-60 transition-opacity cursor-pointer p-1.5 sm:p-2" 
              suppressHydrationWarning
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-foreground" strokeWidth={1.2} />
            </button>
          </div>

          {/* Desktop Left: Navigation */}
          <nav className="hidden lg:flex items-center gap-10 text-[10px] xl:text-[11px] font-semibold tracking-[0.25em] text-muted-foreground uppercase" suppressHydrationWarning>
            <Link href="/" className="hover:text-foreground transition-all duration-300 relative group cursor-pointer">
              HOME
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D5A754] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/shop" className="hover:text-foreground transition-all duration-300 relative group cursor-pointer">
              SHOP
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D5A754] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="hover:text-foreground transition-all duration-300 relative group cursor-pointer">
              ABOUT
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D5A754] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Center: Logo */}
          <div className="flex justify-center" suppressHydrationWarning>
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <Image 
                src="/images/logo_main.png" 
                alt="SILK HAUS" 
                width={150}
                height={75}
                className="h-[35px] sm:h-[40px] lg:h-[55px] w-auto object-contain" 
                priority
              />
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-5" suppressHydrationWarning>
            <button 
              className="hidden sm:flex hover:opacity-60 transition-opacity cursor-pointer p-1.5 sm:p-2 items-center" 
              suppressHydrationWarning
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-foreground" strokeWidth={1.2} />
            </button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button className="hover:opacity-60 transition-opacity cursor-pointer p-1.5 sm:p-2 outline-none">
                      <User className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-[#D5A754]" strokeWidth={1.5} />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56 bg-card border-border text-foreground rounded-xl p-2 shadow-2xl backdrop-blur-xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Welcome Back</p>
                      <p className="text-[12px] font-bold text-foreground truncate">{profile?.full_name || user.email}</p>
                      {profile?.role === 'admin' && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#D5A754]/10 text-[#D5A754] text-[8px] font-bold uppercase tracking-widest rounded">Admin Access</span>
                      )}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    render={
                      <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-[#D5A754]" /> Dashboard
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground group-hover:text-[#D5A754]" /> My Orders
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                        <UserCircle className="w-4 h-4 text-muted-foreground group-hover:text-[#D5A754]" /> My Profile
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-muted rounded-lg transition-colors cursor-pointer group">
                        <Settings className="w-4 h-4 text-muted-foreground group-hover:text-[#D5A754]" /> Settings
                      </Link>
                    }
                  />
                  
                  {profile?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        render={
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754]/10 text-[#D5A754] rounded-lg transition-colors cursor-pointer group">
                            <ShieldCheck className="w-4 h-4" /> Admin Panel
                          </Link>
                        }
                      />
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 hover:text-red-400 rounded-lg transition-colors cursor-pointer group"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hover:opacity-60 transition-opacity cursor-pointer p-1.5 sm:p-2">
                <User className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-foreground" strokeWidth={1.2} />
              </Link>
            )}
            <Link href="/dashboard/wishlist" className="hidden sm:flex hover:opacity-60 transition-opacity cursor-pointer p-1.5 sm:p-2" suppressHydrationWarning>
              <Heart className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-foreground" strokeWidth={1.2} />
            </Link>
            <Link href="/cart" className="hover:opacity-60 transition-opacity relative cursor-pointer flex items-center p-1.5 sm:p-2" suppressHydrationWarning>
              <ShoppingBag className="w-[16px] h-[16px] md:w-[17px] md:h-[17px] text-foreground" strokeWidth={1.2} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 bg-[#D5A754] text-black text-[7px] sm:text-[8px] w-[12px] h-[12px] sm:w-[13px] sm:h-[13px] flex items-center justify-center rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col p-6 sm:p-8 animate-in slide-in-from-left duration-500 overflow-y-auto text-foreground" suppressHydrationWarning>
          <div className="flex justify-between items-center mb-12 sm:mb-16" suppressHydrationWarning>
            <span className="inline-block bg-card border border-border rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
              <Image 
                src="/images/logo_main.png" 
                alt="SILK HAUS" 
                width={80}
                height={40}
                className="h-[32px] sm:h-[40px] w-auto object-contain scale-110" 
              />
            </span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer p-2" suppressHydrationWarning>
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
          </div>
          
          {/* Shop Now CTA — prominent on mobile */}
          <Link 
            href="/shop" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="block w-full text-center bg-[#D5A754] text-black py-4 text-[11px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-[#E6B964] transition-all duration-300 shadow-2xl mb-8 sm:mb-10"
          >
            Shop Now
          </Link>

          <nav className="flex flex-col gap-6 sm:gap-8 text-[13px] sm:text-[12px] font-bold tracking-[0.2em] text-foreground/90" suppressHydrationWarning>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 hover:text-[#D5A754] transition-all duration-300 cursor-pointer py-1">HOME</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 hover:text-[#D5A754] transition-all duration-300 cursor-pointer py-1">SHOP</Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 hover:text-[#D5A754] transition-all duration-300 cursor-pointer py-1">ABOUT</Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 hover:text-[#D5A754] transition-all duration-300 cursor-pointer py-1">FAQ</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:pl-4 hover:text-[#D5A754] transition-all duration-300 cursor-pointer py-1">CONTACT</Link>
          </nav>

          <div className="mt-auto border-t border-border pt-8 sm:pt-12 space-y-5 sm:space-y-6" suppressHydrationWarning>
             <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
                <ShoppingBag className="w-4 h-4" /> Shopping Bag
                {itemCount > 0 && (
                  <span className="ml-auto bg-[#D5A754] text-black px-2 py-0.5 rounded-full font-bold">{itemCount}</span>
                )}
             </Link>
             <Link href="/dashboard/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
                <Heart className="w-4 h-4" /> Wishlist
             </Link>
             <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1">
                <User className="w-4 h-4" /> My Account
             </Link>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
