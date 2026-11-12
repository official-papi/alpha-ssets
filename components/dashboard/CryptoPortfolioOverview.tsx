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

  // Filter coins that currently hold balance
  const holdingCoins = assets.filter((a) => (a.balance || 0) > 0);

  // If the user has coins with balance, display those; otherwise default to ATFC
  const displayCoins =
    holdingCoins.length > 0
      ? holdingCoins
      : assets.filter((a) => a.symbol === "ATFC").length > 0
      ? assets.filter((a) => a.symbol === "ATFC")
      : assets.slice(0, 1);

  return (
    <div className="space-y-4">
      {/* ── Main Net Worth Card (Stelsuite Dark Band) ── */}
      <div className="relative overflow-hidden rounded-[14px] bg-[#20281f] text-white p-6 sm:p-8 shadow-xl border border-[#20281f]">
        
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#d1f18b]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#86a951]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Balance Block */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f4f7ec]/15 text-[#d1f18b] border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#86a951] animate-pulse" />
                Live Portfolio Sync
              </span>
              <span className="text-xs text-[#a4aca0] font-medium">Real-Time Ledger</span>
            </div>

            <p className="text-[11px] sm:text-[12px] uppercase font-bold tracking-wider text-[#a4aca0]">
              Total Portfolio Valuation
            </p>
            <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                ${fmt(totalUsdValue)}
              </h2>
              <span className="text-xs font-bold text-[#d1f18b] bg-[#d1f18b]/15 px-2.5 py-0.5 rounded-[6px] border border-[#d1f18b]/20 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                Live Valuation
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#d8ded4]">
              <span>
                {holdingCoins.length > 0 ? (
                  <span className="text-[#d1f18b] font-semibold">
                    Funds allocated across {holdingCoins.length} active coin{holdingCoins.length > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>Ready for deposit into American Trust Fund (ATFC) or your preferred asset.</span>
                )}
              </span>
              {totalWithdrawnUsd > 0 && (
                <span className="text-[#a4aca0] border-l border-white/20 pl-3">
                  Total Payouts: <strong className="text-white font-mono">${fmt(totalWithdrawnUsd)}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Primary Actions (Stelsuite Buttons) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onOpenDeposit()}
              className="min-h-[44px] px-6 rounded-[7px] bg-[#d1f18b] hover:bg-[#c4ee70] text-[#20281f] text-sm font-bold flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4 text-[#20281f]" />
              <span>Deposit</span>
            </button>

            <button
              onClick={() => onOpenWithdraw()}
              className="min-h-[44px] px-6 rounded-[7px] bg-transparent hover:bg-white/10 text-white border border-white/25 text-sm font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-[#d1f18b]" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={onViewHistory}
              className="min-h-[44px] px-3.5 rounded-[7px] bg-white/5 hover:bg-white/10 text-[#d8ded4] hover:text-white border border-white/15 text-sm font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="View Activity History"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Ledger</span>
            </button>
          </div>
        </div>

        {/* ── Active Coin Holdings Strip ── */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#d1f18b]" />
              <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-[#d8ded4]">
                Where Your Capital Is Stored
              </span>
            </div>
            <span className="text-[11px] text-[#d1f18b] font-mono">
              {holdingCoins.length > 0
                ? `${holdingCoins.length} Active Asset${holdingCoins.length > 1 ? "s" : ""}`
                : "Primary Sovereign Account"}
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
                  className={`p-3.5 rounded-[10px] border transition-all flex items-center justify-between gap-3 ${
                    hasBalance
                      ? "bg-white/10 border-[#d1f18b]/40 shadow-xs"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-[8px] bg-white/10 border border-white/10 flex items-center justify-center p-1.5 flex-shrink-0">
                      <CryptoCoinIcon symbol={asset.symbol} className="w-7 h-7" size={28} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">{asset.symbol}</span>
                        {hasBalance && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#d1f18b]/20 text-[#d1f18b] border border-[#d1f18b]/30">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#a4aca0] truncate block">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono">
                    <div className="text-sm font-bold text-white">
                      {fmtCrypto(asset.balance)} {asset.symbol}
                    </div>
                    <div className="text-xs font-semibold text-[#d1f18b]">
                      ≈ ${fmt(usdVal)} <span className="text-[10px] text-[#a4aca0] font-normal">USD</span>
                    </div>
                    {share > 0 && (
                      <span className="text-[10px] text-[#a4aca0] font-mono">
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
