-- Create site_content table for non-developer editable content
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content (public pages need it)
CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
USING (true);

-- Only admins can insert/update/delete site content
CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Seed with initial content so the table is not empty
INSERT INTO public.site_content (slug, title, content) VALUES
(
    'shipping-policy',
    'Shipping Policy',
    'Processing Time
1–3 working days after payment confirmation.

Delivery Times
Nigeria: 2–5 working days
UK: 2–5 working days
International (e.g., US): 5–10 working days

Shipping Fees
Calculated at checkout based on your location and order weight.

Tracking
Sent via email/SMS once your order is dispatched.

Delays
We are not responsible for courier delays or customs issues.

Incorrect Address
Please check carefully—wrong addresses may not be recoverable once the order has been processed.

Lost/Damaged Items
Contact us within 48 hours of delivery with photos/videos of the package and items.'
),
(
    'refund-policy',
    'Refund Policy',
    'All sales are final due to hygiene reasons.

Returns are only accepted if the item is unused, unwashed, in original packaging, with the security seal intact, and requested within 48 hours of delivery.

Refunds are only issued for wrong or defective items.

To request a refund, please contact our concierge team with photos/videos within 48 hours of delivery.

Refunds are processed within 5–10 business days once approved.'
),
(
    'payment-policy',
    'Payment Policy',
    'We accept all major credit and debit cards (Visa, Mastercard, American Express), bank transfers, and USSD.

All transactions are 256-bit SSL encrypted.

Payments are processed via Stripe (international) and Paystack (Nigeria).

We do not store your card details on our servers.

All prices are displayed in GBP (£) for international customers and NGN (₦) for Nigerian customers.'
),
(
    'terms',
    'Terms & Conditions',
    'By using this website and placing an order, you agree to our terms and conditions.

All intellectual property on this website belongs to Silk Haus.

We reserve the right to update prices, products, and policies without prior notice.

Orders are subject to availability. We will notify you if an item is out of stock.

We are not liable for any indirect or consequential losses arising from use of our website or products.'
),
(
    'faq',
    'FAQ',
    '[{"category":"About Our Hair","questions":[{"q":"What type of hair do you use in your wigs?","a":"All of our wigs and bundles are crafted from 100% raw, unprocessed human hair sourced from ethical donors. We never use synthetic blends, mixed hair, or chemically coated fibres. What you receive is the real thing — pure, premium, and luxurious."},{"q":"What does ''HD Lace'' mean?","a":"HD (High Definition) Lace is an ultra-thin, nearly invisible lace material that melts seamlessly into the skin. Unlike standard lace, HD lace requires little to no bleaching of the knots, making it the most undetectable option for a truly natural hairline illusion."},{"q":"Will the hair tangle or shed?","a":"Our hair is structured using a weft-track system and hand-tied knot technique that virtually eliminates shedding. With proper care (regular deep conditioning, silk sleeping accessories), our units remain tangle-free and gorgeous for 12-18 months with everyday wear."},{"q":"Can I colour or bleach Silk Haus hair?","a":"Yes — because all our hair is raw and virgin, it can be coloured, bleached, toned, and permed just like natural hair growing from your scalp. We always recommend having this done by a licensed colour specialist for best results."}]},{"category":"Ordering & Payment","questions":[{"q":"What payment methods do you accept?","a":"We accept all major credit and debit cards (Visa, Mastercard, American Express), bank transfers, and select Buy Now Pay Later options. All transactions are 256-bit SSL encrypted via Stripe for maximum security."},{"q":"Is it safe to shop on Silk Haus?","a":"Absolutely. Your security is our top priority. Our website uses industry-standard SSL encryption, and payment data is never stored on our servers. We are PCI DSS compliant and powered by Stripe — the world''s most trusted payment infrastructure."},{"q":"Can I modify or cancel my order after placing it?","a":"Orders can be modified or cancelled within 2 hours of placement. After that window, our Silk Haus team begins preparing your specific unit. Please contact our concierge team immediately if you need to make changes."}]},{"category":"Shipping & Delivery","questions":[{"q":"How long does shipping take?","a":"Standard processing takes 2-5 business days (custom units may take up to 10 days). Once shipped, delivery typically takes 3-7 business days domestically and 7-14 business days internationally. All orders include a tracking number."},{"q":"Do you ship internationally?","a":"Yes! We ship to over 50 countries worldwide. International shipping rates and estimated delivery times are displayed at checkout based on your location. Import duties and taxes may apply and are the responsibility of the recipient."},{"q":"Is shipping really free?","a":"All domestic orders include complimentary express shipping — no minimum order required. International orders over $500 also ship free. It''s our way of saying thank you for trusting Silk Haus with your look."}]},{"category":"Returns & Warranty","questions":[{"q":"What is your return policy?","a":"All sales are final due to hygiene reasons. Returns are only accepted if the item is unused, unwashed, in original packaging, with the security seal intact, and requested within 48 hours of delivery. Refunds are only issued for wrong or defective items."},{"q":"What does the Lifetime Warranty cover?","a":"Our Lifetime Warranty covers manufacturing defects, including uneven knot density, weft splitting, and lace fraying not caused by user handling. It does not cover damage from chemical processing, heat styling beyond recommended temperatures, or improper maintenance."}]},{"category":"General & Support","questions":[{"q":"How do I track my order?","a":"You will receive a tracking number via email/SMS once your order is dispatched."},{"q":"Can I return hair I''ve already installed?","a":"No. All installed or used hair is non-returnable due to hygiene reasons."},{"q":"What if I receive the wrong item?","a":"Contact us within 48 hours with photos. We will replace or refund the item."},{"q":"Can I change my delivery address after ordering?","a":"Please check carefully before confirming your order. We are not responsible for incorrect addresses."}]}]'
)
ON CONFLICT (slug) DO NOTHING;
