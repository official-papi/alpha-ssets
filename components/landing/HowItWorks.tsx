"use client";

import { useEffect, useState } from "react";
import { UserPlus, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ICONS = [UserPlus, Wallet, TrendingUp];

export default function HowItWorks() {
  const [steps, setSteps] = useState([
    { step: 1, title: "Create Free Account", desc: "Fill in your registration details and complete instant email authentication to unlock your investor dashboard." },
    { step: 2, title: "Make A Deposit & Select Plan", desc: "Fund your account via crypto (USDT, BTC, ETH) or bank transfer, and activate your preferred investment package." },
    { step: 3, title: "Earn Interest & Withdraw", desc: "Receive automated daily yield credited directly to your interest wallet. Withdraw earnings anytime instantly." },
  ]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("system_settings").select("*").single();
      if (data?.meta?.how_it_works && Array.isArray(data.meta.how_it_works)) {
        setSteps(data.meta.how_it_works);
      }
    })();
  }, []);

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Simple 3-Step Process</div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How Alpha Assets Works</h2>
          <p className="text-slate-500 text-sm mt-3">Start building your passive income portfolio in 3 simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((stepItem: any, idx: number) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div key={idx} className="minimal-card p-8 flex flex-col gap-5 relative border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-black text-slate-200 font-mono select-none">0{stepItem.step || idx + 1}</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{stepItem.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{stepItem.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/register"
            className="inline-flex items-center gap-2 minimal-btn-primary px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/15">
            Start Investing Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
