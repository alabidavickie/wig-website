// Initialize Resend lazily to avoid build-time errors if API key is missing
let resendInstance: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Replace this with the actual verified domain email from Resend (e.g., support@silkhaus.com)
// If testing without a domain, use the default Resend testing email (onboarding@resend.dev) but it only goes to the owner's email address.
const SENDER_EMAIL = 'onboarding@resend.dev'; 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@silkhaus.com"; // Configurable admin email

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
  try {
    const resend = getResend();
    if (!resend) return;

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
