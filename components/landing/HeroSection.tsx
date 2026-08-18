"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, DollarSign, Users, Award, Lock, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-20 pb-28 overflow-hidden hm-hero-bg border-b border-slate-100">

      {/* Subtle background mesh */}
      <div className="absolute inset-0 hm-hero-bg pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="hm-section-label">
            <ShieldCheck className="w-3.5 h-3.5" />
            Regulated &amp; Audited Investment Platform
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl font-bold text-slate-900 leading-[1.08] tracking-tight">
            Automated AI Yield{" "}
            <span className="hm-gradient-text">Generation</span>
            <br />
            for Modern Investors
          </h1>
          <p className="mt-7 text-[17px] text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
            Invest with confidence in AI-powered structured portfolios. Earn guaranteed weekly returns with instant wallet withdrawals and multi-tier affiliate rewards.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="hm-btn hm-btn-primary px-8 py-3.5 text-[15px] rounded-xl w-full sm:w-auto"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <a
              href="#plans"
              className="hm-btn hm-btn-secondary px-8 py-3.5 text-[15px] rounded-xl w-full sm:w-auto"
            >
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
              <span>Explore Plans</span>
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: ShieldCheck, label: "256-bit SSL" },
              { icon: Zap, label: "Instant Payouts" },
              { icon: Lock, label: "Cold Storage Custody" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                <Icon className="w-3.5 h-3.5 text-indigo-500" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: DollarSign, value: "$256M+", label: "Total Assets Deposited" },
            { icon: Award,      value: "$734M+", label: "Total Payouts" },
            { icon: Users,      value: "90,000+", label: "Active Investors" },
            { icon: Lock,       value: "100%",   label: "SSL &amp; DDoS Protected" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="hm-card p-6 text-center hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tracking-tight"
                dangerouslySetInnerHTML={{ __html: value }} />
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5"
                dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
