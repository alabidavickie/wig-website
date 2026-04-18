"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const emailSchema = z.email().max(255).toLowerCase();

export async function subscribeToNewsletter(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, message: "Please provide a valid email address." };
  }

  try {
    const supabase = await createClient();

    // Insert new subscriber or ignore if already subscribed
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data });

    if (error) {
      if (error.code === '23505') { 
        return { success: true, message: "Already subscribed!" };
      }
      throw error;
    }
    
    revalidatePath("/admin");
    
    return { success: true, message: "Thank you for subscribing to Silk Haus." };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, message: "Failed to subscribe. Please try again later." };
  }
}

/**
 * Fetches all subscriber emails for broadcasting.
 */
export async function getSubscriberEmails() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("email");

    if (error) throw error;
    return (data || []).map(s => s.email);
  } catch (error) {
    console.error("Error fetching subscriber emails:", error);
    return [];
  }
}

/**
 * Returns total count of newsletter subscribers.
 */
export async function getSubscriberCount() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching subscriber count:", error);
    return 0;
  }
}
