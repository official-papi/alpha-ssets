"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TradingViewTicker from "@/components/landing/TradingViewTicker";
import TopInvestors from "@/components/landing/TopInvestors";
import PlanCards from "@/components/landing/PlanCards";
import RoiCalculator from "@/components/landing/RoiCalculator";
import HowItWorks from "@/components/landing/HowItWorks";
import ReferralSection from "@/components/landing/ReferralSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Zap, Lock, Sparkles, MessageSquare, Check, Star } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [cms, setCms] = useState({
    hero_badge: "Automated AI Compounding Protocol",
    hero_title: "Automated AI Investment Growth Engine",
    hero_subtitle: "Deploy capital into algorithmic AI compounding strategies. Earn guaranteed weekly interest payouts with double-entry database ledger security and instant liquidity.",
    hero_cta: "Get Started Now",
    about_metric1: "$256M+",
    about_metric2: "$734M+",
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
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      
      {/* Subtle Minimalist Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* Floating Support Desk Launcher */}
      <Link
        href="/contact"
        className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200 text-zinc-900 shadow-md flex items-center space-x-2.5 text-xs font-medium hover:border-zinc-300 transition-all group cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <span className="hidden sm:inline text-zinc-900 font-semibold">24/7 Support Desk</span>
      </Link>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ── Split Asymmetric Hero Section ────────────────────────────── */}
        <section className="pt-16 pb-20 sm:pt-20 sm:pb-28 border-b border-zinc-200/70 relative overflow-hidden">

          {/* Hero Background Image with Minimalist Overlays */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <Image
              src="/images/hero-bg.jpg"
              alt="Institutional Fintech Data Mesh"
              fill
              priority
              className="object-cover object-center opacity-25 mix-blend-luminosity filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/90 to-[#fafafa]/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa]/60 via-transparent to-[#fafafa]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* LEFT COLUMN: Narrative, Checklist & Conversion Actions (7 Cols) */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Protocol Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-900 text-xs font-medium tracking-wide shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">{cms.hero_badge}</span>
                  <span className="text-zinc-300">|</span>
                  <span className="text-zinc-500 text-[11px]">V2.4 Live</span>
                </div>

                {/* Primary Hero Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-zinc-950 tracking-tight leading-[1.1] max-w-2xl">
                  {cms.hero_title}
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed max-w-xl">
                  {cms.hero_subtitle}
                </p>

                {/* Key Institutional Proof Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-xl">
                  {[
                    "Daily automated compounding payouts",
                    "Double-entry cryptographic ledger audit",
                    "Instant withdrawals to USDT, BTC & ETH",
                    "Zero lockup capital redemption tier",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    href="/register"
                    className="minimal-btn-primary px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 font-medium cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <span>{cms.hero_cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/plans"
                    className="px-7 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer font-medium bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-all shadow-xs"
                  >
                    <span>Explore Yield Plans</span>
                  </Link>
                </div>

                {/* Social Proof & Investor Community Stack */}
                <div className="pt-4 border-t border-zinc-200/80 flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {[
                      "/images/avatars/david.jpg",
                      "/images/avatars/sarah.jpg",
                      "/images/avatars/viktor.jpg",
                    ].map((src, idx) => (
                      <div key={idx} className="relative inline-block w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-zinc-100">
                        <Image src={src} alt="Verified Investor" fill className="object-cover" />
                      </div>
                    ))}
                  </div>

                  <div className="text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="font-bold text-zinc-950 ml-1">4.9/5</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-normal mt-0.5">
                      Trusted by <span className="font-semibold text-zinc-800">124,500+ active investors</span> worldwide
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Interactive Terminal Window & Floating HUD Chips (5 Cols) */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">

                {/* Main 3D Terminal Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14)] bg-zinc-950 group">
                  
                  {/* Terminal Header */}
                  <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                      <span className="ml-2 font-mono text-[11px] text-zinc-400">terminal.alpha-assets.com</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Edge</span>
                    </div>
                  </div>

                  {/* Terminal Image Canvas */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full">
                    <Image
                      src="/images/hero-preview.jpg"
                      alt="Alpha@ssets Platform Terminal Interface"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Floating HUD Chip 1 (Top Left Overlap) */}
                <div className="hidden sm:flex absolute -top-4 -left-6 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-xl p-3 shadow-lg items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Today's Settlement</div>
                    <div className="text-xs font-bold font-mono text-zinc-950">
                      +$12,450.00 USDT <span className="text-emerald-600 font-semibold">(+4.85%)</span>
                    </div>
                  </div>
                </div>

                {/* Floating HUD Chip 2 (Bottom Right Overlap) */}
                <div className="hidden sm:flex absolute -bottom-5 -right-4 bg-white/95 backdrop-blur-md border border-zinc-200/90 rounded-xl p-3 shadow-lg items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold">Ledger Verification</div>
                    <div className="text-xs font-bold text-zinc-950 font-mono">100% On-Chain Proof</div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Realtime Market Ticker Tape */}
        <TradingViewTicker />

        {/* ── Unified Institutional Performance & Security Console ────── */}
        <section className="py-12 bg-white border-b border-[#d4e7e9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#001011] border border-[#093A3E] rounded-2xl shadow-xl overflow-hidden">
              
              {/* Terminal HUD Header */}
              <div className="px-6 py-3.5 bg-[#041819] border-b border-[#093A3E] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#3AAFB9] animate-pulse" />
                  <span className="font-bold text-white tracking-tight">Institutional Proof of Reserves & Settlement Ledger</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-[#b5dfe3]">
                  <span>AUDIT STATUS: <strong className="text-[#3AAFB9] font-bold">100% ON-CHAIN VERIFIED</strong></span>
                  <span className="hidden sm:inline text-[#093A3E]">|</span>
                  <span className="hidden sm:inline">CYCLE: REALTIME DETERMINISTIC</span>
                </div>
              </div>

              {/* 4 Quantitative Metrics Columns with Dividers */}
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#093A3E]">
                {[
                  { label: "Total Assets Deposited", value: "$256,400,000+", sub: "Verified Capital", icon: TrendingUp },
                  { label: "Total Yield Disbursed",  value: "$734,180,000+", sub: "Automated Payouts", icon: Zap },
                  { label: "Active Investors",       value: "124,500+",       sub: "Global Accounts", icon: Sparkles },
                  { label: "Double-Entry Ledger",    value: "100.0%",         sub: "Zero Discrepancy", icon: ShieldCheck },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="p-6 text-center lg:text-left flex flex-col justify-between hover:bg-[#093A3E]/20 transition-colors">
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
                  { icon: ShieldCheck, title: "256-Bit SSL Transport", desc: "Bank-grade encrypted communication protocol" },
                  { icon: Lock,        title: "Cold Storage Segregated Vaults", desc: "Multi-signature cryptographic custody keys" },
                  { icon: Zap,         title: "Automated Instant Liquidity", desc: "Deterministic double-entry ledger settlement" },
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
        <HowItWorks />
        <ReferralSection />
        <TestimonialsSection />

      </main>

      <Footer />
    </div>
  );
}
