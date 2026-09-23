"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, LucideIcon, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
}

interface PageHeroProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  icon?: LucideIcon;
  breadcrumb: string;
  stats?: StatItem[];
  ctaText?: string;
  ctaHref?: string;
  hudContent?: React.ReactNode;
}

export default function PageHero({
  badge = "Institutional Protocol",
  title,
  titleHighlight,
  subtitle,
  icon: Icon = Sparkles,
  breadcrumb,
  stats = [
    { label: "Assets Deposited", value: "$28.4M+" },
    { label: "Daily Payouts", value: "100% On-Time" },
    { label: "Security Level", value: "256-Bit SSL" },
  ],
  ctaText = "Get Started",
  ctaHref = "/register",
  hudContent,
}: PageHeroProps) {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden border-b border-zinc-200/70 bg-[#fafafa]">
      
      {/* Background Architectural Texture Image */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/subpage-hero-bg.jpg"
          alt="Architectural Backdrop"
          fill
          priority
          className="object-cover object-center opacity-75 filter contrast-115 brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa]/95 via-[#fafafa]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafa]/30 via-transparent to-[#fafafa]" />
      </div>

      {/* Geometric Grid Canvas Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COMMAND COLUMN (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Breadcrumb & Live Status Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-xs text-zinc-500 font-medium shadow-xs">
                <Link href="/" className="hover:text-zinc-950 transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-950 font-semibold">{breadcrumb}</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live System V2.4</span>
              </div>
            </div>

            {/* Category Identity Badge */}
            <div className="hm-section-label">
              <Icon className="w-3.5 h-3.5 text-zinc-900" />
              <span>{badge}</span>
            </div>

            {/* Main Architectural H1 Title */}
            <h1 className="text-3xl sm:text-5xl font-bold text-zinc-950 tracking-tight leading-[1.12]">
              {title}{" "}
              {titleHighlight && (
                <span className="hm-gradient-text">
                  {titleHighlight}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="minimal-btn-primary px-7 py-3 rounded-xl text-xs font-medium flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/plans"
                className="px-6 py-3 rounded-xl text-xs font-medium bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-all shadow-xs"
              >
                View Investment Tiers
              </Link>
            </div>

            {/* Institutional Stats Counter Bar */}
            {stats && stats.length > 0 && (
              <div className="pt-6 border-t border-zinc-200/80 grid grid-cols-3 gap-4 max-w-lg">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white border border-zinc-200/80 rounded-xl p-3 shadow-xs">
                    <div className="text-base font-bold font-mono text-zinc-950">{s.value}</div>
                    <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT ARCHITECTURAL HUD COLUMN (5 Columns) */}
          <div className="lg:col-span-5 relative">

            {/* Frosted HUD Container */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
              
              {/* HUD Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                  <div className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                  <div className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                  <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase ml-2">SYSTEM HUD</span>
                </div>
                <span className="text-[10px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                  REALTIME SECURE
                </span>
              </div>

              {/* Dynamic Page Specific HUD Content */}
              {hudContent ? (
                hudContent
              ) : (
                <div className="space-y-2 py-2 text-xs">
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between">
                    <span className="text-zinc-500 font-normal">Protocol Encryption</span>
                    <span className="font-mono font-semibold text-emerald-600">256-Bit SSL</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between">
                    <span className="text-zinc-500 font-normal">Execution Engine</span>
                    <span className="font-mono font-semibold text-zinc-950">Automated Edge</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between">
                    <span className="text-zinc-500 font-normal">Payout Guarantee</span>
                    <span className="font-mono font-semibold text-zinc-950">Double-Entry Ledger</span>
                  </div>
                </div>
              )}

              {/* HUD Footer Seal */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] font-medium text-zinc-500">
                <div className="flex items-center space-x-1.5 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audited Smart Protocol</span>
                </div>
                <span className="font-mono text-zinc-400">ALPHA-ASSETS</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
