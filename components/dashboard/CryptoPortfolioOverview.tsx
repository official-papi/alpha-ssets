"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, History, TrendingUp, Coins, ShieldCheck, Wallet } from "lucide-react";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";
import { CryptoAssetItem } from "./CryptoAssetCards";

export interface CryptoPortfolioOverviewProps {
  totalUsdValue: number;
  totalWithdrawnUsd: number;
  depositWalletBalance?: number;
  interestWalletBalance?: number;
  cryptoTotalUsd?: number;
  topAssetSymbol?: string;
  topAssetAmount?: number;
  activeCurrenciesCount: number;
  assets?: CryptoAssetItem[];
  onOpenDeposit: (symbol?: string) => void;
  onOpenWithdraw: (symbol?: string) => void;
  onOpenFund?: (symbol?: string) => void;
  onViewHistory: () => void;
}

export default function CryptoPortfolioOverview({
  totalUsdValue = 0,
  totalWithdrawnUsd = 0,
  activeCurrenciesCount = 6,
  assets = [],
  onOpenDeposit,
  onOpenWithdraw,
  onViewHistory,
}: CryptoPortfolioOverviewProps) {
  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtCrypto = (val: number, decimals: number = 4) => {
    if (!val || val === 0) return "0.00";
    if (val < 0.0001) return val.toFixed(6);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  // Filter coins that currently hold money
  const holdingCoins = assets.filter((a) => (a.balance || 0) > 0);

  // If the user has coins with balance, display those.
  // Otherwise, default to showing the primary platform coin (ATFC) with 0.00 balance.
  const displayCoins =
    holdingCoins.length > 0
      ? holdingCoins
      : assets.filter((a) => a.symbol === "ATFC").length > 0
      ? assets.filter((a) => a.symbol === "ATFC")
      : assets.slice(0, 1);

  return (
    <div className="space-y-4">
      {/* ── Main Net Worth & Coin Custody Card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#001011] via-[#093A3E] to-[#041a1c] text-white p-5 sm:p-8 shadow-xl border border-[#3AAFB9]/20">
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

            <p className="text-[11px] sm:text-[12px] uppercase font-bold tracking-wider text-slate-300">
              Total Portfolio Valuation
            </p>
            <div className="flex flex-wrap items-baseline gap-3 mt-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                ${fmt(totalUsdValue)}
              </h2>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Live Valuation
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300/80">
              <span>
                {holdingCoins.length > 0 ? (
                  <span className="text-[#3AAFB9] font-semibold">
                    Funds allocated across {holdingCoins.length} coin{holdingCoins.length > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>Ready for deposit into American Trust Fund (ATFC) or your preferred coin.</span>
                )}
              </span>
              {totalWithdrawnUsd > 0 && (
                <span className="text-slate-400 border-l border-white/20 pl-3">
                  Total Payouts: <strong className="text-white font-mono">${fmt(totalWithdrawnUsd)}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onOpenDeposit()}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-gradient-to-r from-[#3AAFB9] to-[#5cb4be] hover:from-[#4bc7d2] hover:to-[#6ec7d0] text-[#001011] text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-[#3AAFB9]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#001011]/15 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-[#001011]" />
              </div>
              <span>Deposit</span>
            </button>

            <button
              onClick={() => onOpenWithdraw()}
              className="flex-1 sm:flex-initial py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold flex items-center justify-center gap-2 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-[#3AAFB9]" />
              </div>
              <span>Withdraw</span>
            </button>

            <button
              onClick={onViewHistory}
              className="py-3 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="View History / Activity"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Activity</span>
            </button>
          </div>
        </div>

        {/* ── Active Coin Holdings (Where Your Money Is) ── */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#3AAFB9]" />
              <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider text-slate-200">
                Where Your Money Is Held
              </span>
            </div>
            <span className="text-[11px] text-[#3AAFB9] font-mono">
              {holdingCoins.length > 0
                ? `${holdingCoins.length} Active Asset${holdingCoins.length > 1 ? "s" : ""}`
                : "Primary Account"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayCoins.map((asset) => {
              const usdVal = asset.balance * (asset.priceUsd || 0);
              const hasBalance = asset.balance > 0;
              const share = totalUsdValue > 0 ? (usdVal / totalUsdValue) * 100 : 0;

              return (
                <div
                  key={asset.symbol}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    hasBalance
                      ? "bg-[#3AAFB9]/10 border-[#3AAFB9]/50 shadow-md shadow-[#3AAFB9]/10"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center p-1.5 flex-shrink-0">
                      <CryptoCoinIcon symbol={asset.symbol} className="w-7 h-7" size={28} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white">{asset.symbol}</span>
                        {hasBalance && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono">
                    <div className="text-sm font-extrabold text-white">
                      {fmtCrypto(asset.balance)} {asset.symbol}
                    </div>
                    <div className="text-xs font-semibold text-[#3AAFB9]">
                      ≈ ${fmt(usdVal)} <span className="text-[10px] text-slate-400 font-normal">USD</span>
                    </div>
                    {share > 0 && (
                      <span className="text-[10px] text-emerald-400/90 font-mono">
                        {share.toFixed(0)}% of total
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
