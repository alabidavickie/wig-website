import Link from "next/link";
import { getSiteContent } from "@/lib/actions/content";

const FALLBACK = `Final Sale
All sales are final due to hygiene reasons.

Returns Accepted Only If
Item is unused, unwashed, and in original packaging
Security seal/bundle tie is intact
Return requested within 48 hours of delivery

Non-returnable Items
Used hair
Custom/pre-orders
Sale items

Refunds
Only for wrong or defective items.

Exchanges
Only for defective/incorrect products.

Return Shipping
Customer pays unless error is ours.

Important Notice
We reserve the right to refuse returns that don't meet these conditions.`;

export default async function RefundPolicyPage() {
  const db = await getSiteContent("refund-policy");
  const raw = db?.content ?? FALLBACK;

  const sections = raw
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return null;
      const [title, ...rest] = lines;
      return { title, body: rest };
    })
    .filter(Boolean) as { title: string; body: string[] }[];

  return (
    <div className="min-h-screen bg-background text-white font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-6">Policies</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none mb-6">
          Refund<br />Policy
        </h1>
        <p className="text-[16px] text-zinc-300 leading-relaxed max-w-xl">
          Detailed information about our returns, refunds, and exchanges policy.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 pb-24 space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="border-b border-gray-100 pb-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D5A754] mb-6">
              {section.title}
            </h2>
            {section.body.length > 0 && (
              <div className="space-y-2">
                {section.body.map((line, i) => (
                  <p key={i} className="text-[15px] text-white/70 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#1A1A1D] text-white py-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <h2 className="font-serif text-5xl uppercase tracking-tighter italic mb-8">Need to Initiate<br />a Return?</h2>
          <Link
            href="/contact"
            className="inline-block border border-white text-white px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1D] transition-all"
          >
            Contact Customer Care
          </Link>
        </div>
      </div>
    </div>
  );
}
