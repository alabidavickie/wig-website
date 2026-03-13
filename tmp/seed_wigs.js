
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function seedData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Seeding categories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .insert([
      { name: 'HD Lace Frontal', slug: 'hd-lace-frontal', description: 'Ultra-thin, invisible lace for the most natural look.' },
      { name: 'Virgin Bundles', slug: 'virgin-bundles', description: '100% unprocessed human hair bundles.' },
      { name: 'Elite Maintenance', slug: 'elite-maintenance', description: 'Professional products for wig care and longevity.' }
    ])
    .select();

  if (catError) {
    console.error('Error seeding categories:', catError.message);
    return;
  }

  console.log('Seeding products...');
  const frontalId = categories.find(c => c.slug === 'hd-lace-frontal').id;
  const bundlesId = categories.find(c => c.slug === 'virgin-bundles').id;

  const products = [
    {
      name: 'HD Lace Frontal Wig - 24" Straight',
      slug: 'hd-lace-frontal-24-straight',
      description: 'Our signature 24-inch straight wig featuring high-definition lace and 180% density.',
      base_price: 1250.00,
      category_id: frontalId,
      is_featured: true
    },
    {
      name: 'Virgin Body Wave Bundles (Set of 3)',
      slug: 'virgin-body-wave-3-set',
      description: 'Three premium virgin hair bundles with a consistent body wave pattern.',
      base_price: 350.00,
      category_id: bundlesId,
      is_featured: false
    }
  ];

  const { data: insertedProducts, error: prodError } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (prodError) {
    console.error('Error seeding products:', prodError.message);
    return;
  }

  console.log('Seeding variants and images...');
  for (const product of insertedProducts) {
    // Add a default variant
    await supabase.from('product_variants').insert({
      product_id: product.id,
      name: 'Standard',
      sku: `SOL-${product.slug.toUpperCase().substring(0, 10)}`,
      inventory_count: 50,
      attributes: { type: 'standard' }
    });

    // Add a placeholder image (using the generated assets if available or placeholders)
    const imgUrl = product.category_id === frontalId 
      ? '/hero_luxury_wig_1773402385371.png'
      : '/hair_bundles_gold_1773402406137.png';

    await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: imgUrl,
      is_main: true,
      display_order: 0
    });
  }

  console.log('Seeding successful!');
}

seedData();
