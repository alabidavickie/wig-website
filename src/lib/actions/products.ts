"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { MOCK_PRODUCTS } from "@/lib/mock-data";

// ─────────────────────────────────────────────
// PRODUCT ACTIONS
// ─────────────────────────────────────────────

export async function getCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function createCategory(formData: { name: string; slug: string; description?: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert([formData])
    .select()
    .single();

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  revalidatePath("/admin/products");
  return data;
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`id, name, slug, base_price, categories (name), product_images (image_url, is_main)`)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to mock data
      return MOCK_PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        base_price: p.base_price,
        category: p.category,
        image: p.image,
      }));
    }

    return (data as any[]).map(p => ({
      ...p,
      category: p.categories?.name || "Uncategorized",
      image:
        p.product_images?.find((img: any) => img.is_main)?.image_url ||
        p.product_images?.[0]?.image_url ||
        "/hero_luxury_wig_1773402385371.png",
    }));
  } catch {
    return MOCK_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      base_price: p.base_price,
      category: p.category,
      image: p.image,
    }));
  }
}

export async function getProductById(id: string) {
  if (!id) return null;

  // First check mock data for mock IDs
  if (id.startsWith("mock-")) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`*, categories (name), product_variants (*), product_images (*)`)
      .eq("id", id)
      .single();

    if (error || !data) {
      // Try to find by index in mock data as fallback
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function createProduct(formData: any) {
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert([{
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      base_price: formData.base_price,
      category_id: formData.category_id,
      is_featured: formData.is_featured,
    }])
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  if (formData.variants?.length > 0) {
    const { error: variantError } = await supabase.from("product_variants").insert(
      formData.variants.map((v: any) => ({
        product_id: product.id,
        name: v.name, sku: v.sku,
        inventory_count: v.inventory_count,
        price_override: v.price_override,
        attributes: v.attributes,
      }))
    );
    if (variantError) throw new Error(variantError.message);
  }

  if (formData.images?.length > 0) {
    const { error: imageError } = await supabase.from("product_images").insert(
      formData.images.map((img: any, idx: number) => ({
        product_id: product.id,
        image_url: img.url,
        is_main: idx === 0,
        display_order: idx,
      }))
    );
    if (imageError) throw new Error(imageError.message);
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return product;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}
