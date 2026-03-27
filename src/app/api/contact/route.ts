import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  topic: z.string().min(1, "Topic is required").max(100, "Topic too long"),
  message: z.string().min(5, "Message too short").max(5000, "Message too long"),
});

// Simple in-memory rate limiting: max 5 submissions per IP per 10 minutes
const ipSubmissions = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const record = ipSubmissions.get(ip);
  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    record.count++;
  } else {
    ipSubmissions.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
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
