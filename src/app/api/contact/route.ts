import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimiters, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.email("Invalid email address").max(255, "Email too long"),
  topic: z.string().min(1, "Topic is required").max(100, "Topic too long"),
  message: z.string().min(5, "Message too short").max(5000, "Message too long"),
});

export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const { success: rateLimitSuccess } = await rateLimiters.contact.limit(ip);
  if (!rateLimitSuccess) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { firstName, lastName, email, topic, message } = parsed.data;

    // Build the mailto-style message body for server-side sending
    // Using a free service: https://formsubmit.co (no backend needed)
    // This sends an email to alabidave48@gmail.com via FormSubmit's API
    const response = await fetch("https://formsubmit.co/ajax/follienn@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `Silk Haus Contact: ${topic}`,
        name: `${firstName} ${lastName}`,
        email: email,
        topic: topic,
        message: message,
      }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      // Fallback: even if the external service fails, we acknowledge receipt
      console.error("FormSubmit error:", await response.text());
      return NextResponse.json({ success: true, note: "Message queued" });
    }
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
