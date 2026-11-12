"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ShieldCheck, ArrowRight, Wallet, Coins, Lock, ArrowUpRight } from "lucide-react";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";

export default function AtfcDepositSection() {
  const [copied, setCopied] = useState(false);
  const atfcAddress = "0x892aF75dE163B8d6263B2dD6C9eA75d5032F5e71";

  const handleCopy = () => {
    navigator.clipboard.writeText(atfcAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="atfc-deposit" className="py-24 border-t border-[#e4e7dc] bg-[#fafaf5] text-[#20281f]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase text-[#20281f] mb-3">
            <span className="text-[#86a951] text-sm">✳</span>
            <span>Native Currency · 1:1 USD Sovereign Peg</span>
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] leading-[1.06]">
            American Trust Fund (ATFC) Deposit
          </h2>
          <p className="text-base sm:text-lg text-[#60695b] mt-4 leading-relaxed font-normal">
            Deposit directly into our native reserve asset. Pegged 1:1 with USD, ATFC enables zero-fee liquidity, seamless plan funding, and non-custodial smart escrow storage.
          </p>
        </div>

        {/* Stelsuite Frame Card */}
        <div className="bg-white border border-[#dde2d1] rounded-[14px] overflow-hidden shadow-sm">
          
          {/* Frame Titlebar */}
          <div className="bg-[#f4f7ec] border-b border-[#dde2d1] px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd4be]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd4be]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#cbd4be]" />
              <span className="text-[11px] font-mono text-[#60695b] ml-2">escrow.atfc-trust.eth</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#416735]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#416735] animate-pulse" />
              On-Chain Verified
            </span>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Asset Info & Features (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[12px] bg-[#f4f7ec] border border-[#dfe6d2] flex items-center justify-center shrink-0">
                    <CryptoCoinIcon symbol="ATFC" className="w-9 h-9" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-[#20281f]">American Trust Fund</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#e3f2c9] text-[#416735] border border-[#cbe59d]">
                        ATFC
                      </span>
                    </div>
                    <div className="text-xs text-[#60695b] mt-0.5 font-medium">
                      Network: <span className="font-mono text-[#20281f]">Sovereign Trust Escrow · Non-Custodial</span>
                    </div>
                  </div>
                </div>

                {/* Price & Peg Highlights */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[10px] bg-[#f8faf2] border border-[#e4e7dc]">
                    <div className="text-[10px] uppercase font-bold text-[#60695b]">Asset Peg</div>
                    <div className="text-lg font-mono font-bold text-[#20281f] mt-0.5">$1.00 USD</div>
                    <div className="text-[10px] text-[#416735] font-semibold">1:1 Backed</div>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-[#f8faf2] border border-[#e4e7dc]">
                    <div className="text-[10px] uppercase font-bold text-[#60695b]">Settlement Fee</div>
                    <div className="text-lg font-mono font-bold text-[#20281f] mt-0.5">0.00%</div>
                    <div className="text-[10px] text-[#416735] font-semibold">Zero Gas Fee</div>
                  </div>

                  <div className="p-3.5 rounded-[10px] bg-[#f8faf2] border border-[#e4e7dc]">
                    <div className="text-[10px] uppercase font-bold text-[#60695b]">Execution</div>
                    <div className="text-lg font-mono font-bold text-[#20281f] mt-0.5">Instant</div>
                    <div className="text-[10px] text-[#416735] font-semibold">Sub-Second Sync</div>
                  </div>
                </div>

                {/* Security Checklist */}
                <div className="space-y-2.5">
                  {[
                    "Direct smart contract funding without third-party delay",
                    "Automated 1-click deployment into Plan A (5.0%) and Plan B (8.5%)",
                    "Guaranteed 100% redemption back to USDT, BTC, or XRP on demand",
                    "Non-custodial smart escrow with revocable session permissions",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#3d453b]">
                      <div className="w-4 h-4 rounded-full bg-[#e3f2c9] text-[#416735] flex items-center justify-center shrink-0 font-bold text-[10px]">
                        ✓
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Launch Custody & Deposit ATFC</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/plans"
                    className="px-5 py-3 rounded-[7px] border border-[#20281f30] hover:bg-[#eaece4] text-[#20281f] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View Plan Returns</span>
                  </Link>
                </div>

              </div>

              {/* Right Column: Address Verification Box (5 cols) */}
              <div className="lg:col-span-5 bg-[#fafaf5] border border-[#dde2d1] rounded-[12px] p-6 space-y-4">
                
                <div className="flex items-center justify-between border-b border-[#e4e7dc] pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#416735]" />
                    <span className="text-xs font-mono font-bold text-[#20281f] uppercase tracking-wider">
                      Official Escrow Vault
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[#416735]">
                    Active
                  </span>
                </div>

                {/* Address Box */}
                <div>
                  <label className="block text-[11px] font-mono uppercase font-bold text-[#60695b] mb-1.5">
                    ATFC Smart Contract Address
                  </label>
                  <div className="bg-white border border-[#dde2d1] rounded-[8px] p-3 font-mono text-xs text-[#20281f] break-all flex items-center justify-between gap-2 shadow-2xs">
                    <span className="select-all font-semibold">{atfcAddress}</span>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-[6px] bg-[#20281f] hover:bg-[#343e32] text-white transition-colors shrink-0 cursor-pointer shadow-2xs"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#d1f18b]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-[11px] text-[#416735] font-mono mt-1.5 font-bold">✓ Contract address copied to clipboard!</p>
                  )}
                </div>

                <div className="p-3.5 rounded-[8px] bg-white border border-[#dde2d1] text-xs text-[#60695b] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#20281f]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#416735]" />
                    <span>Double-Entry Escrow Verification</span>
                  </div>
                  <p className="text-[11px] text-[#60695b] leading-relaxed">
                    Incoming ATFC deposits are automatically credited to your investor dashboard balance within seconds of on-chain confirmation.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
