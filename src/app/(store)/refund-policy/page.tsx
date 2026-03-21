import Link from "next/link";

export default function RefundPolicyPage() {
  const policies = [
    {
      title: "Final Sale",
      content: "All sales are final due to hygiene reasons."
    },
    {
      title: "Returns Accepted Only If",
      items: [
        "Item is unused, unwashed, and in original packaging",
        "Security seal/bundle tie is intact",
        "Return requested within 48 hours of delivery"
      ]
    },
    {
      title: "Non-returnable Items",
      items: [
        "Used hair",
        "Custom/pre-orders",
        "Sale items"
      ]
    },
    {
      title: "Refunds",
      content: "Only for wrong or defective items."
    },
    {
      title: "Exchanges",
      content: "Only for defective/incorrect products."
    },
    {
      title: "Return Shipping",
      content: "Customer pays unless error is ours."
    },
    {
      title: "Important Notice",
      content: "We reserve the right to refuse returns that don’t meet these conditions."
    }
  ];

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
        {policies.map((policy) => (
          <div key={policy.title} className="border-b border-gray-100 pb-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D5A754] mb-6">
              {policy.title}
            </h2>
            {policy.content && (
              <p className="text-[15px] text-white/70 leading-relaxed">
                {policy.content}
              </p>
            )}
            {policy.items && (
              <ul className="space-y-4">
                {policy.items.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="text-[#D5A754] font-bold">✦</span>
                    <span className="text-[15px] text-white/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
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
