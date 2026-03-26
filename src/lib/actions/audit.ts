"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function logAdminAction(action: string, entity_type: string, entity_id: string, details: any) {
  const supabase = createAdminClient();
  
  try {
    const { error } = await supabase
      .from("admin_logs")
      .insert([{
        action,
        entity_type,
        entity_id,
        details,
        created_at: new Date().toISOString()
      }]);
      
    if (error) {
      console.warn("Failed to write to admin_logs. Is the table created?", error.message);
    }
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

export async function getAdminLogs(limit = 50) {
  const supabase = createAdminClient();
  try {
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) return [];
    return data;
  } catch (err) {
    return [];
  }
}
