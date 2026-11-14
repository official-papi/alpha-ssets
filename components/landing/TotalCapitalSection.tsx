"use client";

import { ShieldCheck, TrendingUp, Users, CheckCircle2, Zap } from "lucide-react";

export default function TotalCapitalSection() {
  const metrics = [
    {
      label: "Total Investment Capital",
      value: "$256,480,000+",
      sub: "Active capital secured in smart escrow",
      icon: TrendingUp,
    },
    {
      label: "Active Investor Vaults",
      value: "124,500+",
      sub: "Self-custodial wallets connected",
      icon: Users,
    },
    {
      label: "Total Payouts Disbursed",
      value: "$48,250,000+",
      sub: "100% automated weekly & daily withdrawals",
      icon: CheckCircle2,
    },
    {
      label: "AI Engine Uptime",
      value: "99.98%",
      sub: "Continuous telemetry & crash protection",
      icon: Zap,
    },
  ];

  return (
    <section id="capital" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Stelsuite Dark Band Container */}
        <div className="rounded-[18px] bg-[#20281f] text-white p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-2xl mb-12">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#d1f18b] mb-3">
              <span>✳</span>
              <span>Verifiable Protocol Metrics</span>
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-white leading-[1.06]">
              Institutional scale, proven on-chain execution.
            </h2>
            <p className="text-sm sm:text-base text-white/75 mt-3 leading-relaxed font-normal">
              Real-time telemetry aggregated across all deployed smart contracts, AI cryptocurrency management strategies, and connected investor vaults.
            </p>
          </div>

          {/* 4-Card Grid (Stelsuite dark cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="rounded-[12px] border border-white/10 bg-white/5 p-6 flex flex-col justify-between transition-all duration-200 hover:border-white/25 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-[0.12em] text-[#d1f18b]">
                        {m.label}
                      </span>
                      <Icon className="w-4 h-4 text-[#d1f18b]" />
                    </div>

                    <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                      {m.value}
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-white/10 text-[11px] text-white/60 font-normal">
                    {m.sub}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
