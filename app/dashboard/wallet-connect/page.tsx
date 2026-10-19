"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useWallet } from "@/lib/wallet/WalletContext";
import {
  Wallet,
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Power,
  ExternalLink,
  Zap,
  Globe,
  Radio,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface DecisionItem {
  id: string;
  pair: string;
  action: "BUY" | "SELL" | "TAKE PROFIT";
  price: string;
  profitEstimate: string;
  conviction: string;
  rationale: string;
  timestamp: string;
}

const AI_LOGS: DecisionItem[] = [
  {
    id: "1",
    pair: "BTC/USDT",
    action: "BUY",
    price: "$68,140.00",
    profitEstimate: "+4.8%",
    conviction: "98.7%",
    rationale: "Multi-exchange orderbook imbalance detected: Institutional volume accumulated in deep liquidity bid cluster.",
    timestamp: "2 mins ago",
  },
  {
    id: "2",
    pair: "ETH/USDT",
    action: "TAKE PROFIT",
    price: "$3,565.20",
    profitEstimate: "+6.2%",
    conviction: "96.4%",
    rationale: "Neural resistance algorithm flagged momentum exhaustion at upper Fibonacci band. Automated profit lock executed.",
    timestamp: "18 mins ago",
  },
  {
    id: "3",
    pair: "SOL/USDT",
    action: "BUY",
    price: "$184.20",
    profitEstimate: "+5.1%",
    conviction: "95.1%",
    rationale: "Cross-chain derivative funding rate turned negative while spot volume spiked. High-probability bounce trade triggered.",
    timestamp: "45 mins ago",
  },
  {
    id: "4",
    pair: "BNB/USDT",
    action: "SELL",
    price: "$592.80",
    profitEstimate: "+3.4%",
    conviction: "93.8%",
    rationale: "Stop-loss trail triggered to protect accumulated yields during localized volatility spike.",
    timestamp: "2 hours ago",
  },
];

const NETWORKS = [
  { id: "eth", name: "Ethereum Mainnet", icon: "💎" },
  { id: "bnb", name: "BNB Smart Chain",  icon: "⚡" },
  { id: "arb", name: "Arbitrum One",     icon: "🚀" },
  { id: "poly", name: "Polygon PoS",     icon: "🟣" },
];

export default function WalletConnectPage() {
  const {
    account,
    shortAddress,
    isConnected,
    isConnecting,
    walletProvider,
    balanceUsdt,
    balanceEth,
    networkName,
    isTradingDelegated,
    escrowLocked,
    escrowContractAddress,
    allocations,
    connectWallet,
    disconnectWallet,
    toggleTradingDelegation,
    switchNetwork,
    depositFromWallet,
    openModal,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"Basic Plan" | "Premium Plan">("Basic Plan");
  const [allocationAmount, setAllocationAmount] = useState<string>("500");
  const [allocating, setAllocating] = useState(false);
  const [txMessage, setTxMessage] = useState<{ text: string; type: "success" | "error"; txHash?: string } | null>(null);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      openModal();
      return;
    }

    const amt = parseFloat(allocationAmount);
    if (isNaN(amt) || amt <= 0) {
      setTxMessage({ text: "Please enter a valid allocation amount.", type: "error" });
      return;
    }
    if (selectedPlan === "Basic Plan" && (amt < 200 || amt > 4999)) {
      setTxMessage({ text: "Basic Plan allocation must be between $200 and $4,999.", type: "error" });
      return;
    }
    if (selectedPlan === "Premium Plan" && amt < 5000) {
      setTxMessage({ text: "Premium Plan allocation minimum is $5,000.", type: "error" });
      return;
    }
    if (amt > balanceUsdt) {
      setTxMessage({ text: `Insufficient USDT balance. Current available: $${balanceUsdt.toLocaleString()} USDT`, type: "error" });
      return;
    }

    setAllocating(true);
    setTxMessage(null);
    const result = await depositFromWallet(amt, selectedPlan);
    setAllocating(false);

    if (result.success) {
      setTxMessage({ text: result.message, type: "success", txHash: result.txHash });
    } else {
      setTxMessage({ text: result.message, type: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Banner */}
        <div className="bg-[#001011] border border-[#093A3E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093A3E]/70 border border-[#3AAFB9]/40 text-[#3AAFB9] text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <Cpu className="w-3.5 h-3.5 text-[#3AAFB9]" />
                <span>Web3 Automated AI Trading Desk & Escrow Custody</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Connect Your Wallet. Let AI Trade For You.
              </h1>
              <p className="text-xs sm:text-sm text-[#86cbd1] leading-relaxed">
                Connect your decentralized wallet to authorize Alpha@ssets' algorithmic trading desk. Our neural AI makes mathematically smarter decisions on <strong>when to buy and sell</strong>, while all assets remain 100% ring-fenced inside an audited smart-contract <strong>Escrow System</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openModal}
                    className="px-4 py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] border border-[#3AAFB9]/40 text-[#3AAFB9] text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{shortAddress}</span>
                  </button>
                  <button
                    type="button"
                    onClick={disconnectWallet}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Power className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => connectWallet("metamask")}
                    disabled={isConnecting}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3AAFB9] to-[#278e98] text-[#001011] text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Wallet className="w-4 h-4 text-[#001011]" />
                    <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openModal}
                    className="px-4 py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#041819] border border-[#3AAFB9]/40 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    More Wallets (QR / Trust)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Connected Wallet */}
          <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Connected Wallet</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
              }`}>
                {isConnected ? `Active (${networkName.split(" ")[0]})` : "Standby"}
              </span>
            </div>

            <div>
              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]">
                      {account}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-1 text-slate-400 hover:text-slate-800"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Network selector */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Active Network:</span>
                    <select
                      value={networkName}
                      onChange={(e) => switchNetwork(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                    >
                      {NETWORKS.map((n) => (
                        <option key={n.id} value={n.name}>{n.icon} {n.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 italic">
                    No Web3 wallet currently connected. Click below to link your decentralized wallet in 1 click.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => connectWallet("metamask")}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 text-center cursor-pointer"
                    >
                      🦊 MetaMask
                    </button>
                    <button
                      type="button"
                      onClick={openModal}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 text-center cursor-pointer"
                    >
                      ⚡ WalletConnect
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Available Web3 Balance:</span>
              <span className="font-mono font-bold text-emerald-600">
                {isConnected ? `$${balanceUsdt.toLocaleString()} USDT` : "$0.00"}
              </span>
            </div>
          </div>

          {/* Card 2: Smart Escrow Vault */}
          <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Smart Escrow Vault</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#093A3E]/10 border border-[#093A3E]/20 text-[#093A3E] text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#3AAFB9]" />
                <span>Multi-Sig Protected</span>
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-600 leading-relaxed">
                Investor funds are held in an audited smart-contract escrow vault. The company trades to generate yield on your behalf, but <strong>only your private key</strong> can withdraw assets.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 truncate">
                Contract: {escrowContractAddress}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Principal Guarantee:</span>
              <span className="font-bold text-[#093A3E]">100% Capital Returned</span>
            </div>
          </div>

          {/* Card 3: AI Trading Desk Delegation */}
          <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Company AI Trading Desk</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Execution</span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Automated Trades</div>
                  <div className="text-[11px] text-slate-500">AI decides when to buy and sell</div>
                </div>
                <button
                  type="button"
                  disabled={!isConnected}
                  onClick={toggleTradingDelegation}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                    isTradingDelegated && isConnected ? "bg-[#093A3E] justify-end" : "bg-slate-300 justify-start"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Proprietary deep neural models analyze volume momentum and exchange order books to minimize downside drawdown.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Model Precision:</span>
              <span className="font-mono font-bold text-emerald-600">98.4% Win Conviction</span>
            </div>
          </div>

        </div>

        {/* Allocate from Connected Wallet Console */}
        <div className="bg-white border border-[#d4e7e9] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-black text-[#001011] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#3AAFB9]" />
                <span>Allocate Capital Into Escrow Trading Packages</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Deploy capital from your connected Web3 balance directly into our official Basic Plan or Premium Plan.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#093A3E] bg-[#f0f8f9] border border-[#c8e2e5] px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
              Connected Balance: ${balanceUsdt.toLocaleString()} USDT
            </span>
          </div>

          {txMessage && (
            <div className={`p-4 rounded-xl text-xs font-bold space-y-1 ${
              txMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              <div className="flex items-center gap-2.5">
                {txMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{txMessage.text}</span>
              </div>
              {txMessage.txHash && (
                <div className="text-[11px] font-mono text-emerald-700 pl-6 break-all">
                  Tx Hash: {txMessage.txHash}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleAllocate} className="space-y-6">
            
            {/* Plan Choice: Basic vs Premium Only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Basic Plan */}
              <div
                onClick={() => { setSelectedPlan("Basic Plan"); setAllocationAmount("500"); }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === "Basic Plan"
                    ? "border-[#093A3E] bg-[#093A3E]/5 ring-2 ring-[#3AAFB9]/30 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Basic Plan</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#093A3E] text-[#3AAFB9]">
                    Starter Tier
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-mono text-[#093A3E]">3.5%</span>
                  <span className="text-xs text-slate-500 font-medium">/ week (8 Weeks)</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Deposit Range: <strong>$200 – $4,999</strong> · Principal returned at completion · Escrow Protected.
                </p>
              </div>

              {/* Premium Plan */}
              <div
                onClick={() => { setSelectedPlan("Premium Plan"); setAllocationAmount("5000"); }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedPlan === "Premium Plan"
                    ? "border-[#093A3E] bg-[#093A3E]/5 ring-2 ring-[#3AAFB9]/30 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Premium Plan</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-[#3AAFB9] to-[#278e98] text-[#001011]">
                    Most Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-mono text-emerald-600">7.0%</span>
                  <span className="text-xs text-slate-500 font-medium">/ week (16 Weeks)</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Deposit Range: <strong>$5,000 – $1,000,000+</strong> · Priority AI trade signals · Segregated Escrow Vault.
                </p>
              </div>

            </div>

            {/* Amount input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Allocation Amount (USDT)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min={selectedPlan === "Basic Plan" ? 200 : 5000}
                  max={selectedPlan === "Basic Plan" ? 4999 : 1000000}
                  step="any"
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#093A3E]"
                  placeholder="500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={allocating}
                className="py-3 px-6 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
              >
                {allocating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#3AAFB9]" />
                    <span>Signing Escrow Allocation...</span>
                  </>
                ) : isConnected ? (
                  <>
                    <Lock className="w-4 h-4 text-[#3AAFB9]" />
                    <span>Confirm & Lock In Escrow</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 text-[#3AAFB9]" />
                    <span>Connect Wallet to Allocate</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Live Active Web3 Allocations Table */}
        {allocations.length > 0 && (
          <div className="bg-white border border-[#d4e7e9] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#001011] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Active Web3 Escrow Allocations ({allocations.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time smart contract custody records actively traded by company AI</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Escrow Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Package Tier</th>
                    <th className="pb-3">Capital Locked</th>
                    <th className="pb-3">Weekly Yield</th>
                    <th className="pb-3">Escrow Status</th>
                    <th className="pb-3">Tx Hash</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">{a.planName}</td>
                      <td className="py-3.5 font-mono font-extrabold text-[#093A3E]">${a.amount.toLocaleString()}</td>
                      <td className="py-3.5 font-mono font-bold text-emerald-600">
                        {a.planName.includes("Premium") ? "+7.0%/wk" : "+3.5%/wk"}
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          <span>Escrow Locked</span>
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-500 text-[11px]">
                        {a.txHash.substring(0, 12)}...
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px]">{a.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live AI Decision Telemetry Feed */}
        <div className="bg-[#001011] border border-[#093A3E] rounded-3xl overflow-hidden shadow-2xl text-white">
          <div className="p-6 bg-[#041819] border-b border-[#093A3E] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#3AAFB9]" />
              <div>
                <h3 className="text-sm font-black text-white">Live AI Trade Decision Telemetry</h3>
                <p className="text-[11px] text-[#86cbd1]">Real-time execution log explaining why our AI decides to buy, hedge, or sell</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#093A3E] text-[#3AAFB9] font-mono text-[10px] font-bold border border-[#3AAFB9]/30">
              AUDIT VERIFIED
            </span>
          </div>

          <div className="divide-y divide-[#093A3E]">
            {AI_LOGS.map((log) => (
              <div key={log.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#041819]/50 transition-colors">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-black ${
                        log.action === "BUY"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : log.action === "SELL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          : "bg-[#3AAFB9]/20 text-[#3AAFB9] border border-[#3AAFB9]/40"
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="font-extrabold text-sm text-white font-mono">{log.pair}</span>
                    <span className="text-xs font-mono text-[#86cbd1]">{log.price}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{log.rationale}</p>
                </div>

                <div className="flex items-center gap-6 text-xs sm:self-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Conviction</span>
                    <span className="font-mono font-bold text-[#3AAFB9]">{log.conviction}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Yield Gain</span>
                    <span className="font-mono font-bold text-emerald-400">{log.profitEstimate}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
