"use client";

import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, Wallet, ArrowRight, Zap, Lock, Sparkles, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react";
import { useWallet } from "@/lib/wallet/WalletContext";

interface TradeSignal {
  id: string;
  pair: string;
  action: "BUY" | "SELL" | "TAKE PROFIT";
  price: string;
  conviction: string;
  reason: string;
  timeAgo: string;
}

const INITIAL_SIGNALS: TradeSignal[] = [
  { id: "1", pair: "BTC/USDT", action: "BUY", price: "$67,820", conviction: "98.7%", reason: "AI Neural Breakout: Cross-exchange liquidity accumulation detected", timeAgo: "Just now" },
  { id: "2", pair: "ETH/USDT", action: "TAKE PROFIT", price: "$3,540", conviction: "96.2%", reason: "Peak resistance detected by volatility hedge model", timeAgo: "4m ago" },
  { id: "3", pair: "SOL/USDT", action: "BUY", price: "$182.40", conviction: "94.8%", reason: "Orderbook sentiment pivot + smart money inflow pattern", timeAgo: "12m ago" },
  { id: "4", pair: "AVAX/USDT", action: "SELL", price: "$38.60", conviction: "92.5%", reason: "Momentum exhaustion indicator flagged risk limit", timeAgo: "22m ago" },
];

