import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { AutoLogout } from "@/components/shared/auto-logout";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased font-sans bg-background text-foreground"
        style={{
          fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
        }}
      >
        {children}
        <Toaster position="bottom-right" richColors closeButton />
        <CookieBanner />
        <AutoLogout />
      </body>
    </html>
  );
}
