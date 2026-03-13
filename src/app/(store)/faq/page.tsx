"use client";

import { useState } from "react";

const faqs = [
  {
    category: "About Our Hair",
    questions: [
      {
        q: "What type of hair do you use in your wigs?",
        a: "All of our wigs and bundles are crafted from 100% raw, unprocessed human hair sourced from ethical donors. We never use synthetic blends, mixed hair, or chemically coated fibres. What you receive is the real thing — pure, premium, and luxurious."
      },
      {
        q: "What does 'HD Lace' mean?",
        a: "HD (High Definition) Lace is an ultra-thin, nearly invisible lace material that melts seamlessly into the skin. Unlike standard lace, HD lace requires little to no bleaching of the knots, making it the most undetectable option for a truly natural hairline illusion."
      },
      {
        q: "Will the hair tangle or shed?",
        a: "Our hair is structured using a weft-track system and hand-tied knot technique that virtually eliminates shedding. With proper care (regular deep conditioning, silk sleeping accessories), our units remain tangle-free and gorgeous for 12-18 months with everyday wear."
      },
      {
        q: "Can I colour or bleach SOLACE hair?",
        a: "Yes — because all our hair is raw and virgin, it can be coloured, bleached, toned, and permed just like natural hair growing from your scalp. We always recommend having this done by a licensed colour specialist for best results."
      },
    ]
  },
  {
    category: "Ordering & Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), bank transfers, and select Buy Now Pay Later options. All transactions are 256-bit SSL encrypted via Stripe for maximum security."
      },
      {
        q: "Is it safe to shop on SOLACE?",
        a: "Absolutely. Your security is our top priority. Our website uses industry-standard SSL encryption, and payment data is never stored on our servers. We are PCI DSS compliant and powered by Stripe — the world's most trusted payment infrastructure."
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement. After that window, our Silk Haus team begins preparing your specific unit. Please contact our concierge team immediately if you need to make changes."
      },
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "How long does shipping take?",
        a: "Standard processing takes 2-5 business days (custom units may take up to 10 days). Once shipped, delivery typically takes 3-7 business days domestically and 7-14 business days internationally. All orders include a tracking number."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes! We ship to over 50 countries worldwide. International shipping rates and estimated delivery times are displayed at checkout based on your location. Import duties and taxes may apply and are the responsibility of the recipient."
      },
      {
        q: "Is shipping really free?",
        a: "All domestic orders include complimentary express shipping — no minimum order required. International orders over $500 also ship free. It's our way of saying thank you for trusting SOLACE with your look."
      },
    ]
  },
  {
    category: "Returns & Warranty",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 14-day hassle-free return window for all unaltered, unworn units in original packaging. Custom-coloured, cut, or worn pieces cannot be returned for hygiene reasons. To initiate a return, contact our team within 14 days of delivery."
      },
      {
        q: "What does the Lifetime Warranty cover?",
        a: "Our Lifetime Warranty covers manufacturing defects, including uneven knot density, weft splitting, and lace fraying not caused by user handling. It does not cover damage from chemical processing, heat styling beyond recommended temperatures, or improper maintenance."
      },
    ]
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1D] font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#1A1A1D]/40 mb-6">Knowledge Base</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none mb-6">
          FAQ
        </h1>
        <p className="text-[16px] text-[#1A1A1D]/60 leading-relaxed max-w-xl">
          Everything you need to know about our hair, our process, and our promise. Can't find your answer? Our concierge team is always one message away.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 pb-24 space-y-16">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D5A754] mb-8 border-b border-gray-100 pb-6">
              {section.category}
            </h2>
            <div className="space-y-0 divide-y divide-gray-100">
              {section.questions.map((item, qi) => {
                const key = `${section.category}-${qi}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key} className="py-6">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex justify-between items-start gap-6 text-left group"
                    >
                      <span className="text-[15px] font-bold uppercase tracking-wide group-hover:text-[#D5A754] transition-colors">
                        {item.q}
                      </span>
                      <span className={`text-xl font-thin text-[#1A1A1D]/30 transition-all duration-300 shrink-0 mt-0.5 ${isOpen ? "rotate-45 text-[#D5A754]" : ""}`}>+</span>
                    </button>
                    {isOpen && (
                      <div className="mt-4 pr-10">
                        <p className="text-[14px] text-[#1A1A1D]/65 leading-[1.9]">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <div className="bg-[#1A1A1D] text-white py-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 mb-6">Still Need Help?</p>
          <h2 className="font-serif text-5xl uppercase tracking-tighter italic mb-6">Our Concierge<br />Is Standing By</h2>
          <p className="text-[14px] text-white/60 mb-10 leading-relaxed">Our dedicated hair stylists and client specialists answer within 2 hours during business hours.</p>
          <a
            href="/contact"
            className="inline-block border border-white text-white px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1D] transition-all"
          >
            Contact Our Team
          </a>
        </div>
      </div>
    </div>
  );
}
