export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderItem {
  id: string;
  name: string;
  style: string;
  color: string;
  length: string; // e.g., "18 inches"
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
}

export const mockOrders: Order[] = [
  {
    id: "ORD-7391",
    date: "2026-03-10",
    totalAmount: 349.99,
    status: "Delivered",
    items: [
      {
        id: "ITEM-001",
        name: "Silk Body Wave Lace Front",
        style: "Body Wave",
        color: "1B (Natural Black)",
        length: "22 inches",
        quantity: 1,
        price: 349.99,
      },
    ],
  },
  {
    id: "ORD-8042",
    date: "2026-03-12",
    totalAmount: 499.00,
    status: "Processing",
    items: [
      {
        id: "ITEM-002",
        name: "Silky Straight Glueless HD Lace",
        style: "Straight",
        color: "Blonde Highlights",
        length: "18 inches",
        quantity: 1,
        price: 499.00,
      },
    ],
  },
  {
    id: "ORD-8105",
    date: "2026-03-12",
    totalAmount: 850.00,
    status: "Pending",
    items: [
      {
        id: "ITEM-003",
        name: "Deep Curly Full Lace",
        style: "Deep Curly",
        color: "Burgundy/99J",
        length: "26 inches",
        quantity: 1,
        price: 550.00,
      },
      {
        id: "ITEM-004",
        name: "Yaki Straight U-Part",
        style: "Yaki Straight",
        color: "1B (Natural Black)",
        length: "16 inches",
        quantity: 1,
        price: 300.00,
      },
    ],
  },
  {
    id: "ORD-6120",
    date: "2026-02-15",
    totalAmount: 225.50,
    status: "Shipped",
    items: [
      {
        id: "ITEM-005",
        name: "Water Wave Headband Wig",
        style: "Water Wave",
        color: "Ombre Brown",
        length: "20 inches",
        quantity: 1,
        price: 225.50,
      },
    ],
  },
];

