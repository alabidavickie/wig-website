import { Resend } from 'resend';
import OrderStatusEmail from "@/components/emails/order-status-email";
import AdminPaymentEmail from "@/components/emails/admin-payment-email";
import VerificationEmail from "@/components/emails/verification-email";
import NewsletterEmail from "@/components/emails/newsletter-email";

// Initialize Resend lazily to avoid build-time errors if API key is missing
let resendInstance: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Configurable sender email via env var. For production, verify a custom domain on Resend
// (e.g., noreply@silkhaus.com). For testing, use 'onboarding@resend.dev' (only sends to account owner).
const SENDER_EMAIL = process.env.SENDER_EMAIL || '0xdavick@gmail.com';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL && process.env.NODE_ENV === "production") {
  console.error("CRITICAL: ADMIN_EMAIL environment variable is not set. Admin payment notifications will not be sent.");
}

export async function sendOrderStatusUpdate(toEmail: string, customerName: string, orderId: string, status: string) {
  try {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
      from: `Silk Haus <${SENDER_EMAIL}>`,
      to: toEmail,
      subject: `Silk Haus: Order ${status.toUpperCase()} (#${orderId.substring(0,8)})`,
      react: OrderStatusEmail({ customerName, orderId, newStatus: status }) as any,
    });
  } catch (error) {
    console.error("Failed to send order status email:", error);
  }
}

export async function sendAdminPaymentReceived(customerEmail: string, orderId: string, amount: number, currency: string) {
  if (!ADMIN_EMAIL) {
    console.error("sendAdminPaymentReceived: ADMIN_EMAIL is not configured, skipping admin notification.");
    return;
  }
  try {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
      from: `Silk Haus System <${SENDER_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `PAYMENT RECEIVED: ${currency.toUpperCase()} ${amount}`,
      react: AdminPaymentEmail({ customerEmail, orderId, amount, currency }) as any,
    });
  } catch (error) {
    console.error("Failed to send admin payment email:", error);
  }
}

export async function sendWelcomeEmail(toEmail: string, customerName: string) {
  try {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
      from: `Silk Haus <${SENDER_EMAIL}>`,
      to: toEmail,
      subject: `Silk Haus: Exclusive Membership Instructions`,
      react: VerificationEmail({ customerName }) as any,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendBroadcastEmail(
  toEmails: string[], 
  type: 'new_arrival' | 'back_in_stock', 
  product: { name: string; image: string; base_price: number; slug: string }
) {
  if (toEmails.length === 0) return;

  try {
    const resend = getResend();
    if (!resend) return;

    // Use Resend's batch API to send to multiple subscribers
    // Resend batch limit is 100 per call, we should chunk if needed
    const CHUNK_SIZE = 100;
    for (let i = 0; i < toEmails.length; i += CHUNK_SIZE) {
      const chunk = toEmails.slice(i, i + CHUNK_SIZE);
      const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://silkhaus.co.uk';
      
      const emailBatch = chunk.map(email => ({
        from: `Silk Haus <${SENDER_EMAIL}>`,
        to: email,
        subject: type === 'new_arrival' ? `New Arrival: ${product.name}` : `Back in Stock: ${product.name}`,
        react: NewsletterEmail({
          type,
          productName: product.name,
          productImage: product.image,
          productPrice: product.base_price,
          productUrl: `${host}/shop/${product.slug}`
        }) as any,
      }));

      await resend.batch.send(emailBatch);
    }
  } catch (error) {
    console.error("Failed to send newsletter broadcast email:", error);
  }
}
