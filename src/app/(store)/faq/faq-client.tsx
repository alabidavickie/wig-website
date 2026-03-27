"use client";

import { useState } from "react";
import type { FaqCategory } from "./page";

export default function FaqClient({ faqs }: { faqs: FaqCategory[] }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-6">Knowledge Base</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none mb-6">
          FAQ
        </h1>
        <p className="text-[16px] text-zinc-300 leading-relaxed max-w-xl">
          Everything you need to know about our hair, our process, and our promise. Can&apos;t find your answer? Our concierge team is always one message away.
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
                        <p className="text-[14px] text-white/65 leading-[1.9]">{item.a}</p>
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