export const MOCK_PRODUCTS = [
  {
    id: "mock-1",
    name: 'Silk HD Lace Frontal — 24" Straight',
    slug: "silk-hd-lace-frontal-24-straight",
    base_price: 1250,
    category: "HD Lace Frontal",
    image: "/hero_luxury_wig_1773402385371.png",
    description:
      "Our signature 24-inch straight frontal is the silk standard of natural hair units. Meticulously hand-tied with premium raw human hair, it provides an undetectable finish that mimics a natural scalp in any lighting condition. Perfect for queens who demand the best.",
    product_images: [{ image_url: "/hero_luxury_wig_1773402385371.png", is_main: true, display_order: 0 }],
    product_variants: [
      { id: "mv-1a", name: '20"', sku: "SH-HLF-20", inventory_count: 12, price_override: 1050, attributes: {} },
      { id: "mv-1b", name: '24"', sku: "SH-HLF-24", inventory_count: 8, price_override: null, attributes: {} },
      { id: "mv-1c", name: '30"', sku: "SH-HLF-30", inventory_count: 5, price_override: 1480, attributes: {} },
    ],
    categories: { name: "HD Lace Frontal" },
    is_featured: true,
  },
  {
    id: "mock-2",
    name: "Silk Body Wave Silk Top Wig",
    slug: "body-wave-silk-top",
    base_price: 890,
    category: "Silk Top",
    image: "/hair_bundles_gold_1773402406137.png",
    description:
      "Designed for ultimate discretion and effortless volume. The Silk Haus silk top construction provides a multi-directional parting area that is virtually indistinguishable from a natural scalp. Whether you wear it up or down, the illusion is flawless.",
    product_images: [{ image_url: "/hair_bundles_gold_1773402406137.png", is_main: true, display_order: 0 }],
    product_variants: [
      { id: "mv-2a", name: '18"', sku: "SH-BW-18", inventory_count: 10, price_override: 750, attributes: {} },
      { id: "mv-2b", name: '22"', sku: "SH-BW-22", inventory_count: 7, price_override: null, attributes: {} },
      { id: "mv-2c", name: '26"', sku: "SH-BW-26", inventory_count: 4, price_override: 980, attributes: {} },
    ],
    categories: { name: "Silk Top" },
    is_featured: true,
  },
  {
    id: "mock-3",
    name: "Silk Deep Wave Glueless Wig",
    slug: "deep-wave-glueless",
    base_price: 950,
    category: "Glueless",
    image: "/hero_luxury_wig_1773402385371.png",
    description:
      "Experience the ultimate in comfortable wear with our glueless deep wave unit. No adhesive needed — a secure, adjustable band and combs hold it in place all day. Rich, bouncy wave pattern that turns every head in every room.",
    product_images: [{ image_url: "/hero_luxury_wig_1773402385371.png", is_main: true, display_order: 0 }],
    product_variants: [
      { id: "mv-3a", name: '18"', sku: "SH-DW-18", inventory_count: 15, price_override: 820, attributes: {} },
      { id: "mv-3b", name: '22"', sku: "SH-DW-22", inventory_count: 9, price_override: null, attributes: {} },
    ],
    categories: { name: "Glueless" },
    is_featured: false,
  },
  {
    id: "mock-4",
    name: "Silk Raw Virgin Yaki Straight Bundles",
    slug: "raw-virgin-yaki-straight",
    base_price: 720,
    category: "Virgin Bundles",
    image: "/hair_bundles_gold_1773402406137.png",
    description:
      "100% unprocessed raw virgin hair with a stunning yaki texture that mimics naturally relaxed hair. Add volume and length with these Silk Haus premium bundles. Each bundle is carefully sorted for consistent texture and weight.",
    product_images: [{ image_url: "/hair_bundles_gold_1773402406137.png", is_main: true, display_order: 0 }],
    product_variants: [
      { id: "mv-4a", name: "3 Bundles", sku: "SH-YK-3B", inventory_count: 20, price_override: null, attributes: {} },
      { id: "mv-4b", name: "4 Bundles", sku: "SH-YK-4B", inventory_count: 12, price_override: 920, attributes: {} },
    ],
    categories: { name: "Virgin Bundles" },
    is_featured: false,
  },
  {
    id: "mock-5",
    name: "Silk Kinky Curly Full Lace Wig",
    slug: "kinky-curly-full-lace",
    base_price: 1400,
    category: "Full Lace",
    image: "/hero_luxury_wig_1773402385371.png",
    description:
      "Celebrate your natural roots with our full lace kinky curly masterpiece. Made for those who want versatility without compromise — style it up, to the side, or in a high ponytail. The Silk Haus curl pattern is bold, defined, and magnificently voluminous.",
    product_images: [{ image_url: "/hero_luxury_wig_1773402385371.png", is_main: true, display_order: 0 }],
    product_variants: [
      { id: "mv-5a", name: '20"', sku: "SH-KC-20", inventory_count: 6, price_override: 1200, attributes: {} },
      { id: "mv-5b", name: '26"', sku: "SH-KC-26", inventory_count: 4, price_override: null, attributes: {} },
    ],
    categories: { name: "Full Lace" },
    is_featured: false,
  },
  {
    id: "mock-6",
    name: "Blonde Balayage Silk Frontal Wig",
    slug: "blonde-balayage-frontal",
    base_price: 1150,
    category: "HD Lace Frontal",
    image: "/hair_bundles_gold_1773402406137.png",
    description:
      "Sun-kissed, hand-painted perfection. Our blonde balayage frontal is a conversation-starting statement piece that transitions from warm golden roots to Silk Haus radiant platinum tips. Each unit is individually colored for a truly one-of-a-kind look.",
    product_images: [{ image_url: "/hair_bundles_gold_1773402406137.png", is_main: true, display_order: 0 }],
    product_variants: [
      { id: "mv-6a", name: '20"', sku: "SH-BB-20", inventory_count: 5, price_override: 980, attributes: {} },
      { id: "mv-6b", name: '24"', sku: "SH-BB-24", inventory_count: 3, price_override: null, attributes: {} },
    ],
    categories: { name: "HD Lace Frontal" },
    is_featured: true,
  },
];
