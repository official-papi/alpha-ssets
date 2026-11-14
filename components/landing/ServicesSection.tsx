"use client";

import Link from "next/link";
import { HandCoins, TrendingUp, ShieldAlert, ArrowUpRight, Check } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      num: "01",
      badge: "Lending Rails",
      title: "Offer Loans",
      subtitle: "Collateralized credit and company house loan financing.",
      description:
        "Access instant capital liquidity and corporate loan facilities without liquidating your core crypto portfolio. Borrow against verified deposits with zero prepayment penalties.",
      features: [
        "Up to 70% Loan-to-Value (LTV) on verified assets",
        "Company house loan eligibility for executive tiers",
        "Instant wallet disbursement upon collateral escrow",
      ],
      bg: "#eae6f2",
      borderColor: "#d8d0e7",
      accent: "#5b4e8c",
      iconText: "🏦",
      footText: "Borrow Capital",
      ctaHref: "/dashboard",
    },
    {
      num: "02",
      badge: "Autonomous Engine",
      title: "AI Cryptocurrency Management System",
      subtitle: "Autonomous multi-asset rebalancing and yield optimization.",
      description:
        "Deploy capital into our proprietary neural management engine. It continuously tracks on-chain liquidity, executes automated rebalancing across top assets (BTC, ETH, SOL, XRP, ATFC), and maximizes risk-adjusted returns 24/7 with zero emotional bias.",
      features: [
        "Dynamic multi-asset rebalancing across BTC, ETH, SOL, XRP & ATFC",
        "Algorithmic arbitrage and predictive liquidity routing",
        "100% Non-custodial execution with continuous telemetry",
      ],
      bg: "#e3f2c9",
      borderColor: "#cbe59d",
      accent: "#416735",
      iconText: "🤖",
      footText: "Explore AI System",
      ctaHref: "/#ai-management",
    },
    {
      num: "03",
      badge: "AI Risk Engine",
      title: "Protection Against Liquidity",
      subtitle: "24/7 autonomous downside crash & dip protection.",
      description:
        "Never suffer devastating portfolio drawdowns again. Our sub-second AI telemetry detects market crashes, converts assets to stablecoins instantly, and automatically re-enters on recovery.",
      features: [
        "24/7 autonomous order-book & volatility telemetry",
        "Zero-delay automated swap to USDC/USDT on dips",
        "100% Non-custodial with zero withdrawal permissions",
      ],
      bg: "#efeee7",
      borderColor: "#e0ded3",
      accent: "#8a5a12",
      iconText: "🛡️",
      footText: "Shield Liquidity",
      ctaHref: "/how-it-works",
    },
  ];

  return (
    <section id="services" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f] mb-3">
            <span className="text-[#86a951] text-sm">✳</span>
            <span>Three Core Services · One Set of Rails</span>
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] leading-[1.06]">
            Three services, engineered for everyday capital.
          </h2>
          <p className="text-base sm:text-lg text-[#60695b] mt-4 leading-relaxed font-normal">
            From flexible collateral loans to high-yield investment compounding and autonomous crash protection, our AI platform manages your entire wealth lifecycle.
          </p>
        </div>

        {/* 3-Card Grid (Stelsuite style: Ajo / StellarDrop / PromptSip) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {services.map((svc) => (
            <div
              key={svc.num}
              style={{ backgroundColor: svc.bg, borderColor: svc.borderColor }}
              className="flex flex-col justify-between rounded-[14px] border p-7 text-[#20281f] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
            >
              <div>
                {/* Header: Icon Box + Large Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-[10px] bg-white/80 border border-white flex items-center justify-center text-xl shadow-2xs">
                    {svc.iconText}
                  </div>
                  <span className="font-mono text-sm font-bold text-[#60695b]">
                    {svc.num}
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: svc.accent }}>
                  {svc.badge}
                </div>

                <h3 className="text-2xl font-bold tracking-[-0.03em] text-[#20281f] mb-2 leading-snug">
                  {svc.title}
                </h3>

                <p className="text-sm font-semibold text-[#20281f] mb-3 leading-snug">
                  {svc.subtitle}
                </p>

                <p className="text-xs sm:text-[13px] text-[#60695b] leading-relaxed mb-6 font-normal">
                  {svc.description}
                </p>

                {/* Features checklist */}
                <div className="space-y-2 pt-3 border-t border-black/5 mb-6">
                  {svc.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#3d453b]">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold" style={{ color: svc.accent }}>
                        ✓
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stelsuite Card Footer with arrow */}
              <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em]">
                <Link
                  href={svc.ctaHref}
                  className="flex items-center gap-1.5 hover:underline"
                  style={{ color: svc.accent }}
                >
                  <span>{svc.footText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
