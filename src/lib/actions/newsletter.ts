"use server";

import { createClient } from "@/lib/supabase/server";

export async function subscribeToNewsletter(email: string) {
  try {
    const supabase = await createClient();

    // Insert new subscriber or ignore if already subscribed
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email });

    if (error) {
      if (error.code === '23505') { // Postgres generic unique violation error code
        return { success: true, message: "Already subscribed!" };
      }
      throw error;
    }
    
    return { success: true, message: "Thank you for subscribing to Silk Haus." };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, message: "Failed to subscribe. Please try again later." };
  }
}
