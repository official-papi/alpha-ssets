"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu, ArrowUpRight, ShieldCheck, Zap, TrendingUp, Sliders,
  RefreshCw, CheckCircle2, Lock, Sparkles, BarChart3, Layers
} from "lucide-react";

export default function AiCryptoManagementSection() {
  const [activeStrategy, setActiveStrategy] = useState<"balanced" | "conservative" | "alpha">("balanced");
  const [allocationAmount, setAllocationAmount] = useState<number>(5000);

  const strategies = [
    {
      id: "conservative" as const,
      tag: "Shield Mode · Conservative",
      name: "Capital Preservation AI",
      rateText: "14.5% APY",
      rateAnnual: 14.5,
      frequency: "Daily Compound",
      drawdownRisk: "< 0.5%",
      description: "Optimized for minimal volatility with continuous stablecoin hedging, ATFC sovereign trust anchoring, and risk-free automated arbitrage.",
      assets: [
        { name: "ATFC (Sovereign Escrow)", share: 50, color: "#86a951" },
        { name: "USDT / USDC", share: 30, color: "#20281f" },
        { name: "Bitcoin (BTC)", share: 20, color: "#d1f18b" },
      ],
      features: [
        "Instant zero-delay conversion to stable collateral on market dips",
        "Double-entry cryptographic ledger verification on every rebalance",
        "Guaranteed 100% principal protection with zero liquidation risk",
      ],
    },
    {
      id: "balanced" as const,
      tag: "Recommended · Balanced",
      name: "Multi-Asset Alpha AI",
      rateText: "32.8% APY",
      rateAnnual: 32.8,
      frequency: "Sub-Second Adaptive",
      drawdownRisk: "Dynamic Crash Shield",
      featured: true,
      description: "Autonomous neural network rebalancing across the top digital assets. Captures high-momentum market swings while actively hedging downside tail-risk.",
      assets: [
        { name: "Bitcoin (BTC)", share: 30, color: "#20281f" },
        { name: "Ethereum (ETH)", share: 25, color: "#5b4e8c" },
        { name: "American Trust (ATFC)", share: 20, color: "#86a951" },
        { name: "Solana (SOL)", share: 15, color: "#d1f18b" },
        { name: "Ripple (XRP)", share: 10, color: "#416735" },
      ],
      features: [
        "Sub-second order-book telemetry across tier-1 liquidity venues",
        "Automated dip buying and profit sweep into secure cold vaults",
        "Company house loan credit facility eligibility for active allocators",
      ],
    },
    {
      id: "alpha" as const,
      tag: "High Velocity · Momentum",
      name: "Dynamic Yield Optimizer AI",
      rateText: "56.4% APY",
      rateAnnual: 56.4,
      frequency: "Block-by-Block Execution",
      drawdownRisk: "Algorithmic Stop-Matrix",
      description: "High-frequency cross-chain arbitrage, DEX liquidity routing, and automated yield harvesting for experienced crypto capital allocators.",
      assets: [
        { name: "Solana (SOL)", share: 35, color: "#d1f18b" },
        { name: "Ethereum (ETH)", share: 30, color: "#5b4e8c" },
        { name: "Bitcoin (BTC)", share: 20, color: "#20281f" },
        { name: "ATFC Escrow", share: 15, color: "#86a951" },
      ],
      features: [
        "Cross-chain flash arbitrage execution with sub-cent gas overhead",
        "Autonomous MEV protection and anti-sandwich execution guards",
        "Direct API webhook notifications and customizable risk limits",
      ],
    },
  ];

  const currentStrategy = strategies.find((s) => s.id === activeStrategy) || strategies[1];
  const estimatedMonthlyYield = (allocationAmount * (currentStrategy.rateAnnual / 100)) / 12;
  const estimatedYearlyYield = allocationAmount * (currentStrategy.rateAnnual / 100);
  const totalValuation1Year = allocationAmount + estimatedYearlyYield;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section id="ai-management" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f] mb-3">
            <span className="text-[#86a951] text-sm">✳</span>
            <span>Autonomous Wealth Infrastructure</span>
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] leading-[1.06]">
            AI Cryptocurrency Management System.
          </h2>
          <p className="text-base sm:text-lg text-[#60695b] mt-4 leading-relaxed font-normal">
            Eliminate emotional trading, human error, and manual guesswork. Our autonomous neural protocol executes multi-asset rebalancing, crash protection, and optimal yield harvesting around the clock.
          </p>
        </div>

        {/* Strategy Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-[10px] bg-[#e4e7dc]/50 border border-[#e4e7dc] w-fit">
          {strategies.map((strat) => (
            <button
              key={strat.id}
              onClick={() => setActiveStrategy(strat.id)}
              className={`px-4 py-2 rounded-[7px] text-xs font-semibold transition-all cursor-pointer ${
                activeStrategy === strat.id
                  ? "bg-[#20281f] text-white shadow-xs"
                  : "text-[#60695b] hover:text-[#20281f] hover:bg-white/60"
              }`}
            >
              {strat.name}
            </button>
          ))}
        </div>

        {/* Main Strategy Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch mb-12">
          
          {/* LEFT: Strategy Specs & Asset Breakdown */}
          <div className="bg-white border border-[#dde2d1] rounded-[14px] p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-[#416735] bg-[#e3f2c9] px-3 py-1 rounded-full">
                  {currentStrategy.tag}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#60695b]">
                  <span className="w-2 h-2 rounded-full bg-[#86a951] animate-pulse" />
                  Telemetry: {currentStrategy.frequency}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[#20281f] tracking-tight mb-2">
                {currentStrategy.name}
              </h3>
              <p className="text-sm text-[#60695b] leading-relaxed mb-6">
                {currentStrategy.description}
              </p>

              {/* Asset Allocation Weight Bar */}
              <div className="space-y-3 mb-6 p-4 rounded-[10px] bg-[#fafaf5] border border-[#e4e7dc]">
                <div className="flex items-center justify-between text-xs font-bold text-[#20281f]">
                  <span>AI Portfolio Allocation Weight</span>
                  <span className="font-mono text-[#416735]">100% Non-Custodial</span>
                </div>

                {/* Progress bar slices */}
                <div className="h-3 rounded-full overflow-hidden flex bg-[#e4e7dc]">
                  {currentStrategy.assets.map((asset, i) => (
                    <div
                      key={i}
                      style={{ width: `${asset.share}%`, backgroundColor: asset.color }}
                      title={`${asset.name}: ${asset.share}%`}
                      className="h-full border-r border-white/30 last:border-0 transition-all duration-300"
                    />
                  ))}
                </div>

                {/* Asset legends */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#60695b]">
                  {currentStrategy.assets.map((asset, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span className="font-medium text-[#20281f]">{asset.name}:</span>
                      <span className="font-mono font-bold text-[#60695b]">{asset.share}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Features list */}
              <ul className="space-y-2.5 text-xs text-[#20281f]">
                {currentStrategy.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-[#86a951] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#e4e7dc] flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-mono text-[#7d8573] block">Max Historical Drawdown</span>
                <span className="text-sm font-bold text-[#20281f] font-mono">{currentStrategy.drawdownRisk}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-mono text-[#7d8573] block">Target AI Net Rate</span>
                <span className="text-xl font-black font-mono text-[#416735]">{currentStrategy.rateText}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive AI Allocation Calculator */}
          <div className="bg-[#20281f] text-white rounded-[14px] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle glow ambient */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#d1f18b]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#d1f18b]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#d1f18b]">
                    Live AI Yield Simulator
                  </span>
                </div>
                <span className="text-xs text-[#a4aca0] font-mono">100% Real-Time</span>
              </div>

              {/* Capital input / slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="ai-capital-slider" className="text-xs font-bold text-[#d8ded4] uppercase tracking-wider">
                    Managed Capital
                  </label>
                  <span className="text-xl font-bold font-mono text-white">
                    ${allocationAmount.toLocaleString()} <span className="text-xs font-normal text-[#a4aca0]">USD</span>
                  </span>
                </div>

                <input
                  id="ai-capital-slider"
                  type="range"
                  min={500}
                  max={100000}
                  step={500}
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#d1f18b]"
                />

                <div className="flex justify-between text-[11px] font-mono text-[#a4aca0] mt-1.5">
                  <span>$500 Min</span>
                  <span>$50,000</span>
                  <span>$100,000+ VIP</span>
                </div>
              </div>

              {/* Return Metrics Cards */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-mono text-[#a4aca0] block">Estimated Monthly Yield</span>
                    <span className="text-xs text-[#d8ded4]">Compounded Automatically</span>
                  </div>
                  <span className="text-xl font-black font-mono text-[#d1f18b]">
                    +${fmt(estimatedMonthlyYield)}
                  </span>
                </div>

                <div className="p-3.5 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase font-mono text-[#a4aca0] block">12-Month Projected Growth</span>
                    <span className="text-xs text-[#d8ded4]">Principal + AI Surplus</span>
                  </div>
                  <span className="text-xl font-black font-mono text-white">
                    ${fmt(totalValuation1Year)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Activation CTA */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
              <Link
                href="/dashboard"
                className="w-full min-h-[46px] rounded-[7px] bg-[#d1f18b] hover:bg-[#c4ee70] text-[#20281f] text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0.5 no-underline"
              >
                <span>Deploy to AI Management</span>
                <ArrowUpRight className="w-4 h-4 text-[#20281f]" />
              </Link>
              <p className="text-[11px] text-center text-[#a4aca0] mt-2.5">
                Non-custodial custody · Zero lockup penalty on principal
              </p>
            </div>

          </div>

        </div>

        {/* 3 Core System Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-[10px] bg-white border border-[#e4e7dc] shadow-2xs">
            <div className="w-9 h-9 rounded-[8px] bg-[#f4f7ec] border border-[#dfe6d2] flex items-center justify-center text-[#416735] mb-4">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#20281f] text-base mb-1">Autonomous Rebalancing</h4>
            <p className="text-xs text-[#60695b] leading-relaxed">
              When market conditions fluctuate, the AI re-weights portfolio assets in sub-second intervals to lock in gains and prevent capital depreciation.
            </p>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[#e4e7dc] shadow-2xs">
            <div className="w-9 h-9 rounded-[8px] bg-[#f4f7ec] border border-[#dfe6d2] flex items-center justify-center text-[#416735] mb-4">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#20281f] text-base mb-1">24/7 Crash Shield</h4>
            <p className="text-xs text-[#60695b] leading-relaxed">
              Order-book anomalies trigger instantaneous conversion into sovereign ATFC and dollar-pegged stablecoins before market dips cascade.
            </p>
          </div>

          <div className="p-6 rounded-[10px] bg-white border border-[#e4e7dc] shadow-2xs">
            <div className="w-9 h-9 rounded-[8px] bg-[#f4f7ec] border border-[#dfe6d2] flex items-center justify-center text-[#416735] mb-4">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#20281f] text-base mb-1">Non-Custodial Security</h4>
            <p className="text-xs text-[#60695b] leading-relaxed">
              Assets reside in cryptographic smart contracts. The AI engine holds execution authorization only—withdrawal keys remain solely with the investor.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

