"use client";

import React, { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import AiTradingEscrowSection from "@/components/landing/AiTradingEscrowSection";
import PlanCards from "@/components/landing/PlanCards";
import {
  Cpu,
  ShieldCheck,
  Wallet,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Power,
  RefreshCw,
} from "lucide-react";
import { useWallet } from "@/lib/wallet/WalletContext";
import Link from "next/link";

export default function PublicWalletConnectPage() {
  const {
    account,
    shortAddress,
    isConnected,
    isConnecting,
    networkName,
    balanceUsdt,
    isTradingDelegated,
    escrowContractAddress,
    connectWallet,
    disconnectWallet,
    toggleTradingDelegation,
    openModal,
  } = useWallet();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-16">
        <PageHero
          badge="Web3 Automated AI Trading & Escrow"
          title="Connect Your Wallet &"
          titleHighlight="Let Company AI Trade For You"
          subtitle="Link your decentralized Web3 wallet. Our institutional AI algorithms automatically execute high-conviction trades while your principal remains 100% protected under smart-contract escrow."
          icon={Cpu}
          breadcrumb="Wallet Connect"
          stats={[
            { label: "Connection", value: "Instant Web3" },
            { label: "Custody", value: "Smart Escrow" },
            { label: "AI Execution", value: "Automated" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs">
              <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-extrabold text-slate-900">Wallet Status</span>
                  <span className={`font-mono font-bold ${isConnected ? "text-emerald-600" : "text-amber-600"}`}>
                    {isConnected ? "Connected" : "Standby"}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                  <span>Address:</span>
                  <span className="font-extrabold text-[#093A3E]">{isConnected ? shortAddress : "Not Linked"}</span>
                </div>
              </div>

              <div className="p-3 bg-[#093A3E]/5 border border-[#3AAFB9]/30 rounded-xl flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#001011]">Escrow Multi-Sig</span>
                <span className="text-[11px] font-mono font-bold text-emerald-600">100% Protected</span>
              </div>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-14">
          
          {/* Interactive Web3 Connection Console Card */}
          <div className="bg-[#001011] border border-[#093A3E] rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093A3E]/70 border border-[#3AAFB9]/40 text-[#3AAFB9] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3AAFB9]" />
                  <span>Audited Smart Escrow Custody</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isConnected ? "Wallet Connected to AI Trading Desk" : "Link Your Web3 Wallet in 1 Click"}
                </h2>
                <p className="text-xs sm:text-sm text-[#86cbd1] leading-relaxed">
                  Alpha@ssets executes trades on behalf of connected investors using state-of-the-art neural algorithms. Your funds stay secured in an escrow contract, with automated buy and sell decisions powered by predictive order book analysis.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#041819] border border-[#093A3E] flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Multi-Sig Escrow:</strong> 100% capital protection</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#041819] border border-[#093A3E] flex items-center gap-2.5">
                    <Cpu className="w-4 h-4 text-[#3AAFB9] shrink-0" />
                    <span><strong>Neural AI:</strong> Smarter buy and sell timing</span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="lg:col-span-5 bg-[#041819] border border-[#093A3E] rounded-2xl p-6 space-y-5">
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Wallet</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-[#093A3E] px-2 py-0.5 rounded-full border border-[#3AAFB9]/30">
                        {networkName}
                      </span>
                    </div>

                    <div className="bg-[#001011] p-3 rounded-xl border border-[#093A3E] flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold truncate max-w-[200px]">{account}</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy Address"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Web3 Balance:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">${balanceUsdt.toLocaleString()} USDT</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        href="/dashboard/wallet-connect"
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#3AAFB9] to-[#278e98] text-[#001011] text-xs font-black flex items-center justify-center gap-1.5 shadow-md text-center"
                      >
                        <span>Trade Console</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={disconnectWallet}
                        className="py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-black text-white">Choose Your Wallet</h3>
                      <p className="text-[11px] text-[#86cbd1]">Connect in 1 click or scan with your mobile device.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => connectWallet("metamask")}
                        disabled={isConnecting}
                        className="p-3 rounded-xl bg-[#001011] hover:bg-[#093A3E]/60 border border-[#093A3E] hover:border-[#3AAFB9] text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-xs text-white">🦊 MetaMask</div>
                        <div className="text-[10px] text-slate-400">Extension / App</div>
                      </button>
                      <button
                        type="button"
                        onClick={openModal}
                        className="p-3 rounded-xl bg-[#001011] hover:bg-[#093A3E]/60 border border-[#093A3E] hover:border-[#3AAFB9] text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-xs text-white">⚡ WalletConnect</div>
                        <div className="text-[10px] text-slate-400">Scan QR Code</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => connectWallet("coinbase")}
                        className="p-3 rounded-xl bg-[#001011] hover:bg-[#093A3E]/60 border border-[#093A3E] hover:border-[#3AAFB9] text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-xs text-white">🔵 Coinbase</div>
                        <div className="text-[10px] text-slate-400">Self-custody</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => connectWallet("trust")}
                        className="p-3 rounded-xl bg-[#001011] hover:bg-[#093A3E]/60 border border-[#093A3E] hover:border-[#3AAFB9] text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-xs text-white">🛡️ Trust Wallet</div>
                        <div className="text-[10px] text-slate-400">Multi-Chain</div>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={openModal}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3AAFB9] to-[#278e98] text-[#001011] font-black text-xs shadow-md transition-all cursor-pointer hover:brightness-110 active:scale-98"
                    >
                      Open Full Connect Modal
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <AiTradingEscrowSection />
          <PlanCards />
        </div>
      </main>

      <Footer />
    </div>
  );
}
