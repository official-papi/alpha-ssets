"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import HowItWorks from "@/components/landing/HowItWorks";
import ReferralSection from "@/components/landing/ReferralSection";
import { Layers, CheckCircle2, UserPlus, Wallet, ArrowRightLeft } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-16">
        
        {/* Architectural 2-Column Hero */}
        <PageHero
          badge="4-Step Automated Protocol"
          title="How The High-Yield Engine"
          titleHighlight="Operates Step-by-Step"
          subtitle="Learn how to create your investor account, fund your deposit wallet via gateway or crypto, activate your preferred compounding tier, and withdraw interest payouts."
          icon={Layers}
          breadcrumb="How It Works"
          stats={[
            { label: "Account Setup", value: "< 2 Mins" },
            { label: "Deposit Approval", value: "Instant / Fast" },
            { label: "Yield Payouts", value: "Automated" },
          ]}
          hudContent={
            <div className="space-y-2 py-1 text-xs font-medium">
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-[#093A3E]/10 border border-[#093A3E]/20 text-[#093A3E] font-extrabold flex items-center justify-center text-[10px]">1</div>
                <span className="font-extrabold text-slate-900">Create Free Account</span>
              </div>
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-[#093A3E]/10 border border-[#093A3E]/20 text-[#093A3E] font-extrabold flex items-center justify-center text-[10px]">2</div>
                <span className="font-extrabold text-slate-900">Fund Deposit Wallet</span>
              </div>
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#093A3E]/5 border border-[#3AAFB9]/30">
                <div className="w-6 h-6 rounded-lg bg-[#093A3E] text-[#3AAFB9] font-extrabold flex items-center justify-center text-[10px]">3</div>
                <span className="font-extrabold text-[#001011]">Subscribe & Earn Daily ROI</span>
              </div>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorks />
          <ReferralSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
