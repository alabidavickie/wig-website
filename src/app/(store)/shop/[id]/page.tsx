import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/actions/products';
import ProductClient from './product-client';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

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
    images: product.product_images?.length > 0 
      ? product.product_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url) 
      : ['/placeholder.png'],
    variants: product.product_variants || []
  };

  return <ProductClient product={formattedProduct} />;
}
