import Link from "next/link";

export default function PaymentPolicyPage() {
  const sections = [
    {
      title: "Accepted Payments",
      items: [
        "PayPal",
        "Card Payments (Visa/Mastercard)",
        "Bank Transfers"
      ]
    },
    {
      title: "Order Processing",
      content: "Payment must be completed before orders are processed."
    },
    {
      title: "Order Cancellation",
      content: "Silkhaus by Follienn reserves the right to cancel orders if payment is not confirmed."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1D] font-sans">
      <div className="h-[120px]"></div>

      {/* Header */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-6">Policies</p>
        <h1 className="font-serif text-6xl md:text-8xl uppercase tracking-tighter italic leading-none mb-6">
          Payment<br />Policy
        </h1>
        <p className="text-[16px] text-zinc-300 leading-relaxed max-w-xl">
          Everything you need to know about our payment methods and processing.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 md:px-12 pb-24 space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="border-b border-gray-100 pb-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D5A754] mb-6">
              {section.title}
            </h2>
            {section.content && (
              <p className="text-[15px] text-[#1A1A1D]/70 leading-relaxed">
                {section.content}
              </p>
            )}
            {section.items && (
              <ul className="space-y-4">
                {section.items.map((item, idx) => (
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
    </div>
  );
}
