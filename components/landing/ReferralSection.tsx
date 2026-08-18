"use client";

import { ArrowRight, Share2, Users, DollarSign } from "lucide-react";
import Link from "next/link";

const LEVELS = [
  { level: "Level 1", rate: "5%", desc: "Direct Invited Investors", bonus: "$50 per $1,000" },
  { level: "Level 2", rate: "3%", desc: "Secondary Network Referrals", bonus: "$30 per $1,000" },
  { level: "Level 3", rate: "1%", desc: "Tertiary Network Referrals", bonus: "$10 per $1,000" },
];

export default function ReferralSection() {
  return (
    <section id="referral" className="py-24 border-b border-white/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-md border border-indigo-200/80 text-indigo-700 text-xs font-extrabold uppercase tracking-wider">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Affiliate Commission Protocol</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Earn Lifetime Multi-Tier Referral Commissions
            </h2>
            
            <p className="text-slate-600 text-sm mt-4 leading-relaxed font-medium">
              Invite friends, investors, and network partners to Alpha Assets using your unique referral URL. Earn recursive instant commission whenever your downline deposits into investment packages.
            </p>

            <div className="space-y-4 pt-2">
              {[
                { title: "Instant Interest Wallet Credit", desc: "Commissions are automatically credited to your Interest Wallet upon deposit approval with zero latency." },
                { title: "No Active Capital Requirement", desc: "Earn referral commissions immediately after registration without requiring an active deposit." },
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">✓</div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/register"
                className="inline-flex items-center gap-2 minimal-btn-primary px-8 py-3.5 rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/20">
                <span>Get Your Referral Link</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right — 3D Glass Tier Cards */}
          <div className="space-y-4">
            {LEVELS.map((lvl, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-emerald-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-slate-900/5 hover:bg-white/85 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-mono font-black text-xs shadow-md shadow-indigo-600/20">
                      {lvl.level}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{lvl.desc}</h4>
                      <span className="text-xs text-emerald-600 font-bold font-mono">{lvl.bonus}</span>
                    </div>
                  </div>
                  <span className="text-3xl font-black font-mono text-indigo-600">{lvl.rate}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
