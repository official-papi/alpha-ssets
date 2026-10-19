"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, ShieldCheck, Cpu, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_PLANS = [
  {
    id: "1",
    name: "Basic Plan",
    rate: "3.5%",
    cycle: "Weekly for 8 Weeks",
    interval: "Weekly",
    min: "$200",
    max: "$4,999",
    featured: false,
    badge: "Starter Tier",
    tagline: "Essential AI algorithmic compounding with full escrow principal security.",
    features: [
      "3.5% Automated Weekly Return",
      "Principal Returned 100% at End",
      "Automated Company AI Trade Execution",
      "Multi-Signature Escrow Protection",
      "Instant Crypto Payout Withdrawals",
      "Standard 24/7 Investor Desk Support",
    ],
  },
  {
    id: "2",
    name: "Premium Plan",
    rate: "7.0%",
    cycle: "Weekly for 16 Weeks",
    interval: "Weekly",
    min: "$5,000",
    max: "$1,000,000",
    featured: true,
    badge: "Most Popular",
    tagline: "High-frequency neural trading with dedicated escrow vault and priority yield.",
    features: [
      "7.0% Automated Weekly Return",
      "Principal Returned 100% at End",
      "Priority AI Neural Trade Routing (Faster Signals)",
      "Dedicated Segregated Institutional Escrow Vault",
      "Zero Withdrawal Fees & Instant Settlement",
      "VIP Dedicated Private Wealth Portfolio Manager",
    ],
  },
];

