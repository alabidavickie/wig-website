import Link from "next/link";

export default function ShippingPolicyPage() {
  const policies = [
    {
      title: "Processing Time",
      content: "1–3 working days after payment confirmation."
    },
    {
      title: "Delivery Times",
      items: [
        "Nigeria: 2–5 working days",
        "UK: 2–5 working days",
        "International (e.g., US): 5–10 working days"
      ]
    },
    {
      title: "Shipping Fees",
      content: "Calculated at checkout based on your location and order weight."
    },
    {
      title: "Tracking",
      content: "Sent via email/SMS once your order is dispatched."
    },
    {
      title: "Delays",
      content: "We are not responsible for courier delays or customs issues."
    },
    {
      title: "Incorrect Address",
      content: "Please check carefully—wrong addresses may not be recoverable once the order has been processed."
    },
    {
      title: "Lost/Damaged Items",
      content: "Contact us within 48 hours of delivery with photos/videos of the package and items."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1D] font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#1A1A1D]/40 mb-6">Policies</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none mb-6">
          Shipping<br />Policy
        </h1>
        <p className="text-[16px] text-[#1A1A1D]/60 leading-relaxed max-w-xl">
          Everything you need to know about our shipping process, delivery times, and handling.
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
              <p className="text-[15px] text-[#1A1A1D]/70 leading-relaxed">
                {policy.content}
              </p>
            )}
            {policy.items && (
              <ul className="space-y-4">
                {policy.items.map((item, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="text-[#D5A754] font-bold">✦</span>
                    <span className="text-[15px] text-[#1A1A1D]/70 leading-relaxed">{item}</span>
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
          <h2 className="font-serif text-5xl uppercase tracking-tighter italic mb-8">Need Further<br />Assistance?</h2>
          <Link
            href="/contact"
            className="inline-block border border-white text-white px-12 py-5 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1D] transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
