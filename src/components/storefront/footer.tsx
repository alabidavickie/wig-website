import Link from 'next/link';
import { Instagram, MessageCircle, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#1A1A1D] text-white pt-12 sm:pt-16 md:pt-24 mt-auto" suppressHydrationWarning>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12" suppressHydrationWarning>
        
        {/* Top — Newsletter + Brand */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 pb-10 sm:pb-16 border-b border-white/10" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic uppercase tracking-tighter leading-none mb-3 sm:mb-4">
              Inside<br />
              <span className="text-[#D5A754]">Silk Haus.</span>
            </h2>
            <p className="text-[13px] text-white/50 leading-relaxed max-w-sm">
              Be first to know about new arrivals, exclusive offers, hair care tutorials, and member-only early access events.
            </p>
          </div>
          <div className="flex flex-col justify-center" suppressHydrationWarning>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">Join The List</p>
            <div className="flex flex-col sm:flex-row" suppressHydrationWarning>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 px-5 py-4 text-[13px] focus:outline-none focus:border-[#D5A754] transition-colors"
              />
              <button className="bg-[#D5A754] text-[#1A1A1D] px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#E6B964] transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-3 uppercase tracking-widest">No spam. Unsubscribe anytime.</p>
          </div>
        </div>

        {/* Middle — Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10 py-10 sm:py-16 border-b border-white/10" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D5A754] mb-6">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Collections", href: "/shop" },
                { label: "HD Lace Frontals", href: "/shop" },
                { label: "Glueless Wigs", href: "/shop" },
                { label: "Raw Bundles", href: "/shop" },
                { label: "Closure Wigs", href: "/shop" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div suppressHydrationWarning>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D5A754] mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Silk Haus", href: "/about" },
                { label: "Our Story", href: "/about" },
                { label: "Sustainability", href: "/about" },
                { label: "Careers", href: "/contact" },
                { label: "Press", href: "/contact" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div suppressHydrationWarning>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D5A754] mb-6">Support</h4>
            <ul className="space-y-3">
              {[
                { label: "Help & FAQ", href: "/faq" },
                { label: "Contact Us", href: "/contact" },
                { label: "Shipping Policy", href: "/shipping-policy" },
                { label: "Refund Policy", href: "/refund-policy" },
                { label: "Payment Policy", href: "/payment-policy" },
                { label: "Terms & Conditions", href: "/terms-and-conditions" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div suppressHydrationWarning>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#D5A754] mb-6">Account</h4>
            <ul className="space-y-3">
              {[
                { label: "My Account", href: "/dashboard" },
                { label: "My Orders", href: "/dashboard/orders" },
                { label: "My Wishlist", href: "/dashboard/wishlist" },
                { label: "Sign In", href: "/login" },
                { label: "Create Account", href: "/signup" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 py-6 sm:py-8" suppressHydrationWarning>
          <div className="flex items-center gap-4" suppressHydrationWarning>
            <h2 className="font-serif text-2xl tracking-widest uppercase">SILK HAUS</h2>
            <span className="text-white/20 hidden md:inline">|</span>
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest hidden md:block">Premium Wigs</p>
          </div>

          <div className="flex items-center gap-5" suppressHydrationWarning>
            <a href="https://instagram.com/follienn_hair" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#D5A754] hover:text-[#D5A754] transition-all cursor-pointer">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://tiktok.com/@follienn_hair" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#D5A754] hover:text-[#D5A754] transition-all cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-2.82-.94 4.83 4.83 0 01-1.18-1.07v-.04V6.69h3z"/></svg>
            </a>
            <a href="mailto:follienn@gmail.com" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#D5A754] hover:text-[#D5A754] transition-all cursor-pointer">
              <Mail className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[11px] text-zinc-400 uppercase tracking-widest" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Silk Haus. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
