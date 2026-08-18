"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_PLANS = [
  {
    id: "1", name: "Regular Package", rate: "2.5%", cycle: "Weekly for 8 Weeks",
    min: "$500", max: "$2,000", featured: false, badge: "Starter Tier",
    features: ["2.5% Weekly Return", "Principal Returned at End", "Instant Crypto Withdrawals", "Standard Support"],
  },
  {
    id: "2", name: "Silver Package", rate: "4.0%", cycle: "Weekly for 12 Weeks",
    min: "$3,000", max: "$5,000", featured: false, badge: "Growth Tier",
    features: ["4.0% Weekly Return", "Principal Returned at End", "Zero Withdrawal Fees", "Multi-Tier Referral Commission"],
  },
  {
    id: "3", name: "Gold Package", rate: "6.0%", cycle: "Weekly for 16 Weeks",
    min: "$10,000", max: "$20,000", featured: true, badge: "Most Popular",
    features: ["6.0% Weekly Return", "Principal Returned at End", "Priority Withdrawals", "Dedicated Account Manager"],
  },
  {
    id: "4", name: "VIP Package", rate: "10.0%", cycle: "Weekly for 24 Weeks",
    min: "$50,000", max: "$200,000", featured: false, badge: "High Yield",
    features: ["10.0% Weekly Return", "Principal Returned at End", "Custom Vault Storage", "VIP 24/7 Concierge Support"],
  },
  {
    id: "5", name: "Ultimate Package", rate: "12.0%", cycle: "Weekly for 36 Weeks",
    min: "$500,000", max: "$3,000,000", featured: false, badge: "Executive",
    features: ["12.0% Weekly Return", "Principal Returned at End", "Institutional Cold Custody", "Private Wealth Advisory"],
  },
  {
    id: "6", name: "Elites Package", rate: "15.5%", cycle: "Weekly for 52 Weeks",
    min: "$5,000,000", max: "$20,000,000", featured: true, badge: "Exclusive",
    features: [
      "15.5% Weekly Return",
      "🏠 Company House Loan Eligibility (Pay in Installments)",
      "Principal Returned at End",
      "Direct Private Banker & VIP Vault Access",
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

      if (data && data.length > 0) {
        const formatted = data.map((p: any) => {
          const isWeekly = Number(p.payout_interval_hours) === 168 || (p.description || "").toLowerCase().includes("week");
          const intervalText = isWeekly ? "Weekly" : "Daily";
          const cycleText = isWeekly ? `Weekly for ${p.total_payout_periods} Weeks` : `${p.total_payout_periods} Days`;
          const isElite = (p.name || "").toLowerCase().includes("elite");

          const customFeatures = [];
          customFeatures.push(`${p.roi_percentage}% ${intervalText} Return`);
          if (isElite) {
            customFeatures.push("🏠 Company House Loan Eligibility (Pay in Installments)");
          }
          customFeatures.push(p.capital_back ? "Principal Returned at End" : "Compounded Returns");
          customFeatures.push("Instant Payout Withdrawals");
          customFeatures.push(isElite || Number(p.min_amount) >= 50000 ? "VIP Personal Wealth Advisor" : "Multi-Tier Referral Commission");

          return {
            id: p.id,
            name: p.name,
            rate: `${p.roi_percentage}%`,
            cycle: cycleText,
            interval: intervalText,
            min: `$${Number(p.min_amount).toLocaleString()}`,
            max: `$${Number(p.max_amount).toLocaleString()}`,
            featured: p.badge === "Most Popular" || isElite || (p.name || "").includes("Gold"),
            badge: p.badge || (isElite ? "Exclusive" : "Active Plan"),
            features: customFeatures,
          };
        });
        setPlans(formatted);
      }
    })();
  }, []);

  return (
    <section id="plans" className="py-24 bg-[#f8fafc] border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <div className="hm-section-label">
              <Zap className="w-3.5 h-3.5" />
              Investment Opportunities
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Choose Your{" "}
            <span className="hm-gradient-text">Investment Plan</span>
          </h2>
          <p className="text-slate-500 text-[15px] mt-4 leading-relaxed">
            Select a tailored investment strategy that fits your budget and earning goals.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-200 ${
                plan.featured
                  ? "bg-indigo-600 shadow-2xl shadow-indigo-600/25 scale-[1.02] border border-indigo-500"
                  : "bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200"
              }`}
            >
              {/* Badge */}
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-indigo-700 font-bold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md border border-indigo-100">
                  ⚡ {plan.badge}
                </div>
              )}
              {!plan.featured && (
                <div className="absolute top-5 right-5">
                  <span className={`hm-badge hm-badge-brand text-[10px]`}>{plan.badge}</span>
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-6">
                <h3 className={`text-[18px] font-bold mb-4 ${plan.featured ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>

                {/* Rate */}
                <div className={`rounded-xl p-4 ${plan.featured ? "bg-white/15 border border-white/20" : "bg-slate-50 border border-slate-100"}`}>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-bold font-mono ${plan.featured ? "text-white" : "text-indigo-600"}`}>
                      {plan.rate}
                    </span>
                    <span className={`text-[13px] font-medium ${plan.featured ? "text-indigo-200" : "text-slate-400"}`}>
                      / week
                    </span>
                  </div>
                  <div className={`text-[12px] mt-1.5 font-medium ${plan.featured ? "text-indigo-200" : "text-slate-500"}`}>
                    {plan.cycle} · Capital Returned ✓
                  </div>
                </div>
              </div>

              {/* Min/Max */}
              <div className={`space-y-1.5 mb-6 text-[13px] font-mono ${plan.featured ? "text-indigo-200" : "text-slate-500"}`}>
                <div className={`flex justify-between py-1.5 border-b ${plan.featured ? "border-white/15" : "border-slate-100"}`}>
                  <span>Min. Deposit</span>
                  <span className={`font-semibold ${plan.featured ? "text-white" : "text-slate-900"}`}>{plan.min}</span>
                </div>
                <div className={`flex justify-between py-1.5 border-b ${plan.featured ? "border-white/15" : "border-slate-100"}`}>
                  <span>Max. Deposit</span>
                  <span className={`font-semibold ${plan.featured ? "text-white" : "text-slate-900"}`}>{plan.max}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.featured ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span className={`text-[13px] ${plan.featured ? "text-indigo-100" : "text-slate-600"}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/register"
                className={`w-full py-3.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.featured
                    ? "bg-white text-indigo-700 hover:bg-indigo-50"
                    : "hm-btn-primary bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <span>Invest Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
