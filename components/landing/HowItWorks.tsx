"use client";

import { useEffect, useState } from "react";
import { UserPlus, Wallet, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
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
    <section id="how-it-works" className="py-24 bg-[#001011] border-b border-[#093A3E] relative overflow-hidden text-white">
      
      {/* Ambient background glow in Dark Teal */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#093A3E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3AAFB9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex justify-center mb-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#3AAFB9]/40 bg-[#093A3E]/80 text-[#3AAFB9] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Simple 3-Step Process</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Alpha Assets Works
          </h2>
          <p className="text-[#86cbd1] text-sm mt-3 font-normal max-w-xl mx-auto">
            Start building your passive income portfolio in 3 straightforward, automated milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((stepItem: any, idx: number) => {
            const Icon = ICONS[idx % ICONS.length];
            return (
              <div
                key={idx}
                className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-2xl p-8 flex flex-col gap-6 relative shadow-lg hover:shadow-xl hover:shadow-[#3AAFB9]/10 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-black text-[#093A3E] group-hover:text-[#3AAFB9]/40 font-mono select-none transition-colors duration-300">
                    0{stepItem.step || idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#3AAFB9] transition-colors">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-[#b5dfe3] leading-relaxed font-normal">
                    {stepItem.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3AAFB9] to-[#278e98] hover:from-[#5cb4be] hover:to-[#3AAFB9] text-[#001011] font-bold px-8 py-3.5 rounded-xl text-xs shadow-lg shadow-[#3AAFB9]/25 hover:shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <span>Start Investing Now</span>
            <ArrowRight className="w-4 h-4 text-[#001011]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
