"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Clock, Send, Instagram, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      topic: formData.get('topic') as string,
      message: formData.get('message') as string,
    };

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // Still show success to user
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground mb-6">Get In Touch</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none">
          Contact<br />
          <span className="text-[#D5A754]">Silk Haus</span>
        </h1>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pb-24 grid lg:grid-cols-[1fr_500px] gap-16 lg:gap-24 items-start">
        
        {/* Left — Info */}
        <div className="space-y-16">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-gray-100 pb-6 mb-10">Why Reach Out</h2>
            <div className="space-y-8">
              {[
                { icon: "✦", title: "Personal Styling Consultation", body: "Unsure which texture or construction suits your lifestyle? Book a complimentary 30-min virtual consultation with one of our Silk Haus stylists." },
                { icon: "✦", title: "Custom & Bespoke Orders", body: "Looking for a specific hair texture, length, density, or colour not listed in our collection? We craft bespoke pieces to your exact specifications." },
                { icon: "✦", title: "Bulk & Wholesale Inquiries", body: "Are you a salon owner or a beauty professional looking to stock our brand? Contact us for trade pricing and partnership opportunities." },
                { icon: "✦", title: "Maintenance & Care Advice", body: "Our post-purchase support is unlimited. Reach out anytime for care tips, maintenance schedules, and styling tutorials." },
              ].map((item) => (
                <div key={item.title} className="flex gap-5 items-start pb-8 border-b border-gray-50">
                  <span className="text-[#D5A754] text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest mb-2">{item.title}</h3>
                    <p className="text-[13px] text-zinc-300 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-widest border-b border-gray-100 pb-6 mb-10">Direct Contact</h2>
            <div className="space-y-6">
              <a href="mailto:follienn@gmail.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center group-hover:bg-secondary group-hover:border-white/20 transition-all">
                  <Mail className="w-4 h-4 group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email (24hr Response)</p>
                  <p className="text-[14px] font-bold">follienn@gmail.com</p>
                </div>
              </a>
              <a href="https://wa.me/234000000000" className="flex items-center gap-4 group">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center group-hover:bg-[#25D366] group-hover:border-[#25D366] transition-all">
                  <MessageCircle className="w-4 h-4 group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">WhatsApp Concierge</p>
                  <p className="text-[14px] font-bold">+234 800 000 0000</p>
                </div>
              </a>
              <a href="https://instagram.com/follienn_hair" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 group-hover:border-transparent transition-all">
                  <Instagram className="w-4 h-4 group-hover:text-foreground transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instagram</p>
                  <p className="text-[14px] font-bold">@follienn_hair</p>
                </div>
              </a>
              <a href="https://tiktok.com/@follienn_hair" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center group-hover:bg-secondary group-hover:border-white/20 transition-all">
                  <svg className="w-4 h-4 group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-2.82-.94 4.83 4.83 0 01-1.18-1.07v-.04V6.69h3z"/></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TikTok</p>
                  <p className="text-[14px] font-bold">@follienn_hair</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Business Hours</p>
                  <p className="text-[14px] font-bold">Mon – Sat: 9AM – 7PM WAT</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-gray-200 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Showroom</p>
                  <p className="text-[14px] font-bold">By Appointment — Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="lg:sticky lg:top-[160px]">
          {submitted ? (
            <div className="bg-[#FAF9F6] border border-gray-100 p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-emerald-600 text-2xl">✓</span>
              </div>
              <h3 className="font-serif text-3xl uppercase tracking-tight italic">Message Received</h3>
              <p className="text-[13px] text-zinc-300 leading-relaxed">
                Thank you for reaching out! A member of our Silk Haus team will respond within 24 hours. In the meantime, explore our curated collection.
              </p>
              <Link href="/shop" className="inline-block bg-secondary text-foreground px-10 py-4 rounded-full text-[12px] font-bold uppercase tracking-widest hover:scale-105 transition-all">
                Browse The Collection
              </Link>
            </div>
          ) : (
            <div className="bg-[#FAF9F6] border border-gray-100 p-8 md:p-12">
              <h2 className="text-[14px] font-bold uppercase tracking-widest mb-2">Send A Message</h2>
              <p className="text-[12px] text-muted-foreground uppercase tracking-widest mb-10">We'll respond within 24 hours</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                    <input type="text" name="firstName" required placeholder="Jane" className="w-full h-12 px-4 border border-gray-200 bg-white text-[13px] outline-none focus:border-[#1A1A1D] transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                    <input type="text" name="lastName" required placeholder="Cooper" className="w-full h-12 px-4 border border-gray-200 bg-white text-[13px] outline-none focus:border-[#1A1A1D] transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <input type="email" name="email" required placeholder="jane@example.com" className="w-full h-12 px-4 border border-gray-200 bg-white text-[13px] outline-none focus:border-[#1A1A1D] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topic</label>
                  <select name="topic" className="w-full h-12 px-4 border border-gray-200 bg-white text-[13px] outline-none focus:border-[#1A1A1D] transition-colors appearance-none" required>
                    <option value="">Select a topic...</option>
                    <option>Product Inquiry</option>
                    <option>Custom / Bespoke Order</option>
                    <option>Order Status</option>
                    <option>Return / Exchange</option>
                    <option>Styling Consultation</option>
                    <option>Wholesale / Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 border border-gray-200 bg-white text-[13px] outline-none focus:border-[#1A1A1D] transition-colors resize-none leading-relaxed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-secondary text-foreground py-5 text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
