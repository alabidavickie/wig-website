import Link from "next/link";

export default function TermsConditionsPage() {
  const sections = [
    {
      title: "General Terms",
      items: [
        "By shopping at Silkhaus by Follienn, you agree to our policies.",
        "All products are intended for personal use only.",
        "We reserve the right to update our policies at any time; changes will apply to new orders."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1D] font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-6">Legals</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none mb-6">
          Terms &<br />Conditions
        </h1>
        <p className="text-[16px] text-zinc-300 leading-relaxed max-w-xl">
          The legal framework for shopping with Silkhaus by Follienn.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 pb-24 space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="border-b border-gray-100 pb-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D5A754] mb-6">
              {section.title}
            </h2>
            <ul className="space-y-4">
              {section.items.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <span className="text-[#D5A754] font-bold">✦</span>
                  <span className="text-[15px] text-[#1A1A1D]/70 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
