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
import { ArrowRight, ShieldCheck, TrendingUp, Zap, Lock, Sparkles, MessageSquare } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 text-slate-600 flex flex-col font-sans relative overflow-hidden">
      
      {/* Ambient Radial Glass Glow Background Orbs */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Glass Help Support Badge Launcher */}
      <Link
        href="/contact"
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/90 text-indigo-600 shadow-2xl flex items-center space-x-2.5 font-extrabold text-xs hover:scale-105 transition-all duration-300 group cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700">
          <MessageSquare className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline text-slate-900 font-black">24/7 Support Desk</span>
      </Link>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="py-24 border-b border-white/80 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-white/80 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-8 shadow-xs backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{cms.hero_badge}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
              {cms.hero_title}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              {cms.hero_subtitle}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register"
                className="minimal-btn-primary px-8 py-3.5 rounded-xl text-sm flex items-center gap-2 w-full sm:w-auto shadow-lg shadow-indigo-600/20 cursor-pointer font-extrabold">
                <span>{cms.hero_cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/plans"
                className="px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer font-extrabold bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 hover:bg-white transition-all shadow-xs">
                <span>Explore Investment Tiers</span>
              </Link>
            </div>

            {/* ── Glass Metrics ────────────────────────────────────── */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {[
                { label: "Total Assets Deposited",  value: "$256M+", color: "text-slate-900" },
                { label: "Total Payouts Sent",      value: "$734M+", color: "text-indigo-600" },
                { label: "Active Investors",        value: "90,000+", color: "text-slate-900" },
                { label: "Execution Uptime",        value: "100%",   color: "text-emerald-600" },
              ].map(m => (
                <div key={m.label} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                  
                  <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 text-center shadow-xl shadow-slate-900/5 hover:bg-white/85 hover:-translate-y-0.5 transition-all duration-300">
                    <div className={`text-2xl sm:text-3xl font-black font-mono ${m.color}`}>{m.value}</div>
                    <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mt-1">{m.label}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── Glass Trust Badges ─────────────────────────────────── */}
        <section className="py-10 border-b border-white/80 bg-white/50 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: ShieldCheck, title: "SSL Encrypted",   desc: "256-bit SSL on every connection" },
              { icon: Lock,        title: "2FA Security",    desc: "Two-factor authentication available" },
              { icon: TrendingUp,  title: "Daily Payouts",   desc: "Automated interest disbursement" },
            ].map(b => (
              <div key={b.title} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-100/80 flex items-center justify-center backdrop-blur-xs">
                  <b.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{b.title}</div>
                <div className="text-xs text-slate-500 font-medium">{b.desc}</div>
              </div>
            ))}
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
