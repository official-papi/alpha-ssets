import type { Metadata } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alpha@ssets — Non-Custodial AI Risk Protection & Escrow Protocol",
  description: "Automated AI risk management that converts your crypto assets to stablecoins during market downturns and re-enters on recovery. Non-custodial 24/7 protection powered by smart contract escrow.",
};

import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import GoogleTranslateBridge from "@/components/common/GoogleTranslateBridge";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${robotoSlab.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans antialiased text-zinc-100 bg-[#001011]"
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
