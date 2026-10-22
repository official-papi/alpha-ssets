"use client";

import { ShieldCheck, Cpu, ScrollText } from "lucide-react";

export default function CoreValueBanner() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "100% Non-Custodial",
      tagline: "Your keys, your crypto.",
      desc: "The platform never holds withdrawal permissions.",
      detail: "All capital remains locked in your sovereign smart contract vault, accessible only with your personal private keys.",
      badge: "Zero Custody Risk",
    },
    {
      icon: Cpu,
      title: "24/7 AI Risk Engine",
      tagline: "Millisecond market telemetry.",
      desc: "Constant market tracking to execute swaps before drawdowns deepen.",
      detail: "Autonomous sentiment and on-chain order book analysis to hedge volatility without manual intervention.",
      badge: "Sub-Second Action",
    },
    {
      icon: ScrollText,
      title: "Smart Escrow",
      tagline: "User-permissioned execution.",
      desc: "Automated execution governed by transparent, user-permissioned smart contracts.",
      detail: "Session keys strictly limited to asset-to-stablecoin swaps with mathematically verified zero withdrawal authority.",
      badge: "Formally Verified",
    },
  ];

  return (
    <section className="bg-[#021314] border-b border-[#093A3E] py-8 sm:py-10 relative overflow-hidden text-white">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-24 bg-[#3AAFB9]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative bg-[#041819] hover:bg-[#062123] border border-[#093A3E] hover:border-[#3AAFB9]/60 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#3AAFB9]" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3AAFB9] bg-[#093A3E]/80 border border-[#3AAFB9]/40 px-2.5 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-[#3AAFB9] transition-colors mb-1">
                    {pillar.title}
                  </h3>
                  
                  <div className="text-xs font-bold text-[#86cbd1] mb-2 font-mono">
                    {pillar.tagline}
                  </div>

                  <p className="text-xs sm:text-[13px] font-semibold text-white/90 leading-relaxed mb-2">
                    {pillar.desc}
                  </p>

                  <p className="text-xs text-[#b5dfe3]/75 leading-relaxed font-normal">
                    {pillar.detail}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#093A3E]/70 flex items-center justify-between text-[11px] font-mono text-[#86cbd1]">
                  <span>Core Pillar 0{idx + 1}</span>
                  <span className="text-[#3AAFB9] font-bold group-hover:translate-x-0.5 transition-transform">
                    On-Chain Verified ✓
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
