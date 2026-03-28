import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export default function AboutPage() {
  const values = [
    { icon: "✦", title: "Uncompromising Quality", body: "Every unit is hand-selected, inspected to a 47-point standard, and certified authentic before leaving Silk Haus." },
    { icon: "✦", title: "Ethical Sourcing", body: "We work exclusively with certified ethical suppliers who share our commitment to fair trade and transparent supply chains." },
    { icon: "✦", title: "Client-First Philosophy", body: "Your satisfaction is our obsession. We offer lifetime consultations, maintenance guides, and a dedicated concierge line." },
    { icon: "✦", title: "Celebrating Black Excellence", body: "Silk Haus was born from a vision to celebrate, uplift and empower women of colour through the transformative art of hair." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="h-[120px]"></div>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground mb-6">Our Story</p>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-[110px] uppercase tracking-tighter italic leading-none mb-12 text-foreground">
          Bridging<br />Heritage.
        </h1>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <p className="text-[17px] leading-[2] text-foreground/70 max-w-xl">
            SilkHaus by Follienn is a luxury hair house built between the UK and Nigeria, created to deliver premium-quality hair with unmatched softness and longevity.
            <br /><br />
            We carefully source and curate every collection to meet the highest standards, blending expert craftsmanship with modern elegance. Our hair is designed to feel natural, move effortlessly, and elevate confidence — whether worn daily or for special moments.
            <br /><br />
            With roots in Nigeria and a base in the UK, SilkHaus by Follienn represents a bridge between heritage and luxury. Every strand reflects quality, care, and refinement.
          </p>
          <div className="aspect-[4/5] bg-[#FAF9F6] overflow-hidden relative">
            <Image src="/images/ceo.jpg" alt="Follienn — Founder of Silk Haus" width={400} height={500} className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-6 bg-white p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest">Founded 2019</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Lagos · London · New York</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary text-foreground py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "5,000+", label: "Happy Clients" },
              { stat: "100%", label: "Human Hair" },
              { stat: "47-Point", label: "QC Standard" },
              { stat: "4.9★", label: "Average Rating" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-serif text-5xl italic mb-3">{item.stat}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/50">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-background py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground mb-4">The Visionary</p>
          <h2 className="font-serif text-5xl md:text-6xl uppercase tracking-tighter italic mb-16">Meet The Founder</h2>
          <div className="grid md:grid-cols-[400px_1fr] gap-12 lg:gap-20 items-start">
            {/* Founder Photo */}
            <div className="aspect-[3/4] bg-secondary overflow-hidden border border-border">
              <Image src="/images/ceo.jpg" alt="Follienn — Founder & CEO" width={400} height={533} className="w-full h-full object-cover" />
            </div>
            {/* Founder Info */}
            <div className="flex flex-col justify-center">
              <h3 className="text-[20px] font-bold uppercase tracking-widest text-foreground mb-1">Follienn</h3>
              <p className="text-[12px] text-[#D5A754] font-bold uppercase tracking-widest mb-8">Founder & CEO</p>
              <blockquote className="text-[16px] text-foreground/70 leading-[2] mb-10 border-l-2 border-[#D5A754] pl-8 italic">
                &ldquo;Silk Haus was born from a personal obsession with quality. I built this brand to give women access to the same luxury-grade hair I had been sourcing privately for years. Every unit passes through my hands. Every standard is one I hold myself to. This is not a team effort — this is a personal promise.&rdquo;
              </blockquote>
              <a
                href="https://instagram.com/follienn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-[12px] font-bold uppercase tracking-widest text-foreground/60 hover:text-[#D5A754] transition-colors w-fit"
              >
                <Instagram className="w-5 h-5" />
                @follienn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground mb-4">What We Stand For</p>
        <h2 className="font-serif text-5xl md:text-6xl uppercase tracking-tighter italic mb-16">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {values.map((v) => (
            <div key={v.title} className="flex gap-6 items-start border-b border-border pb-10">
              <span className="text-[#D5A754] text-xl font-bold mt-1">{v.icon}</span>
              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-widest mb-3">{v.title}</h3>
                <p className="text-[14px] text-zinc-300 leading-relaxed">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24 text-center">
        <h2 className="font-serif text-5xl md:text-7xl uppercase tracking-tighter italic mb-8">
          Your Transformation<br />Awaits.
        </h2>
        <p className="text-[15px] text-zinc-300 max-w-lg mx-auto mb-12 leading-relaxed">
          Join thousands of women who have discovered their most confident, radiant self through the art of luxury hair.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="inline-block bg-secondary text-foreground px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
            Shop The Collection
          </Link>
          <Link href="/contact" className="inline-block border border-white/20 text-foreground px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-foreground transition-all">
            Book a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
