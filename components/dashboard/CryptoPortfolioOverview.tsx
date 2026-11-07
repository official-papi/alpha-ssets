"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, History, Sparkles, TrendingUp, Wallet, Coins } from "lucide-react";

interface CryptoPortfolioOverviewProps {
  totalUsdValue: number;
  totalWithdrawnUsd: number;
  depositWalletBalance?: number;
  interestWalletBalance?: number;
  cryptoTotalUsd?: number;
  topAssetSymbol?: string;
  topAssetAmount?: number;
  activeCurrenciesCount: number;
  onOpenDeposit: (symbol?: string) => void;
  onOpenWithdraw: (symbol?: string) => void;
  onOpenFund?: (symbol?: string) => void;
  onViewHistory: () => void;
}

export default function CryptoPortfolioOverview({
  totalUsdValue = 0,
  totalWithdrawnUsd = 0,
  depositWalletBalance = 0,
  interestWalletBalance = 0,
  cryptoTotalUsd = 0,
  topAssetSymbol = "ATFC",
  topAssetAmount = 0,
  activeCurrenciesCount = 5,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenFund,
  onViewHistory,
}: CryptoPortfolioOverviewProps) {
  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      {/* ── Main Net Worth Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001011] via-[#093A3E] to-[#041a1c] text-white p-6 sm:p-8 shadow-xl border border-[#3AAFB9]/20">
        {/* Glow ambient background circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#3AAFB9]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#093A3E]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Balance Block */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3AAFB9]/20 text-[#3AAFB9] border border-[#3AAFB9]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9] animate-pulse" />
                Live Multi-Asset Portfolio
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Real-Time Sync</span>
            </div>

            <p className="text-[12px] uppercase font-bold tracking-wider text-slate-300">
              Total Estimated Net Worth
            </p>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                ${fmt(totalUsdValue)}
              </h2>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Live Valuation
              </span>
            </div>
            <p className="text-xs text-slate-300/80 mt-2 max-w-md">
              Complete aggregate valuation across your dedicated crypto accounts and cash wallet.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenDeposit()}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#3AAFB9] to-[#5cb4be] hover:from-[#4bc7d2] hover:to-[#6ec7d0] text-[#001011] text-xs font-black flex items-center gap-2 shadow-lg shadow-[#3AAFB9]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#001011]/15 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-[#001011]" />
              </div>
              <span>Deposit Crypto</span>
            </button>

            {onOpenFund && (
              <button
                onClick={() => onOpenFund()}
                className="py-3 px-5 rounded-2xl bg-[#093A3E] hover:bg-[#0c4e53] text-white border border-[#3AAFB9]/40 text-xs font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#3AAFB9]" />
                </div>
                <span>
                  {depositWalletBalance > 0 ? `Allocate Cash ($${fmt(depositWalletBalance)})` : "Allocate Cash to Coins"}
                </span>
              </button>
            )}

            <button
              onClick={() => onOpenWithdraw()}
              className="py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold flex items-center gap-2 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-[#3AAFB9]" />
              </div>
              <span>Withdraw Funds</span>
            </button>

            <button
              onClick={onViewHistory}
              className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
              title="View Ledger"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Activity</span>
            </button>
          </div>
        </div>

        {/* Bottom Breakdown Indicators: Showing Exactly Where Funds Are */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Crypto Assets</span>
            <span className="font-extrabold text-white font-mono text-sm">${fmt(cryptoTotalUsd)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Platform Cash</span>
            <span className="font-extrabold text-white font-mono text-sm">${fmt(depositWalletBalance)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Interest Earnings</span>
            <span className="font-extrabold text-emerald-400 font-mono text-sm">${fmt(interestWalletBalance)}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Payouts</span>
            <span className="font-extrabold text-slate-300 font-mono text-sm">${fmt(totalWithdrawnUsd)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
