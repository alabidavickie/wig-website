"use server";

import { createClient } from "@/lib/supabase/server";

export interface StoreSettings {
  shipping_fee_gbp: number;
  currency: string;
  maintenance_mode: boolean;
}

/**
 * Fetch the global store settings.
 * Defaults to £15 shipping if database table does not exist yet.
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      // Fallback in case table isn't created yet or empty
      return { shipping_fee_gbp: 15.00, currency: "GBP", maintenance_mode: false };
    }
    return data;
  } catch {
    return { shipping_fee_gbp: 15.00, currency: "GBP", maintenance_mode: false };
  }
}

export async function updateStoreSettings(newSettings: Partial<StoreSettings>) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { revalidatePath } = await import("next/cache");
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("store_settings")
    .update(newSettings)
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Generic update all since there's only 1 row

  if (error) {
    console.error("Failed to update settings", error);
    throw new Error("Failed to update store settings.");
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}
