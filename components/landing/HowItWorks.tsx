"use client";

import { Wallet, Sliders, ShieldCheck, ArrowRight, Sparkles, TrendingDown, TrendingUp, Check } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#001011] border-b border-[#093A3E] relative overflow-hidden text-white">
      
      {/* Ambient background glow in Dark Teal */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#093A3E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3AAFB9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#3AAFB9]/40 bg-[#093A3E]/80 text-[#3AAFB9] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Simple 3-Step Protection</span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            How It Works
          </h2>
          <p className="text-[#86cbd1] text-sm sm:text-base mt-3 font-normal max-w-xl mx-auto leading-relaxed">
            Automate downside capital protection in three user-permissioned steps without handing over private keys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Step 1 */}
          <div className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-2xl p-7 lg:p-8 flex flex-col justify-between relative shadow-lg hover:shadow-xl hover:shadow-[#3AAFB9]/10 transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-[#093A3E] group-hover:text-[#3AAFB9]/40 font-mono select-none transition-colors duration-300">
                  01
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#3AAFB9] transition-colors">
                Deposit to Your Personal Escrow Vault
              </h3>
              <p className="text-xs sm:text-sm text-[#b5dfe3] leading-relaxed font-normal mb-4">
                Connect your wallet and move funds into your custom smart-contract vault. You retain the master private key to withdraw at any time.
              </p>
            </div>

            <div className="pt-4 border-t border-[#093A3E]/60 text-xs font-mono text-[#86cbd1] flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Full Self-Custodial Control</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-2xl p-7 lg:p-8 flex flex-col justify-between relative shadow-lg hover:shadow-xl hover:shadow-[#3AAFB9]/10 transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <Sliders className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-[#093A3E] group-hover:text-[#3AAFB9]/40 font-mono select-none transition-colors duration-300">
                  02
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#3AAFB9] transition-colors">
                Set Your Protection Rules
              </h3>
              <p className="text-xs sm:text-sm text-[#b5dfe3] leading-relaxed font-normal mb-4">
                Choose your risk tolerance or grant temporary, limited session keys to our AI. Configure parameters like drop thresholds, slippage limits, and preferred stablecoins (e.g., USDC, USDT).
              </p>
            </div>

            <div className="pt-4 border-t border-[#093A3E]/60 text-xs font-mono text-[#86cbd1] flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Zero Withdrawal Rights Granted</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-2xl p-7 lg:p-8 flex flex-col justify-between relative shadow-lg hover:shadow-xl hover:shadow-[#3AAFB9]/10 transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-[#093A3E] group-hover:text-[#3AAFB9]/40 font-mono select-none transition-colors duration-300">
                  03
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#3AAFB9] transition-colors">
                Sleep Easy While AI Secures Capital
              </h3>

              {/* Sub-points for Market Dips and Upturns */}
              <div className="space-y-3 mt-4">
                <div className="p-3 rounded-xl bg-[#001011] border border-[#093A3E] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>On Market Dips:</span>
                  </div>
                  <p className="text-[11px] text-[#b5dfe3] leading-relaxed">
                    The AI detects rapid downward momentum and automatically swaps your assets into stablecoins to preserve your portfolio value.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#001011] border border-[#093A3E] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>On Market Upturns:</span>
                  </div>
                  <p className="text-[11px] text-[#b5dfe3] leading-relaxed">
                    When positive momentum stabilizes, the AI safely converts stablecoins back into your targeted assets to capture the rise.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#093A3E]/60 text-xs font-mono text-[#86cbd1] flex items-center gap-2 mt-4">
              <Check className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Automated Round-Trip Protection</span>
            </div>
          </div>

        </div>

        <div className="mt-14 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3AAFB9] to-[#278e98] hover:from-[#5cb4be] hover:to-[#3AAFB9] text-[#001011] font-bold px-8 py-3.5 rounded-xl text-xs shadow-lg shadow-[#3AAFB9]/25 hover:shadow-xl transition-all cursor-pointer active:scale-95"
          >
            <span>Launch App & Connect Vault</span>
            <ArrowRight className="w-4 h-4 text-[#001011]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
