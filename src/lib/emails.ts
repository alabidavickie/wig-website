import { Resend } from 'resend';
import { OrderStatusEmail } from '@/components/emails/order-status-email';
import { AdminPaymentEmail } from '@/components/emails/admin-payment-email';

const resend = new Resend(process.env.RESEND_API_KEY);

// Replace this with the actual verified domain email from Resend (e.g., support@silkhaus.com)
// If testing without a domain, use the default Resend testing email (onboarding@resend.dev) but it only goes to the owner's email address.
const SENDER_EMAIL = 'onboarding@resend.dev'; 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@silkhaus.com"; // Configurable admin email

export async function sendOrderStatusUpdate(toEmail: string, customerName: string, orderId: string, status: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing. Skipping order status email.");
    return;
  }

  try {
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
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing. Skipping admin payment email.");
    return;
  }

  try {
    await resend.emails.send({
      from: `Silk Haus System <${SENDER_EMAIL}>`,
      to: ADMIN_EMAIL, // Should configure actual admin email in prod
      subject: `PAYMENT RECEIVED: ${currency.toUpperCase()} ${amount}`,
      react: AdminPaymentEmail({ customerEmail, orderId, amount, currency }) as any,
    });
  } catch (error) {
    console.error("Failed to send admin payment email:", error);
  }
}
