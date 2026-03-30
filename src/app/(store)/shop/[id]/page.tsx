import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/actions/products';
import ProductClient from './product-client';

interface ProductImage {
  image_url: string;
  display_order: number;
}

interface ProductVariant {
  id: string;
  name: string;
  price_override?: number;
  attributes?: Record<string, unknown>;
  inventory_count?: number;
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  description?: string;
  categories?: { name: string };
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id) as Product | null;

  if (!product) {
    notFound();
  }

  // Map database data to a cleaner format for the client component
  const formattedProduct = {
    id: product.id,
    name: product.name,
    price: product.base_price,
    category: product.categories?.name || 'Uncategorized',
    description: product.description,
    images: product.product_images?.length ?
      product.product_images.sort((a, b) => a.display_order - b.display_order).map((img) => img.image_url)
      : ['/placeholder.png'],
    variants: product.product_variants || []
  };

  return <ProductClient product={formattedProduct} />;
}
