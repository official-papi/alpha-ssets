"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, Calculator, Sparkles, TrendingUp } from "lucide-react";

export default function InvestmentPlansLanding() {
  const [selectedPlan, setSelectedPlan] = useState<"planA" | "planB">("planA");
  const [simAmount, setSimAmount] = useState<number>(1000);

  const planA = {
    id: "planA",
    tag: "Plan A · Starter",
    name: "Regular Package",
    rate: 5.0,
    rateText: "5.0%",
    interval: "Weekly",
    duration: "8 Weeks",
    weeks: 8,
    min: 500,
    max: 20000,
    features: [
      "5.0% Guaranteed weekly interest payout",
      "100% principal capital back at maturity (8 weeks)",
      "Instant multi-crypto & ATFC wallet withdrawals",
      "Automated edge execution with zero manual delays",
      "Standard 24/7 investor desk support",
    ],
  };

  const planB = {
    id: "planB",
    tag: "Plan B · Executive Tier",
    name: "Premium Package",
    rate: 8.5,
    rateText: "8.5%",
    interval: "Weekly",
    duration: "16 Weeks",
    weeks: 16,
    min: 20000,
    max: 5000000,
    featured: true,
    features: [
      "8.5% High-yield weekly compounding return",
      "100% principal capital back at maturity (16 weeks)",
      "🏠 Company house loan eligibility (pay in installments)",
      "Prioritized instant VIP liquidity withdrawals",
      "Dedicated private wealth executive & custom allocations",
    ],
  };

  const activePlanData = selectedPlan === "planA" ? planA : planB;
  const weeklyProfit = (simAmount * activePlanData.rate) / 100;
  const totalProfit = weeklyProfit * activePlanData.weeks;
  const totalNetReturn = simAmount + totalProfit;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section id="plans" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f] mb-3">
            <span className="text-[#86a951] text-sm">✳</span>
            <span>Investment Plans · Dual Tiers</span>
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] leading-[1.06]">
            Plan A & Plan B. Transparent yield compounding.
          </h2>
          <p className="text-base sm:text-lg text-[#60695b] mt-4 leading-relaxed font-normal">
            Choose between our Starter and Executive compounding packages, or simulate your return live below.
          </p>
        </div>

        {/* 2 Plan Cards (Stelsuite style) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12 items-stretch">
          
          {/* ── Plan A Card ── */}
          <div
            onClick={() => {
              setSelectedPlan("planA");
              if (simAmount > 20000 || simAmount < 500) setSimAmount(1000);
            }}
            className={`cursor-pointer rounded-[14px] p-8 transition-all duration-200 flex flex-col justify-between border ${
              selectedPlan === "planA"
                ? "bg-white border-[#20281f] shadow-xl ring-2 ring-[#20281f]/10"
                : "bg-white border-[#dde2d1] hover:border-[#20281f]/40 shadow-xs"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-[#416735] bg-[#e3f2c9] px-3 py-1 rounded-full">
                  {planA.tag}
                </span>
                <span className="text-xs font-mono text-[#60695b] font-medium">{planA.duration}</span>
              </div>

              <h3 className="text-2xl font-bold text-[#20281f] mb-1 tracking-tight">{planA.name}</h3>
              <p className="text-xs text-[#60695b] mb-6">Designed for steady capital growth with low entry barrier.</p>

              {/* Rate Box */}
              <div className="p-4 rounded-[10px] bg-[#f4f7ec] border border-[#dfe6d2] mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-[#20281f]">{planA.rateText}</span>
                  <span className="text-xs text-[#60695b] ml-1.5 font-semibold">/ Week</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#60695b]">Deposit Limits</div>
                  <div className="text-xs font-mono font-bold text-[#20281f]">$500 – $20,000</div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5 mb-6">
                {planA.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#3d453b]">
                    <div className="w-4 h-4 rounded-full bg-[#e3f2c9] text-[#416735] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✓
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#e4e7dc]">
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Invest in Plan A</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ── Plan B Card (Featured) ── */}
          <div
            onClick={() => {
              setSelectedPlan("planB");
              if (simAmount < 20000) setSimAmount(25000);
            }}
            className={`cursor-pointer rounded-[14px] p-8 transition-all duration-200 flex flex-col justify-between border relative ${
              selectedPlan === "planB"
                ? "bg-white border-[#20281f] shadow-2xl ring-2 ring-[#20281f]/10"
                : "bg-white border-[#dde2d1] hover:border-[#20281f]/40 shadow-xs"
            }`}
          >
            {/* Pill */}
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] bg-[#d1f18b] text-[#20281f] border border-[#b9d975] shadow-xs">
              Executive Tier
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-[#5b4e8c] bg-[#eae6f2] px-3 py-1 rounded-full">
                  {planB.tag}
                </span>
                <span className="text-xs font-mono text-[#60695b] font-medium">{planB.duration}</span>
              </div>

              <h3 className="text-2xl font-bold text-[#20281f] mb-1 tracking-tight">{planB.name}</h3>
              <p className="text-xs text-[#60695b] mb-6">Maximum compounding yield with company house loan eligibility.</p>

              {/* Rate Box */}
              <div className="p-4 rounded-[10px] bg-[#f4f7ec] border border-[#dfe6d2] mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-[#20281f]">{planB.rateText}</span>
                  <span className="text-xs text-[#60695b] ml-1.5 font-semibold">/ Week</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#60695b]">Deposit Limits</div>
                  <div className="text-xs font-mono font-bold text-[#20281f]">$20,000 – $5,000,000</div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5 mb-6">
                {planB.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#3d453b]">
                    <div className="w-4 h-4 rounded-full bg-[#d1f18b] text-[#20281f] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      ✓
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#e4e7dc]">
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-[7px] bg-[#d1f18b] hover:bg-[#c4ee70] text-[#20281f] border border-[#b9d975] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Invest in Plan B</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── Interactive ROI Estimator (Stelsuite Frame Card) ── */}
        <div className="max-w-4xl mx-auto bg-white border border-[#dde2d1] rounded-[14px] p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#e4e7dc]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#f4f7ec] border border-[#dfe6d2] text-[#416735] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#20281f]">Yield Return Simulator</h4>
                <p className="text-xs text-[#60695b]">Simulate weekly and total returns based on your selected plan.</p>
              </div>
            </div>

            {/* Plan Switcher Pills */}
            <div className="flex items-center p-1 bg-[#f4f7ec] rounded-full border border-[#dfe6d2]">
              <button
                onClick={() => {
                  setSelectedPlan("planA");
                  setSimAmount(1000);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedPlan === "planA"
                    ? "bg-[#20281f] text-white shadow-xs"
                    : "text-[#60695b] hover:text-[#20281f]"
                }`}
              >
                Plan A (5.0%)
              </button>
              <button
                onClick={() => {
                  setSelectedPlan("planB");
                  setSimAmount(25000);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedPlan === "planB"
                    ? "bg-[#20281f] text-white shadow-xs"
                    : "text-[#60695b] hover:text-[#20281f]"
                }`}
              >
                Plan B (8.5%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6 items-center">
            {/* Amount Slider (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-bold text-[#60695b]">Investment Capital</span>
                <span className="text-xl font-mono font-bold text-[#20281f]">${fmt(simAmount)}</span>
              </div>

              <input
                type="range"
                min={activePlanData.min}
                max={Math.min(activePlanData.max, 100000)}
                step={selectedPlan === "planA" ? 500 : 1000}
                value={simAmount}
                onChange={(e) => setSimAmount(Number(e.target.value))}
                className="w-full accent-[#416735] h-2 bg-[#f0f2eb] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono text-[#7d8573]">
                <span>Min: ${fmt(activePlanData.min)}</span>
                <span>Max Range: ${fmt(Math.min(activePlanData.max, 100000))}</span>
              </div>
            </div>

            {/* Calculated Return (5 cols) */}
            <div className="md:col-span-5 bg-[#f4f7ec] border border-[#dfe6d2] rounded-[10px] p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#60695b] font-medium">Weekly Payout:</span>
                <span className="font-mono font-bold text-[#416735]">+${fmt(weeklyProfit)} / wk</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#60695b] font-medium">Total Net Profit:</span>
                <span className="font-mono font-bold text-[#20281f]">+${fmt(totalProfit)}</span>
              </div>

              <div className="pt-2 border-t border-[#dfe6d2] flex justify-between items-baseline">
                <span className="text-xs font-bold text-[#20281f]">Total Return:</span>
                <span className="text-lg font-mono font-bold text-[#20281f]">${fmt(totalNetReturn)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