export default function PlanCards() {
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("investment_plans")
        .select("*")
        .eq("is_active", true)
        .order("min_amount", { ascending: true });

      const validPlans = (data || []).filter((p: any) => {
        const n = (p.name || "").toLowerCase();
        return n.includes("basic") || n.includes("premium");
      });

      if (validPlans.length > 0) {
        const formatted = validPlans.map((p: any) => {
          const isWeekly = Number(p.payout_interval_hours) === 168 || (p.description || "").toLowerCase().includes("week");
          const intervalText = isWeekly ? "Weekly" : "Daily";
          const cycleText = isWeekly ? `Weekly for ${p.total_payout_periods} Weeks` : `${p.total_payout_periods} Days`;
          const isPremium = (p.name || "").toLowerCase().includes("premium");

          const customFeatures = [];
          customFeatures.push(`${p.roi_percentage}% ${intervalText} Return`);
          customFeatures.push(p.capital_back ? "Principal Returned 100% at End" : "Compounded Returns");
          customFeatures.push(isPremium ? "Priority AI Neural Trade Routing" : "Automated Company AI Trade Execution");
          customFeatures.push(isPremium ? "Dedicated Institutional Escrow Vault" : "Multi-Signature Escrow Protection");
          customFeatures.push("Instant Payout Withdrawals");
          customFeatures.push(isPremium ? "VIP Dedicated Portfolio Manager" : "Standard 24/7 Investor Desk Support");

          return {
            id: p.id,
            name: p.name,
            rate: `${p.roi_percentage}%`,
            cycle: cycleText,
            interval: intervalText,
            min: `$${Number(p.min_amount).toLocaleString()}`,
            max: `$${Number(p.max_amount).toLocaleString()}`,
            featured: isPremium || p.badge === "Most Popular",
            badge: p.badge || (isPremium ? "Most Popular" : "Starter Tier"),
            tagline: p.description || (isPremium ? "High-frequency neural trading with dedicated escrow vault." : "Essential AI algorithmic compounding with escrow protection."),
            features: customFeatures,
          };
        });
        setPlans(formatted);
      } else {
        setPlans(DEFAULT_PLANS);
      }
    })();
  }, []);

  return (
    <section id="plans" className="py-24 border-b border-[#d4e7e9] relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#c8e2e5] bg-[#f0f8f9] text-[#093A3E] mb-3 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#3AAFB9]" />
            <span>Curated Investment Tiers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001011] tracking-tight">
            Choose Your <span className="text-[#093A3E]">Investment Plan</span>
          </h2>
          <p className="text-[#2f494c] text-sm mt-3 font-normal">
            Two streamlined packages designed for maximum returns: <strong>Basic</strong> for agile capital growth, and <strong>Premium</strong> for high-conviction institutional yield.
          </p>
        </div>

        {/* Two-Plan Comparison Grid (Side-by-Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <div
              key={plan.id || i}
              className={`relative rounded-3xl p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 ${
                plan.featured
                  ? "bg-[#001011] text-white shadow-2xl border-2 border-[#3AAFB9] ring-4 ring-[#3AAFB9]/10"
                  : "bg-white border border-[#d4e7e9] shadow-lg hover:border-[#3AAFB9]"
              }`}
            >
              {/* Badge */}
              {plan.featured ? (
                <div className="absolute -top-3.5 left-8 bg-gradient-to-r from-[#3AAFB9] to-[#278e98] text-[#001011] font-black text-xs uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{plan.badge}</span>
                </div>
              ) : (
                <div className="absolute top-6 right-6">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#f0f8f9] text-[#093A3E] border border-[#c8e2e5]">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Top: Name & Tagline */}
              <div>
                <div className="mb-4">
                  <h3 className={`text-2xl font-black ${plan.featured ? "text-white" : "text-[#001011]"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-1.5 leading-relaxed ${plan.featured ? "text-[#b5dfe3]" : "text-[#5e7e83]"}`}>
                    {plan.tagline}
                  </p>
                </div>

                {/* Rate Card */}
                <div className={`rounded-2xl p-5 mb-6 ${plan.featured ? "bg-[#041819] border border-[#093A3E]" : "bg-[#f8fcfc] border border-[#d4e7e9]"}`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${plan.featured ? "text-[#3AAFB9]" : "text-[#001011]"}`}>
                      {plan.rate}
                    </span>
                    <span className={`text-xs font-semibold ${plan.featured ? "text-[#b5dfe3]" : "text-[#5e7e83]"}`}>
                      / {plan.interval?.toLowerCase() || "week"}
                    </span>
                  </div>
                  <div className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${plan.featured ? "text-[#3AAFB9]" : "text-[#093A3E]"}`}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{plan.cycle} · 100% Principal Returned</span>
                  </div>
                </div>

                {/* Min / Max Range */}
                <div className={`space-y-2 mb-6 text-xs font-mono tabular-nums ${plan.featured ? "text-[#b5dfe3]" : "text-[#2f494c]"}`}>
                  <div className={`flex justify-between py-1.5 border-b ${plan.featured ? "border-[#093A3E]" : "border-[#d4e7e9]/70"}`}>
                    <span className="font-sans font-medium">Minimum Allocation</span>
                    <span className={`font-bold font-mono text-sm ${plan.featured ? "text-white" : "text-[#001011]"}`}>{plan.min}</span>
                  </div>
                  <div className={`flex justify-between py-1.5 border-b ${plan.featured ? "border-[#093A3E]" : "border-[#d4e7e9]/70"}`}>
                    <span className="font-sans font-medium">Maximum Allocation</span>
                    <span className={`font-bold font-mono text-sm ${plan.featured ? "text-white" : "text-[#001011]"}`}>{plan.max}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.featured ? "bg-[#093A3E] text-[#3AAFB9]" : "bg-[#f0f8f9] text-[#093A3E] border border-[#c8e2e5]"
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={`text-xs font-medium leading-relaxed ${plan.featured ? "text-[#d9eef0]" : "text-[#2f494c]"}`}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action CTA */}
              <Link
                href="/register"
                className={`w-full py-3.5 px-5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.featured
                    ? "bg-gradient-to-r from-[#3AAFB9] to-[#278e98] hover:from-[#5cb4be] hover:to-[#3AAFB9] text-[#001011] shadow-lg shadow-[#3AAFB9]/25 hover:shadow-xl active:scale-95"
                    : "bg-[#093A3E] text-white hover:bg-[#001011] shadow-md hover:shadow-lg active:scale-95"
                }`}
              >
                <span>Invest in {plan.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
