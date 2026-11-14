"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AiCryptoManagementSection from "@/components/landing/AiCryptoManagementSection";

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[#fafaf5] text-[#20281f] flex flex-col font-sans selection:bg-[#d1f18b] selection:text-[#20281f]">
      <Navbar />

      <main className="flex-1">
        <AiCryptoManagementSection />
      </main>

      <Footer />
    </div>
  );
}
