"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/actions/audit";

export async function suspendCustomer(userId: string, suspend: boolean) {
  const supabase = createAdminClient();
  
  // Try to update is_suspended in profiles database
  // Note: if your profiles schema is different, you may need to adjust this column name
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspend })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Failed to suspend customer:", error);
    throw new Error("Could not update customer status");
  }

  // Also ban/unban the user at auth level if standard endpoints allow it
  try {
     if (suspend) {
         await supabase.auth.admin.updateUserById(userId, { ban_duration: "87600h" }); // Ban for 10 years
     } else {
         await supabase.auth.admin.updateUserById(userId, { ban_duration: "none" });
     }
  } catch (authErr) {
     console.warn("Could not ban at auth level, relying on profile flag", authErr);
  }

  await logAdminAction(suspend ? "suspend_customer" : "reactivate_customer", "customer", userId, { 
    customer_id: userId,
    status: suspend ? "suspended" : "active"
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return data;
}

export async function sendPasswordReset(email: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) {
    console.error("Failed to generate password reset:", error);
    throw new Error("Could not send password reset email");
  }

  return { success: true };
}
