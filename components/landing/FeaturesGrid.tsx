"use client";

import { ShieldCheck, Zap, KeyRound, Fuel, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturesGrid() {
  const features = [
    {
      icon: ShieldCheck,
      emoji: "🛡️",
      title: "Self-Custodial Safety Net",
      subtitle: "Zero Centralized Counterparty Risk",
      description:
        "Never trust a centralized exchange with your stop-losses again. All automated swaps occur inside an escrow contract controlled exclusively by your wallet credentials.",
      highlights: ["No exchange lockups", "Deterministic smart contracts", "100% self-custody key ownership"],
      badge: "Non-Custodial",
    },
    {
      icon: Zap,
      emoji: "⚡",
      title: "Algorithmic Execution",
      subtitle: "Sub-Second Sentiment & Depth Signals",
      description:
        "Avoid panic sales and missed recoveries. The AI processes on-chain indicators, volume trends, and market depth to act faster than manual trading.",
      highlights: ["Sub-second order triggers", "Momentum-based exit logic", "Automated dip absorption"],
      badge: "AI Powered",
    },
    {
      icon: KeyRound,
      emoji: "🔑",
      title: "Programmable Session Keys",
      subtitle: "Strictly Scoped Swapping Permissions",
      description:
        "Grant restricted permissions that allow the AI only to perform asset-to-stablecoin swaps within your vault—zero withdrawal rights allowed.",
      highlights: ["Zero withdrawal authority", "Revocable anytime", "Time & volume capped execution"],
      badge: "Cryptographic Guardrails",
    },
    {
      icon: Fuel,
      emoji: "⛽",
      title: "Low Slippage & Gas Optimization",
      subtitle: "Intelligent DEX Liquidity Routing",
      description:
        "Route trades dynamically across aggregated decentralized liquidity pools with intelligent MEV protection, split routing, and micro-gas batching.",
      highlights: ["DEX aggregator routing", "Front-running (MEV) shielding", "Batch-optimized gas fees"],
      badge: "Max Efficiency",
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#001011] border-b border-[#093A3E] relative overflow-hidden text-white">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#093A3E]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093A3E]/80 border border-[#3AAFB9]/40 text-xs font-semibold text-[#b5dfe3] shadow-md backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-[#3AAFB9] animate-pulse" />
            <span>Institutional Grade De-Risking</span>
            <span className="text-[#3AAFB9]/40">|</span>
            <span className="text-[#3AAFB9] font-mono">Key Features</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Designed for Absolute{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#b5dfe3] to-[#3AAFB9]">
              Capital Protection
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#86cbd1] leading-relaxed max-w-2xl mx-auto">
            Our non-custodial architecture pairs military-grade smart contract escrow with autonomous AI telemetry to protect your portfolio through every market cycle.
          </p>
        </div>

        {/* 4-Card Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-[#041819] hover:bg-[#062123] border border-[#093A3E] hover:border-[#3AAFB9]/70 rounded-2xl p-7 lg:p-8 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
                        <span>{feat.emoji}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3AAFB9] bg-[#093A3E]/60 border border-[#3AAFB9]/30 px-2.5 py-0.5 rounded-full">
                          {feat.badge}
                        </span>
                      </div>
                    </div>

                    <span className="text-2xl font-black font-mono text-[#093A3E] group-hover:text-[#3AAFB9]/40 transition-colors">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-[#3AAFB9] transition-colors mb-1.5">
                    {feat.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#86cbd1] font-mono mb-3.5">
                    {feat.subtitle}
                  </div>
                  <p className="text-sm text-[#b5dfe3]/85 leading-relaxed font-normal mb-6">
                    {feat.description}
                  </p>

                  {/* Highlights checklist */}
                  <div className="space-y-2 py-3 border-t border-[#093A3E]/70">
                    {feat.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#d2d7df]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#3AAFB9] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#093A3E]/60 flex items-center justify-between text-xs font-mono text-[#86cbd1]">
                  <span>Specification V2.4</span>
                  <span className="text-[#3AAFB9] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Security Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner CTA */}
        <div className="mt-14 bg-gradient-to-r from-[#041819] via-[#093A3E]/50 to-[#041819] border border-[#093A3E] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white mb-1">
              Ready to secure your crypto with autonomous AI risk protection?
            </h4>
            <p className="text-xs sm:text-sm text-[#86cbd1]">
              Deploy your smart contract vault in under 2 minutes. No KYC, zero withdrawal counterparty risk.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 px-7 py-3 rounded-xl bg-[#3AAFB9] hover:bg-[#5cb4be] text-[#001011] text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-[#3AAFB9]/25 cursor-pointer active:scale-95"
          >
            <span>Launch App & Connect Vault</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
