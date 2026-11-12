"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TradingViewTicker from "@/components/landing/TradingViewTicker";
import ServicesSection from "@/components/landing/ServicesSection";
import InvestmentPlansLanding from "@/components/landing/InvestmentPlansLanding";
import AtfcDepositSection from "@/components/landing/AtfcDepositSection";
import ReferralSection from "@/components/landing/ReferralSection";
import TotalCapitalSection from "@/components/landing/TotalCapitalSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SecurityAuditModal from "@/components/landing/SecurityAuditModal";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck, Check, Star, FileCheck, MessageSquare } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [cms, setCms] = useState({
    hero_badge: "AI-Controlled Financial Protocol",
    hero_title: "Everyday capital,",
    hero_title_highlight: "on AI Rails.",
    hero_subtitle: "Alpha Assets is autonomous capital protection, collateralized credit loans, and weekly compounding yield—settled on non-custodial smart contracts with fees under a cent.",
    hero_primary_cta: "Launch App & Connect Vault",
    hero_secondary_cta: "Read Security Audit",
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("system_settings").select("*").single();
      if (data?.meta) {
        setCms((prev) => ({
          ...prev,
          ...data.meta,
        }));
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf5] text-[#20281f] flex flex-col font-sans selection:bg-[#d1f18b] selection:text-[#20281f]">
      
      {/* Floating Support Desk Launcher */}
      <Link
        href="/contact"
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#20281f] text-white shadow-xl flex items-center space-x-2.5 text-xs font-semibold hover:bg-[#343e32] transition-all group cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 text-[#d1f18b] flex items-center justify-center">
          <MessageSquare className="w-3 h-3" />
        </div>
        <span className="hidden sm:inline">24/7 Support Desk</span>
      </Link>

      <Navbar />

      <main className="flex-1">

        {/* ── 1. Hero Section (Stelsuite / PromptSip Style) ── */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-[#e4e7dc] bg-[#fafaf5]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-14 items-center">

              {/* LEFT COLUMN: Narrative & CTAs */}
              <div className="space-y-6">
                
                {/* Stelsuite Eyebrow */}
                <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f]">
                  <span className="text-[#86a951] text-sm">✳</span>
                  <span>{cms.hero_badge} · Non-Custodial</span>
                </p>

                {/* Primary Hero Title with Squiggle */}
                <h1 className="text-[clamp(44px,5.2vw,72px)] font-bold tracking-[-0.04em] leading-[1.04] text-[#20281f]">
                  {cms.hero_title}<br />
                  <span className="relative inline-block whitespace-nowrap">
                    {cms.hero_title_highlight}
                    <svg
                      viewBox="0 0 470 16"
                      className="absolute -bottom-2 left-0 w-full h-[0.28em] overflow-visible pointer-events-none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 11 Q200 -2 466 9 M80 15 Q280 5 435 14"
                        fill="none"
                        stroke="#c4ee70"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#60695b] max-w-xl leading-[1.6] font-normal">
                  {cms.hero_subtitle}
                </p>

                {/* Three Core Offering Checklist (Stelsuite style) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20281f] bg-white border border-[#dde2d1] p-2.5 rounded-[8px] shadow-2xs">
                    <span className="text-sm">🏦</span>
                    <span>1. Offer Loans</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20281f] bg-white border border-[#dde2d1] p-2.5 rounded-[8px] shadow-2xs">
                    <span className="text-sm">📈</span>
                    <span>2. Compounding Yield</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#20281f] bg-white border border-[#dde2d1] p-2.5 rounded-[8px] shadow-2xs">
                    <span className="text-sm">🛡️</span>
                    <span>3. Crash Protection</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="min-h-[48px] px-6 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>{cms.hero_primary_cta}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setIsAuditModalOpen(true)}
                    className="min-h-[48px] px-6 rounded-[7px] border border-[#20281f30] hover:bg-[#eaece4] text-[#20281f] text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <FileCheck className="w-4 h-4 text-[#416735]" />
                    <span>{cms.hero_secondary_cta}</span>
                  </button>
                </div>

                {/* Social Proof Stack */}
                <div className="pt-4 border-t border-[#e4e7dc] flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {[
                      "/images/avatars/david.jpg",
                      "/images/avatars/sarah.jpg",
                      "/images/avatars/viktor.jpg",
                    ].map((src, idx) => (
                      <div key={idx} className="relative inline-block w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-zinc-200">
                        <Image src={src} alt="Verified Vault Owner" fill sizes="32px" className="object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-[#60695b]">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="text-[#20281f] ml-1">4.9/5</span>
                    </div>
                    <div className="text-[11px] mt-0.5">
                      Securing capital for <strong className="text-[#20281f]">124,500+ self-custodial vaults</strong> worldwide
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Stelsuite Browser Frame (Tilt L) */}
              <div className="relative mt-8 lg:mt-0">
                <div className="bg-white border border-[#dde2d1] rounded-[14px] overflow-hidden shadow-2xl shadow-black/5 transform transition-transform duration-300 hover:rotate-0 rotate-[-1.5deg]">
                  
                  {/* Frame Bar */}
                  <div className="bg-[#f4f7ec] border-b border-[#dde2d1] px-4 py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#cbd4be]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#cbd4be]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#cbd4be]" />
                      <span className="text-[11px] font-mono text-[#60695b] ml-2">alpha-assets.com/ai-escrow</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#416735]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#416735] animate-pulse" />
                      AI GUARD ACTIVE
                    </span>
                  </div>

                  {/* Frame Content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-[#20281f] text-base">Sovereign Vault #4819</h4>
                        <p className="text-xs text-[#60695b]">100% Non-Custodial · Double-Entry Ledger</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#e3f2c9] text-[#416735]">
                        Auto-Protected
                      </span>
                    </div>

                    <div className="rounded-[10px] p-4 bg-[#f4f7ec] border border-[#dfe6d2]">
                      <span className="text-xs text-[#60695b] font-medium">Total Escrowed Capital Value</span>
                      <p className="text-3xl font-bold font-mono text-[#20281f] mt-1">
                        $124,500.00 <span className="text-xs font-mono font-normal text-[#60695b]">USDT / ATFC</span>
                      </p>
                    </div>

                    {/* Telemetry rows */}
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e4e7dc]">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#eae6f2] text-[#5b4e8c] flex items-center justify-center font-bold text-xs">01</span>
                          <span className="font-semibold text-[#20281f]">Collateral Loan Facility</span>
                        </span>
                        <span className="font-mono font-bold text-[#5b4e8c]">70% LTV Ready</span>
                      </li>

                      <li className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e4e7dc]">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#e3f2c9] text-[#416735] flex items-center justify-center font-bold text-xs">02</span>
                          <span className="font-semibold text-[#20281f]">Compounding Yield</span>
                        </span>
                        <span className="font-mono font-bold text-[#416735]">+8.5% Weekly</span>
                      </li>

                      <li className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#e4e7dc]">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#efeee7] text-[#8a5a12] flex items-center justify-center font-bold text-xs">03</span>
                          <span className="font-semibold text-[#20281f]">Crash Protection</span>
                        </span>
                        <span className="font-mono font-bold text-[#8a5a12]">0s Dip Swap</span>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Trust Ticker Rails Bar (Stelsuite style) ── */}
        <div className="bg-[#f4f7ec] border-b border-[#dfe6d2]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-[#60695b]">
            <span className="text-[#20281f] font-bold tracking-[0.14em] uppercase">THREE SERVICES. ONE UNIFIED PROTOCOL.</span>
            <span>⚡ AI Sub-Second Telemetry</span>
            <span>🏦 Collateralized Credit Lending</span>
            <span>📈 Verified 5.0% - 8.5% Weekly Compounding</span>
            <span>🔒 100% Non-Custodial Escrow</span>
          </div>
        </div>

        {/* ── 2. Three Services (1. Offer Loans, 2. Offer Investment Opportunity, 3. Protection Against Liquidity) ── */}
        <ServicesSection />

        {/* ── 3. TradingView Widget Ticker Tape ── */}
        <TradingViewTicker />

        {/* ── 4. Investment Plans (Plan A & Plan B + ROI Simulator) ── */}
        <InvestmentPlansLanding />

        {/* ── 5. ATF Deposit (American Trust Fund Coin Showcase) ── */}
        <AtfcDepositSection />

        {/* ── 6. Affiliate / Referral Program ── */}
        <ReferralSection />

        {/* ── 7. Total Investment Capital (Live Protocol Metrics) ── */}
        <TotalCapitalSection />

        {/* ── 8. Testimonials ── */}
        <TestimonialsSection />

      </main>

      {/* ── 9. Footer (Lime Callout Band + Clean Footer) ── */}
      <Footer />

      {/* Security Audit Modal */}
      <SecurityAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
