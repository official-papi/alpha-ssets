"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { Target, Cpu, ArrowRight, ShieldCheck, Zap, Building2, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-20">
        
        {/* Architectural 2-Column Hero */}
        <PageHero
          badge="Corporate Profile & Infrastructure"
          title="Pioneering Algorithmic Asset"
          titleHighlight="Compounding Protocols"
          subtitle="We build institutional-grade software infrastructure designed to automate portfolio compounding, risk management, and instant investor wallet distribution."
          icon={Building2}
          breadcrumb="About Us"
          stats={[
            { label: "Assets Deposited", value: "$256M+" },
            { label: "Ledger Audit", value: "Verified" },
            { label: "Active Investors", value: "90,000+" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-slate-900">Database Ledger Audit</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">100% Passed</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#093A3E]" />
                  <span className="font-extrabold text-slate-900">Cold Storage Custody</span>
                </div>
                <span className="font-mono font-bold text-slate-700">Multi-Sig Vault</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-extrabold text-slate-900">Automated Edge Engine</span>
                </div>
                <span className="font-mono font-bold text-[#3AAFB9]">0.00s Latency</span>
              </div>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          
          {/* Mission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#093A3E]/10 to-[#3AAFB9]/10 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-8 space-y-4 shadow-xl shadow-slate-900/5">
                <div className="w-12 h-12 rounded-xl bg-[#093A3E]/10 border border-[#093A3E]/20 text-[#093A3E] flex items-center justify-center font-bold shadow-xs">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Our Corporate Mission</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  To democratize access to high-yield compounding strategies through transparent, automated, and secure digital asset protocols. We eliminate intermediate friction to maximize daily investor returns.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3AAFB9]/15 to-[#093A3E]/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-8 space-y-4 shadow-xl shadow-slate-900/5">
                <div className="w-12 h-12 rounded-xl bg-[#3AAFB9]/15 border border-[#3AAFB9]/30 text-[#093A3E] flex items-center justify-center font-bold shadow-xs">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Automated Infrastructure</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Powered by Next.js Server Actions and Supabase PostgreSQL Row Level Security (RLS), our yield payouts are executed autonomously with microsecond precision and zero manual delay.
                </p>
              </div>
            </div>

          </div>

          {/* Call to Action Card */}
          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#093A3E]/20 to-[#3AAFB9]/20 rounded-3xl blur-md opacity-80 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-white/80 backdrop-blur-2xl border border-white/90 rounded-2xl p-10 text-center shadow-2xl space-y-4">
              <h3 className="text-2xl font-black text-slate-900">Ready to Start Compounding?</h3>
              <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                Open an account in under 2 minutes and select a high-yield compounding investment tier.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 minimal-btn-primary px-8 py-3.5 rounded-xl text-xs font-extrabold shadow-lg shadow-[#093A3E]/20"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
