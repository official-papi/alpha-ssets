import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alpha@ssets — Premium Automated Investment Platform",
  description: "High-performance automated yield generation and investor portal. Earn daily returns with full transparency.",
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import GoogleTranslateBridge from "@/components/common/GoogleTranslateBridge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-[family-name:var(--font-jakarta)] antialiased"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <GoogleTranslateBridge />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
