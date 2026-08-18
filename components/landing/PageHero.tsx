"use client";

import Link from "next/link";
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
    <section className="relative py-16 sm:py-24 overflow-hidden border-b border-white/80">
      
      {/* Geometric Grid Canvas Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Ambient Glass Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT COMMAND COLUMN (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Breadcrumb & Live Status Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-xs text-slate-500 font-bold shadow-2xs">
                <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-indigo-600 font-extrabold">{breadcrumb}</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50/80 backdrop-blur-md border border-emerald-200/80 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live System V2.4</span>
              </div>
            </div>

            {/* Category Identity Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-md border border-indigo-200/80 text-indigo-700 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Icon className="w-4 h-4 text-indigo-600" />
              <span>{badge}</span>
            </div>

            {/* Main Architectural H1 Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              {title}{" "}
              {titleHighlight && (
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
                  {titleHighlight}
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href={ctaHref}
                className="minimal-btn-primary px-7 py-3.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/plans"
                className="px-6 py-3.5 rounded-xl text-xs font-extrabold bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 hover:bg-white transition-all shadow-2xs"
              >
                View Investment Tiers
              </Link>
            </div>

            {/* Institutional Stats Counter Bar */}
            {stats && stats.length > 0 && (
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-3 shadow-2xs">
                    <div className="text-base font-black font-mono text-slate-900">{s.value}</div>
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT ARCHITECTURAL HUD COLUMN (5 Columns) */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient Background Halo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-80" />

            {/* Frosted Glass HUD Container */}
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/90 rounded-2xl p-6 shadow-2xl shadow-slate-900/10 space-y-4">
              
              {/* HUD Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase ml-2">ARCHITECTURAL HUD</span>
                </div>
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-200/80">
                  REALTIME SECURE
                </span>
              </div>

              {/* Dynamic Page Specific HUD Content */}
              {hudContent ? (
                hudContent
              ) : (
                <div className="space-y-3 py-2 text-xs">
                  <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Protocol Encryption</span>
                    <span className="font-mono font-extrabold text-emerald-600">256-Bit SSL</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Execution Engine</span>
                    <span className="font-mono font-extrabold text-indigo-600">Automated Edge</span>
                  </div>
                  <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Payout Guarantee</span>
                    <span className="font-mono font-extrabold text-slate-900">Double-Entry Ledger</span>
                  </div>
                </div>
              )}

              {/* HUD Footer Seal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-extrabold text-slate-500">
                <div className="flex items-center space-x-1.5 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audited Smart Protocol</span>
                </div>
                <span className="font-mono text-slate-400">HYIPMAX-V2</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