export default function AiTradingEscrowSection() {
  const { isConnected, shortAddress, openModal } = useWallet();
  const [signals, setSignals] = useState<TradeSignal[]>(INITIAL_SIGNALS);
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);

  // Subtle live feed rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignalIndex((prev) => (prev + 1) % signals.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [signals.length]);

  return (
    <section id="ai-escrow" className="py-24 bg-[#001011] border-b border-[#093A3E] relative overflow-hidden text-white">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#093A3E]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#3AAFB9]/40 bg-[#093A3E]/80 text-[#3AAFB9] mb-4 shadow-sm backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-[#3AAFB9]" />
            <span>Company AI Trading & Smart Escrow Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Connect Your Wallet. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d9eef0] to-[#3AAFB9]">
              The Company Trades For You with AI.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-[#86cbd1] mt-4 font-normal leading-relaxed">
            Eliminate emotional mistakes and trading guesswork. Connect your Web3 wallet and let our institutional trading desk execute AI-optimized trades while your capital remains strictly guarded under smart-contract escrow.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Pillar 1: Web3 Wallet Connect */}
          <div className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7 text-[#3AAFB9]" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#3AAFB9] font-bold mb-2">Step 01 · Seamless Integration</div>
              <h3 className="text-xl font-black text-white mb-3">Connect Your Web3 Wallet</h3>
              <p className="text-xs sm:text-sm text-[#86cbd1] leading-relaxed">
                Connect your decentralized wallet (MetaMask, WalletConnect, Coinbase, or Trust Wallet) in one click. No complex KYC forms or third-party custody transfers.
              </p>
            </div>
            <div className="pt-6 border-t border-[#093A3E] mt-6 flex items-center justify-between">
              <span className="text-[11px] text-white font-mono">
                {isConnected ? `Connected: ${shortAddress}` : "MetaMask / Trust / WalletConnect"}
              </span>
              <button
                type="button"
                onClick={openModal}
                className="text-xs font-bold text-[#3AAFB9] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{isConnected ? "Manage" : "Connect"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pillar 2: AI Trading Intelligence */}
          <div className="bg-[#041819] border border-[#3AAFB9]/40 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative shadow-2xl ring-1 ring-[#3AAFB9]/20">
            <div className="absolute -top-3.5 right-6 bg-[#093A3E] border border-[#3AAFB9] text-[#3AAFB9] font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
              ⚡ High Conviction Engine
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#093A3E] border border-[#3AAFB9] text-[#3AAFB9] flex items-center justify-center mb-6">
                <Cpu className="w-7 h-7 text-[#3AAFB9]" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#3AAFB9] font-bold mb-2">Step 02 · Algorithmic Edge</div>
              <h3 className="text-xl font-black text-white mb-3">Company Trades For You via AI</h3>
              <p className="text-xs sm:text-sm text-[#86cbd1] leading-relaxed">
                We rely on neural deep-learning models to scan volatility across 40+ exchanges. The AI autonomously makes smarter, mathematically optimal decisions on <strong>precisely when to buy, hedge, and sell</strong> for maximum profit yield.
              </p>
            </div>
            <div className="pt-6 border-t border-[#093A3E] mt-6 flex items-center justify-between text-xs font-medium text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>98.4% Buy/Sell Precision</span>
              </span>
              <span className="font-mono text-[11px] text-[#3AAFB9]">Microsecond Execution</span>
            </div>
          </div>

          {/* Pillar 3: Institutional Escrow System */}
          <div className="bg-[#041819] border border-[#093A3E] hover:border-[#3AAFB9] rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7 text-[#3AAFB9]" />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#3AAFB9] font-bold mb-2">Step 03 · 100% Principal Safety</div>
              <h3 className="text-xl font-black text-white mb-3">Secured by Smart Escrow</h3>
              <p className="text-xs sm:text-sm text-[#86cbd1] leading-relaxed">
                Counterparty risk is completely eliminated. Your principal remains secured in a segregated multi-signature smart-contract <strong>Escrow System</strong>. The company can only execute trades; funds can never be withdrawn without your key.
              </p>
            </div>
            <div className="pt-6 border-t border-[#093A3E] mt-6 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-white">
                <ShieldCheck className="w-4 h-4 text-[#3AAFB9]" />
                <span className="text-[11px] font-bold">Cold Vault Custody</span>
              </div>
              <span className="text-[11px] font-mono text-[#86cbd1]">Zero Unsanctioned Drain</span>
            </div>
          </div>

        </div>

        {/* Live AI Decision Feed Console */}
        <div className="bg-[#041819] border border-[#093A3E] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-6 bg-[#001011] border-b border-[#093A3E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-sm font-black text-white tracking-wide">Live AI Trade Telemetry & Escrow Audits</h4>
                <p className="text-[11px] text-[#86cbd1]">Real-time execution signals generated by our automated trading neural network</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-lg bg-[#093A3E] border border-[#3AAFB9]/30 text-[#3AAFB9] font-mono text-[11px] font-bold">
                ESCROW STATUS: ACTIVE
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#093A3E]">
            {signals.map((sig, idx) => (
              <div
                key={sig.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  idx === activeSignalIndex ? "bg-[#093A3E]/30" : "hover:bg-[#001011]/40"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black font-mono tracking-wider ${
                      sig.action === "BUY"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : sig.action === "SELL"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        : "bg-[#3AAFB9]/20 text-[#3AAFB9] border border-[#3AAFB9]/40"
                    }`}
                  >
                    {sig.action}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-sm text-white font-mono">{sig.pair}</span>
                      <span className="text-xs text-slate-300 font-mono">{sig.price}</span>
                    </div>
                    <p className="text-[11px] text-[#86cbd1] mt-0.5">{sig.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs sm:self-center">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Conviction</span>
                    <span className="font-mono font-bold text-[#3AAFB9]">{sig.conviction}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                    <span className="font-mono text-slate-300">{sig.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA inside section */}
          <div className="p-6 bg-[#001011] border-t border-[#093A3E] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#86cbd1] text-center sm:text-left">
              Ready to delegate your trading? Connect your wallet or register to initialize your escrow-backed allocation.
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={openModal}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#3AAFB9] to-[#278e98] hover:from-[#5cb4be] hover:to-[#3AAFB9] text-[#001011] font-black text-xs shadow-lg shadow-[#3AAFB9]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Wallet className="w-4 h-4 text-[#001011]" />
                <span>{isConnected ? "Wallet Connected" : "Connect Trading Wallet"}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
