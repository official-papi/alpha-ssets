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
          badge="AI Trading & Escrow Protected Tiers"
          title="Transparent Investment Packages &"
          titleHighlight="Algorithmic Weekly Yields"
          subtitle="Explore our 2 official investment packages: Basic Plan (3.5% weekly) and Premium Plan (7.0% weekly). Automated company AI trade execution with multi-sig escrow custody."
          icon={TrendingUp}
          breadcrumb="Investment Plans"
          stats={[
            { label: "Weekly Yield", value: "3.5% - 7.0%" },
            { label: "Principal Back", value: "100% Escrowed" },
            { label: "Trade Execution", value: "Automated AI" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs">
              <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-slate-900">Basic Plan Simulation</span>
                  <span className="font-mono font-bold text-emerald-600">3.5% Weekly</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>$1,000 Allocation:</span>
                  <span className="font-mono font-extrabold text-[#093A3E]">+$35.00 / Week</span>
                </div>
              </div>

              <div className="p-3 bg-[#093A3E]/5 border border-[#3AAFB9]/30 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-[#001011]">Premium Plan Tier</span>
                  <span className="font-mono font-bold text-[#093A3E]">7.0% Weekly</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>$10,000 Allocation:</span>
                  <span className="font-mono font-extrabold text-emerald-600">+$700.00 / Week</span>
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
