"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import PlanCards from "@/components/landing/PlanCards";
import RoiCalculator from "@/components/landing/RoiCalculator";
import { TrendingUp, Calculator, Sparkles } from "lucide-react";

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-16">
        
        {/* Architectural 2-Column Hero */}
        <PageHero
          badge="High-Yield Investment Tiers"
          title="Transparent Investment Packages &"
          titleHighlight="Guaranteed Weekly Returns"
          subtitle="Explore our 6 structured investment packages. Select a plan tailored to your budget and project your weekly ROI and total principal refunds."
          icon={TrendingUp}
          breadcrumb="Investment Plans"
          stats={[
            { label: "Weekly Yield", value: "2.5% - 15.5%" },
            { label: "Principal Back", value: "Guaranteed" },
            { label: "Withdrawal Fee", value: "0%" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs">
              <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-slate-900">Regular Package Simulation</span>
                  <span className="font-mono font-bold text-emerald-600">2.5% Weekly</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>$1,000 Investment:</span>
                  <span className="font-mono font-extrabold text-[#093A3E]">+$25.00 / Week</span>
                </div>
              </div>

              <div className="p-3 bg-[#093A3E]/5 border border-[#3AAFB9]/30 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-[#001011]">Gold Package Tier</span>
                  <span className="font-mono font-bold text-[#093A3E]">6.0% Weekly</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>$10,000 Investment:</span>
                  <span className="font-mono font-extrabold text-emerald-600">+$600.00 / Week</span>
                </div>
              </div>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlanCards />
          <RoiCalculator />
        </div>
      </main>

      <Footer />
    </div>
  );
}
