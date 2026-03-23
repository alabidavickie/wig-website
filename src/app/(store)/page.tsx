import { getProducts } from '@/lib/actions/products';
import HomeClient from './home-client';

// Generate dynamic metadata or config if needed
export const dynamic = 'force-dynamic';

export default async function Home() {
  const productsResult = await getProducts();
  const products = Array.isArray(productsResult) ? productsResult.slice(0, 4) : [];
  
  return <HomeClient products={products} />;
}
