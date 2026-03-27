"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SiteContent {
  slug: string;
  title?: string;
  content: string;
  updated_at?: string;
}

/**
 * Fetches a single site content entry by slug.
 * Public - anyone can read site content.
 */
export async function getSiteContent(slug: string): Promise<SiteContent | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("slug, title, content, updated_at")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Fetches all site content entries.
 * Admin only.
 */
export async function getAllSiteContent(): Promise<SiteContent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("slug, title, content, updated_at")
    .order("slug");

  if (error || !data) return [];
  return data;
}

/**
 * Creates or updates a site content entry.
 * Admin only.
 */
export async function upsertSiteContent(slug: string, content: string, title?: string) {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_content")
    .upsert(
      { slug, content, title: title ?? slug, updated_at: new Date().toISOString() },
      { onConflict: "slug" }
    );

  if (error) throw new Error(`Failed to save content: ${error.message}`);

  // Revalidate storefront pages that use this content
  revalidatePath("/faq");
  revalidatePath("/shipping-policy");
  revalidatePath("/refund-policy");
  revalidatePath("/payment-policy");
  revalidatePath("/terms-and-conditions");
  revalidatePath("/admin/content");
}
