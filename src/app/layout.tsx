import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { AutoLogout } from "@/components/shared/auto-logout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SILK HAUS | Premium Hair",
  description: "Luxury hair and wig brand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} antialiased font-sans bg-background text-white`}
      >
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <CookieBanner />
        <AutoLogout />
      </body>
    </html>
  );
}
