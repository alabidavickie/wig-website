"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/orders";
import { logAdminAction } from "@/lib/actions/audit";
import { sendBroadcastEmail } from "@/lib/emails";
import { getSubscriberEmails } from "@/lib/actions/newsletter";



// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  is_main: boolean;
  display_order: number;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string;
  sku: string;
  inventory_count: number;
  price_override?: number | null;
  attributes: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category_id?: string;
  created_at?: string; // Added/moved created_at
  is_featured: boolean;
  is_active?: boolean;
  // Transformed fields for UI
  category?: string; // Made optional
  image?: string; // Made optional
  categories?: { name: string };
  product_images?: ProductImage[];
  variants?: ProductVariant[]; // Renamed from product_variants
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category_id: string;
  is_featured: boolean;
  variants?: Omit<ProductVariant, "id" | "product_id">[];
  images?: { url: string }[];
}

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
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert([formData])
    .select()
    .single();

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  revalidatePath("/admin/products");
  return data;
}

export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, base_price, category_id, 
        categories (name), 
        product_images (image_url, is_main),
        product_variants (inventory_count)
      `)
      .order("created_at", { ascending: false });

    // If a category filter is provided, look up the category ID first
    if (category) {
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", `%${category}%`)
        .single();

      if (catData) {
        query = query.eq("category_id", catData.id);
      } else {
        // No matching category found — return empty
        return [] as Product[];
      }
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return [] as Product[];
    }

    return (data as unknown as Product[]).map(p => {
      const variants = (p as any).product_variants || [];
      const totalStock = variants.reduce((acc: number, v: any) => acc + (v.inventory_count || 0), 0);
      
      return {
        ...p,
        category: (p as any).categories?.name || "Uncategorized",
        image:
          (p as any).product_images?.find((img: any) => img.is_main)?.image_url ||
          (p as any).product_images?.[0]?.image_url ||
          "/hero_luxury_wig_1773402385371.png",
        created_at: (p as any).created_at || new Date().toISOString(),
        is_featured: (p as any).is_featured || false,
        stock: totalStock
      };
    });
  } catch {
    return [] as Product[];
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`id, name, slug, base_price, categories (name), product_images (image_url, is_main)`)
      .ilike("name", `%${query.trim()}%`)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error || !data) return [];

    return (data as unknown as Product[]).map(p => ({
      ...p,
      category: (p as any).categories?.name || "Uncategorized",
      image:
        (p as any).product_images?.find((img: any) => img.is_main)?.image_url ||
        (p as any).product_images?.[0]?.image_url ||
        "/hero_luxury_wig_1773402385371.png",
      created_at: (p as any).created_at || new Date().toISOString(),
      is_featured: (p as any).is_featured || false
    }));
  } catch {
    return [];
  }
}

export async function getProductById(id: string) {
  if (!id) return null;


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

export async function createProduct(formData: CreateProductInput) {
  const supabase = createAdminClient();

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

  if (formData.variants && formData.variants.length > 0) {
    const { error: variantError } = await supabase.from("product_variants").insert(
      formData.variants.map((v) => ({
        product_id: product.id,
        name: v.name, sku: v.sku,
        inventory_count: v.inventory_count,
        price_override: v.price_override,
        attributes: v.attributes,
      }))
    );
    if (variantError) throw new Error(variantError.message);
  }

  if (formData.images && formData.images.length > 0) {
    const { error: imageError } = await supabase.from("product_images").insert(
      formData.images.map((img, idx) => ({
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

  // Notify all users about the new arrival
  try {
    const { data: profiles } = await supabase.from("profiles").select("id");
    if (profiles) {
      for (const profile of profiles) {
        await createNotification(
          profile.id,
          "New Arrival",
          `A new luxury piece "${product.name}" has just been added to the Elite Studio.`,
          `/shop/${product.slug}`
        );
      }
    }

    // NEWSLETTER BROADCAST: Email all subscribers
    const subscribers = await getSubscriberEmails();
    if (subscribers.length > 0) {
      const mainImage = formData.images?.[0]?.url || "/hero_luxury_wig_1773402385371.png";
      await sendBroadcastEmail(subscribers, 'new_arrival', {
        name: product.name,
        image: mainImage,
        base_price: product.base_price,
        slug: product.slug
      });
    }
  } catch (notifyError) {
    console.warn("Failed to notify users about new product:", notifyError);
  }

  await logAdminAction("create_product", "product", product.id, { name: product.name, slug: product.slug });

  return product;
}

export async function updateProduct(id: string, formData: Partial<CreateProductInput>) {
  const supabase = createAdminClient();

  const { error: productError } = await supabase
    .from("products")
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      base_price: formData.base_price,
      category_id: formData.category_id,
      is_featured: formData.is_featured,
    })
    .eq("id", id);

  if (productError) throw new Error(productError.message);

  if (formData.variants) {
    // Delete existing variants and re-insert (simpler for now)
    await supabase.from("product_variants").delete().eq("product_id", id);
    const { error: variantError } = await supabase.from("product_variants").insert(
      formData.variants.map((v) => ({
        product_id: id,
        name: v.name,
        sku: v.sku,
        inventory_count: v.inventory_count,
        price_override: v.price_override,
        attributes: v.attributes,
      }))
    );
    if (variantError) throw new Error(variantError.message);
  }

  if (formData.images) {
    // Delete existing images and re-insert
    await supabase.from("product_images").delete().eq("product_id", id);
    const { error: imageError } = await supabase.from("product_images").insert(
      formData.images.map((img, idx) => ({
        product_id: id,
        image_url: img.url,
        is_main: idx === 0,
        display_order: idx,
      }))
    );
    if (imageError) throw new Error(imageError.message);
  }

  // CHECK FOR BACK IN STOCK BROADCAST
  if (formData.variants) {
    try {
      // 1. Check previous stock level
      const { data: oldVariants } = await supabase.from("product_variants").select("inventory_count").eq("product_id", id);
      const oldTotal = (oldVariants || []).reduce((sum, v) => sum + (v.inventory_count || 0), 0);
      
      // 2. Check current stock level
      const newTotal = formData.variants.reduce((sum, v) => sum + (v.inventory_count || 0), 0);

      // 3. If it was 0 and now it's > 0, broadcast!
      if (oldTotal === 0 && newTotal > 0) {
        const subscribers = await getSubscriberEmails();
        if (subscribers.length > 0) {
           const { data: product } = await supabase.from("products").select("name, base_price, slug").eq("id", id).single();
           const { data: img } = await supabase.from("product_images").select("image_url").eq("product_id", id).eq("is_main", true).single();
           
           if (product) {
             await sendBroadcastEmail(subscribers, 'back_in_stock', {
               name: product.name,
               image: img?.image_url || "/hero_luxury_wig_1773402385371.png",
               base_price: product.base_price,
               slug: product.slug
             });
           }
        }
      }
    } catch (e) {
      console.warn("Back in stock broadcast failed:", e);
    }
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath(`/shop/${formData.slug || id}`);

  await logAdminAction("update_product", "product", id, { name: formData.name, slug: formData.slug });
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  await logAdminAction("delete_product", "product", id, { product_id: id });
  
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete category: ${error.message}`);
  await logAdminAction("delete_category", "category", id, { category_id: id });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
}
export async function toggleProductVisibility(id: string, is_active: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active })
    .eq("id", id);
    
  if (error) throw new Error("Failed to toggle product visibility");
  
  await logAdminAction(is_active ? "show_product" : "hide_product", "product", id, { product_id: id, is_active });
  
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}


