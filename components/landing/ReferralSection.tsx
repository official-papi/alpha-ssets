"use client";

import { ArrowUpRight, Share2, Users, DollarSign, Check, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ReferralTier {
  level: string;
  tag: string;
  rate: string;
  title: string;
  subtitle: string;
  example: string;
  bg: string;
  accent: string;
  borderColor: string;
}

const LEVELS: ReferralTier[] = [
  {
    level: "01",
    tag: "Level 1 · Direct",
    rate: "5%",
    title: "Direct Invited Investors",
    subtitle: "Immediate 1st-degree referrals registering through your personal link.",
    example: "Earn $500 on $10,000 deposit volume",
    bg: "#e3f2c9",
    accent: "#416735",
    borderColor: "#cbe59d",
  },
  {
    level: "02",
    tag: "Level 2 · Secondary",
    rate: "3%",
    title: "Secondary Downline",
    subtitle: "2nd-degree investors invited by your direct network members.",
    example: "Earn $300 on $10,000 deposit volume",
    bg: "#eae6f2",
    accent: "#5b4e8c",
    borderColor: "#d8d0e7",
  },
  {
    level: "03",
    tag: "Level 3 · Extended",
    rate: "1%",
    title: "Tertiary Network",
    subtitle: "3rd-degree extended downline volume generating recursive rewards.",
    example: "Earn $100 on $10,000 deposit volume",
    bg: "#efeee7",
    accent: "#8a5a12",
    borderColor: "#e0ded3",
  },
];

export default function ReferralSection() {
  return (
    <section id="referral" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f] mb-3">
            <span className="text-[#86a951] text-sm">✳</span>
            <span>Affiliate Rewards · 3 Concentric Tiers</span>
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] leading-[1.06]">
            Earn lifetime multi-tier referral commissions.
          </h2>
          <p className="text-base sm:text-lg text-[#60695b] mt-4 leading-relaxed font-normal">
            Invite partners, traders, and community members. Receive instant automated commission payouts whenever your network deploys capital.
          </p>
        </div>

        {/* 3 Stelsuite Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch mb-10">
          {LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              style={{ backgroundColor: lvl.bg, borderColor: lvl.borderColor }}
              className="flex flex-col justify-between rounded-[14px] border p-7 text-[#20281f] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] px-2.5 py-0.5 rounded-full bg-white/80 border border-white"
                    style={{ color: lvl.accent }}
                  >
                    {lvl.tag}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#60695b]">
                    {lvl.level}
                  </span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-black/5 mb-4 flex items-baseline justify-between shadow-2xs">
                  <span className="text-4xl font-bold font-mono text-[#20281f]">{lvl.rate}</span>
                  <span className="text-xs text-[#60695b] font-mono font-semibold">Commission</span>
                </div>

                <h3 className="text-xl font-bold text-[#20281f] mb-1.5 tracking-tight">{lvl.title}</h3>
                <p className="text-xs sm:text-[13px] text-[#60695b] leading-relaxed mb-4 font-normal">{lvl.subtitle}</p>
              </div>

              <div className="pt-3 border-t border-black/5 text-xs font-mono font-semibold text-[#20281f] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" style={{ color: lvl.accent }} />
                <span>{lvl.example}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="bg-white border border-[#dde2d1] rounded-[14px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-[#20281f] flex items-center justify-center sm:justify-start gap-2">
              <span>Ready to start earning referral rewards?</span>
            </h4>
            <p className="text-xs sm:text-sm text-[#60695b]">
              Zero active capital deposit required. Generate your unique link inside the dashboard immediately.
            </p>
          </div>

          <Link
            href="/dashboard/referral"
            className="px-6 py-3 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
          >
            <span>Get Referral Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
