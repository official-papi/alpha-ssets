"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TradingViewTicker from "@/components/landing/TradingViewTicker";
import CoreValueBanner from "@/components/landing/CoreValueBanner";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import TopInvestors from "@/components/landing/TopInvestors";
import PlanCards from "@/components/landing/PlanCards";
import LiquidityControlSection from "@/components/landing/LiquidityControlSection";
import RoiCalculator from "@/components/landing/RoiCalculator";
import HowItWorks from "@/components/landing/HowItWorks";
import ReferralSection from "@/components/landing/ReferralSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SecurityAuditModal from "@/components/landing/SecurityAuditModal";
import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Zap, Lock, Sparkles, MessageSquare, Check, Star, FileCheck } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [cms, setCms] = useState({
    hero_badge: "Non-Custodial Smart Escrow Protocol",
    hero_title: "Protect Your Crypto From Crashes—",
    hero_title_highlight: "Without Giving Up Your Private Keys.",
    hero_subtitle: "Automated AI risk management that converts your assets to stablecoins during market downturns and re-enters on recovery. Non-custodial, 24/7 protection powered by smart contract escrow.",
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
    <div className="min-h-screen bg-[#001011] text-zinc-300 flex flex-col font-sans relative overflow-hidden">
      
      {/* Subtle Minimalist Dark Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#093A3E_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Floating Support Desk Launcher */}
      <Link
        href="/contact"
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#041819]/95 backdrop-blur-md border border-[#093A3E] text-white shadow-xl flex items-center space-x-2.5 text-xs font-medium hover:border-[#3AAFB9] transition-all group cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[#093A3E] text-[#3AAFB9] flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <span className="hidden sm:inline text-white font-semibold">24/7 Support Desk</span>
      </Link>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ── 1. Hero Section (Above the Fold) ── */}
        <section className="pt-16 pb-16 sm:pt-20 sm:pb-20 border-b border-[#093A3E] bg-[#001011] relative overflow-hidden text-white">

          {/* Hero Background Image with Seamless Contrast Overlays */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <Image
              src="/images/hero-bg.jpg"
              alt="Non-Custodial AI Risk Protection Architecture"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right lg:object-center opacity-85 filter contrast-110"
            />
            {/* Left-side smooth gradient ensures crystal-clear readability for typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#001011] via-[#001011]/85 sm:via-[#001011]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#001011]/60 via-transparent to-[#001011]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* LEFT COLUMN: Narrative, Checklist & Conversion Actions (7 Cols) */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Protocol Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093A3E]/80 border border-[#3AAFB9]/40 text-white text-xs font-semibold tracking-wide shadow-md backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#3AAFB9] animate-pulse" />
                  <span className="font-semibold text-[#b5dfe3]">{cms.hero_badge}</span>
                  <span className="text-[#3AAFB9]/40">|</span>
                  <span className="text-[#3AAFB9] text-[11px] font-mono">100% Non-Custodial</span>
                </div>

                {/* Primary Hero Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black font-slab text-white tracking-tight leading-[1.08] max-w-2xl">
                  {cms.hero_title}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d9eef0] to-[#3AAFB9]">
                    {cms.hero_title_highlight}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#d2d7df] font-normal leading-relaxed max-w-xl">
                  {cms.hero_subtitle}
                </p>

                {/* Key Institutional Proof Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-xl">
                  {[
                    "Zero centralized exchange lockup",
                    "Automated stablecoin dip protection",
                    "Revocable scoped AI session keys",
                    "Master private key remains with you",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#d2d7df] font-medium">
                      <div className="w-4 h-4 rounded-full bg-[#093A3E] border border-[#3AAFB9]/50 text-[#3AAFB9] flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="px-8 py-3.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 bg-[#3AAFB9] hover:bg-[#5cb4be] text-[#001011] transition-all shadow-lg shadow-[#3AAFB9]/25 cursor-pointer active:scale-95"
                  >
                    <span>{cms.hero_primary_cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setIsAuditModalOpen(true)}
                    className="px-7 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all backdrop-blur-md cursor-pointer active:scale-95"
                  >
                    <FileCheck className="w-4 h-4 text-[#3AAFB9]" />
                    <span>{cms.hero_secondary_cta}</span>
                  </button>
                </div>

                {/* Social Proof & Investor Community Stack */}
                <div className="pt-4 border-t border-[#093A3E] flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {[
                      "/images/avatars/david.jpg",
                      "/images/avatars/sarah.jpg",
                      "/images/avatars/viktor.jpg",
                    ].map((src, idx) => (
                      <div key={idx} className="relative inline-block w-8 h-8 rounded-full ring-2 ring-[#001011] overflow-hidden bg-zinc-800">
                        <Image src={src} alt="Verified Vault Owner" fill sizes="32px" className="object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="font-bold text-white ml-1">4.9/5</span>
                    </div>
                    <div className="text-[11px] text-[#b5dfe3] font-normal mt-0.5">
                      Securing capital for <span className="font-semibold text-white">124,500+ self-custodial vaults</span> worldwide
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Terminal Window & Anchored Telemetry (5 Cols) */}
              <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                <div className="relative rounded-2xl p-1 bg-gradient-to-b from-[#3AAFB9]/40 via-[#093A3E]/60 to-[#001011] shadow-2xl">
                  <div className="relative rounded-[14px] overflow-hidden bg-[#041819] border border-[#093A3E]">
                    
                    {/* Terminal Title Bar */}
                    <div className="px-4 py-2.5 bg-[#001011] border-b border-[#093A3E] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#093A3E] border border-[#3AAFB9]/40" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#093A3E] border border-[#3AAFB9]/40" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#093A3E] border border-[#3AAFB9]/40" />
                        <span className="ml-2 font-mono text-[11px] text-[#b5dfe3]">vault-escrow.v2.4</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#3AAFB9] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9] animate-pulse" />
                        <span>AI GUARD ACTIVE</span>
                      </div>
                    </div>

                    {/* Terminal Canvas */}
                    <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full">
                      <Image
                        src="/images/hero-preview.jpg"
                        alt="Alpha Vault Terminal Interface"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Anchored Telemetry Bar */}
                    <div className="p-3 bg-[#001011]/90 border-t border-[#093A3E] grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2.5 bg-[#041819] p-2.5 rounded-xl border border-[#093A3E]">
                        <div className="w-7 h-7 rounded-lg bg-[#093A3E] text-[#3AAFB9] flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-[#86cbd1] uppercase font-bold truncate">Downside Protection</div>
                          <div className="text-xs font-mono font-bold text-white truncate">Auto-Stablecoin Swap <span className="text-[#3AAFB9] text-[10px]">(0s Delay)</span></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-[#041819] p-2.5 rounded-xl border border-[#093A3E]">
                        <div className="w-7 h-7 rounded-lg bg-[#093A3E] text-[#3AAFB9] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-[#86cbd1] uppercase font-bold truncate">Escrow Governance</div>
                          <div className="text-xs font-mono font-bold text-white truncate">100% Non-Custodial</div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Core Value Banner (Trust & Differentiation) ── */}
        <CoreValueBanner />

        {/* Realtime Market Ticker Tape */}
        <TradingViewTicker />

        {/* ── 3. How It Works (3-Step Section) ── */}
        <HowItWorks />

        {/* ── 4. Key Features Grid ── */}
        <FeaturesGrid />

        {/* ── Liquidity Channels & Vault Coverage ── */}
        <LiquidityControlSection />

        {/* ── Unified Institutional Performance & Security Console ────── */}
        <section className="py-12 bg-[#001011] border-b border-[#093A3E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#001011] border border-[#093A3E] rounded-2xl shadow-xl overflow-hidden">
              
              {/* Terminal HUD Header */}
              <div className="px-6 py-3.5 bg-[#041819] border-b border-[#093A3E] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#3AAFB9] animate-pulse" />
                  <span className="font-bold text-white tracking-tight">On-Chain Smart Escrow Reserves & Cryptographic Proofs</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-[#b5dfe3]">
                  <span>AUDIT STATUS: <strong className="text-[#3AAFB9] font-bold">100% FORMALLY VERIFIED</strong></span>
                  <span className="hidden sm:inline text-[#093A3E]">|</span>
                  <span className="hidden sm:inline">SETTLEMENT: NON-CUSTODIAL</span>
                </div>
              </div>

              {/* 4 Quantitative Metrics Columns with Dividers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#093A3E]">
                {[
                  { label: "Total Protected Assets", value: "$256,400,000+", sub: "In User Vaults", icon: TrendingUp },
                  { label: "Preserved Capital",      value: "$734,180,000+", sub: "Downturn Swaps", icon: Zap },
                  { label: "Connected Vaults",       value: "124,500+",       sub: "Global Wallets", icon: Sparkles },
                  { label: "Non-Custodial Escrow",    value: "100.0%",         sub: "Zero Private Key Access", icon: ShieldCheck },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="bg-[#001011] p-6 text-center lg:text-left flex flex-col justify-between hover:bg-[#093A3E]/30 transition-colors">
                      <div className="flex items-center justify-center lg:justify-between mb-3">
                        <span className="text-[11px] font-bold text-[#b5dfe3] uppercase tracking-wider">{m.label}</span>
                        <div className="hidden lg:flex w-7 h-7 rounded-lg bg-[#093A3E] text-[#3AAFB9] border border-[#3AAFB9]/30 items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                        {m.value}
                      </div>
                      <div className="mt-2 flex items-center justify-center lg:justify-start">
                        <span className="text-[10px] font-semibold text-[#3AAFB9] bg-[#093A3E] px-2 py-0.5 rounded-md border border-[#3AAFB9]/40 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9]" />
                          {m.sub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Integrated Security & Custody Footer */}
              <div className="px-6 py-4 bg-[#041819] border-t border-[#093A3E] grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, title: "100% Non-Custodial Vaults", desc: "Your keys, your crypto. We never hold withdrawal rights." },
                  { icon: Lock,        title: "Deterministic Smart Escrow", desc: "Transparent execution enforced by verified on-chain code" },
                  { icon: Zap,         title: "Millisecond AI Re-Entry", desc: "Automated recovery conversions back to targeted assets" },
                ].map((b, i) => {
                  const BIcon = b.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#093A3E] border border-[#3AAFB9]/30 text-[#3AAFB9] flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <BIcon className="w-4 h-4 text-[#3AAFB9]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{b.title}</div>
                        <div className="text-[11px] text-[#86cbd1] font-normal leading-tight">{b.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </section>

        <TopInvestors />
        <PlanCards />
        <RoiCalculator />
        <ReferralSection />
        <TestimonialsSection />

      </main>

      <Footer />

      {/* Security Audit Modal */}
      <SecurityAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
