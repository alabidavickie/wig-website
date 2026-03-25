import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using service_role key.
 * This bypasses RLS and should ONLY be used in server actions
 * that have verified the caller is an admin.
 *
 * NEVER import this in client components or expose to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local file."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
