"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import PlanCards from "@/components/landing/PlanCards";
import RoiCalculator from "@/components/landing/RoiCalculator";
import { TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-16">
        {/* Architectural 2-Column Hero */}
        <PageHero
          badge="Verified Yield Strategies"
          title="Institutional Investment Plans"
          titleHighlight="Engineered for Predictable Return"
          subtitle="Explore our actively managed institutional packages with automated weekly compounding, principal protection, and multi-crypto payout options."
          icon={TrendingUp}
          breadcrumb="Investment Plans"
          stats={[
            { label: "Standard Yield", value: "5.0% - 8.5% Weekly" },
            { label: "Payout Frequency", value: "Instant / Weekly" },
            { label: "Capital Return", value: "100% at Maturity" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-slate-900">Principal Protected</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">100% Back</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#3AAFB9]" />
                  <span className="font-extrabold text-slate-900">Weekly Payout Engine</span>
                </div>
                <span className="font-mono font-bold text-[#093A3E]">Automated</span>
              </div>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-6">
          <PlanCards />
          <RoiCalculator />
        </div>
      </main>

      <Footer />
    </div>
  );
}
