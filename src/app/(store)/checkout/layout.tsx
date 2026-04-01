"use client";

import { CaptchaProvider } from "@/components/providers/captcha-provider";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CaptchaProvider>{children}</CaptchaProvider>;
}
