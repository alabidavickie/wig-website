"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/actions/audit";

export type DiscountType = "percentage" | "flat";

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  min_order_amount: number | null;
  expiry_date: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  error?: string;
  discount?: {
    id: string;
    code: string;
    type: DiscountType;
    value: number;
    discountAmount: number;
  };
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Unauthorized");
}

/**
 * Validates a discount code against a cart total (GBP base amount).
 * Returns the discount details if valid, or an error message.
 */
export async function validateDiscountCode(
  code: string,
  cartTotalGbp: number
): Promise<DiscountValidationResult> {
  if (!code?.trim()) return { valid: false, error: "Please enter a code." };

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("discount_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) return { valid: false, error: "Invalid or expired code." };

  // Check expiry
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    return { valid: false, error: "This code has expired." };
  }

  // Check usage limit
  if (data.max_uses !== null && data.current_uses >= data.max_uses) {
    return { valid: false, error: "This code has reached its usage limit." };
  }

  // Check minimum order amount (stored in GBP)
  if (data.min_order_amount !== null && cartTotalGbp < data.min_order_amount) {
    return {
      valid: false,
      error: `Minimum order of £${data.min_order_amount.toFixed(2)} required.`,
    };
  }

  // Calculate discount amount
  let discountAmount: number;
  if (data.type === "percentage") {
    discountAmount = (cartTotalGbp * data.value) / 100;
  } else {
    discountAmount = Math.min(data.value, cartTotalGbp);
  }

  return {
    valid: true,
    discount: {
      id: data.id,
      code: data.code,
      type: data.type,
      value: data.value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    },
  };
}

/**
 * Increments usage count for a discount code after a successful order.
 */
export async function incrementDiscountUsage(discountCodeId: string) {
  const adminClient = createAdminClient();
  await adminClient.rpc("increment_discount_usage", { code_id: discountCodeId });
}

/**
 * Fetches all discount codes (admin only).
 */
export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
  await requireAdmin();
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discount codes:", error);
    return [];
  }
  return data ?? [];
}

/**
 * Creates a new discount code (admin only).
 */
export async function createDiscountCode(input: {
  code: string;
  type: DiscountType;
  value: number;
  min_order_amount?: number | null;
  expiry_date?: string | null;
  max_uses?: number | null;
}) {
  await requireAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient.from("discount_codes").insert([{
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    min_order_amount: input.min_order_amount ?? null,
    expiry_date: input.expiry_date ?? null,
    max_uses: input.max_uses ?? null,
    current_uses: 0,
    is_active: true,
  }]);

  if (error) {
    if (error.code === "23505") throw new Error("A code with this name already exists.");
    throw new Error("Failed to create discount code.");
  }

  await logAdminAction("create_discount", "discount_code", input.code, { code: input.code, type: input.type, value: input.value });
  revalidatePath("/admin/discounts");
}

/**
 * Toggles a discount code's active status (admin only).
 */
export async function toggleDiscountCode(id: string, is_active: boolean) {
  await requireAdmin();
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("discount_codes")
    .update({ is_active })
    .eq("id", id);

  if (error) throw new Error("Failed to update discount code.");
  await logAdminAction(is_active ? "activate_discount" : "deactivate_discount", "discount_code", id, { id, is_active });
  revalidatePath("/admin/discounts");
}

/**
 * Deletes a discount code (admin only).
 */
export async function deleteDiscountCode(id: string) {
  await requireAdmin();
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("discount_codes").delete().eq("id", id);
  if (error) throw new Error("Failed to delete discount code.");
  await logAdminAction("delete_discount", "discount_code", id, { id });
  revalidatePath("/admin/discounts");
}
