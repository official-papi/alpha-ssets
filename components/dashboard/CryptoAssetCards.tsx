"use client";

import React, { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";

export interface CryptoAssetItem {
  symbol: string;
  name: string;
  network: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  requiresTag?: boolean;
  walletAddress?: string;
  tagValue?: string;
}

interface CryptoAssetCardsProps {
  assets: CryptoAssetItem[];
  onDeposit: (symbol: string) => void;
  onWithdraw: (symbol: string) => void;
  onFund?: (symbol: string) => void;
}

export default function CryptoAssetCards({ assets, onDeposit, onWithdraw }: CryptoAssetCardsProps) {
  const getThemeStyles = (symbol: string, hasBalance: boolean) => {
    switch (symbol.toUpperCase()) {
      case "ATFC":
        return {
          borderHover: "hover:border-[#3AAFB9]",
          cardBg: hasBalance
            ? "bg-gradient-to-b from-white to-[#f0f8f9] border-[#3AAFB9]/60 shadow-sm"
            : "hover:bg-gradient-to-b hover:from-white hover:to-[#f0f8f9]/60",
          accentBar: "bg-gradient-to-r from-[#001011] via-[#093A3E] to-[#3AAFB9]",
          tagBg: "bg-[#3AAFB9]/10 text-[#093A3E]",
        };
      case "XRP":
        return {
          borderHover: "hover:border-[#3AAFB9]",
          cardBg: hasBalance
            ? "bg-gradient-to-b from-white to-[#f0f8f9] border-[#3AAFB9]/60 shadow-sm"
            : "hover:bg-gradient-to-b hover:from-white hover:to-[#f0f8f9]/50",
          accentBar: "bg-gradient-to-r from-[#093A3E] to-[#3AAFB9]",
          tagBg: "bg-[#3AAFB9]/10 text-[#093A3E]",
        };
      case "BTC":
        return {
          borderHover: "hover:border-amber-400",
          cardBg: hasBalance
            ? "bg-gradient-to-b from-white to-amber-50/40 border-amber-300 shadow-sm"
            : "hover:bg-gradient-to-b hover:from-white hover:to-amber-50/30",
          accentBar: "bg-gradient-to-r from-amber-500 to-amber-400",
          tagBg: "bg-amber-50 text-amber-700",
        };
      case "ETH":
        return {
          borderHover: "hover:border-indigo-400",
          cardBg: hasBalance
            ? "bg-gradient-to-b from-white to-indigo-50/40 border-indigo-300 shadow-sm"
            : "hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/30",
          accentBar: "bg-gradient-to-r from-indigo-600 to-violet-400",
          tagBg: "bg-indigo-50 text-indigo-700",
        };
      case "USDT":
        return {
          borderHover: "hover:border-emerald-400",
          cardBg: hasBalance
            ? "bg-gradient-to-b from-white to-emerald-50/40 border-emerald-300 shadow-sm"
            : "hover:bg-gradient-to-b hover:from-white hover:to-emerald-50/30",
          accentBar: "bg-gradient-to-r from-emerald-600 to-teal-400",
          tagBg: "bg-emerald-50 text-emerald-700",
        };
      case "SOL":
        return {
          borderHover: "hover:border-purple-400",
          cardBg: hasBalance
            ? "bg-gradient-to-b from-white to-purple-50/40 border-purple-300 shadow-sm"
            : "hover:bg-gradient-to-b hover:from-white hover:to-purple-50/30",
          accentBar: "bg-gradient-to-r from-purple-600 to-pink-500",
          tagBg: "bg-purple-50 text-purple-700",
        };
      default:
        return {
          borderHover: "hover:border-[#093A3E]",
          cardBg: hasBalance ? "bg-slate-50 border-slate-300" : "hover:bg-slate-50",
          accentBar: "bg-[#093A3E]",
          tagBg: "bg-slate-100 text-slate-700",
        };
    }
  };

  const fmtCrypto = (val: number, decimals: number = 4) => {
    if (!val || val === 0) return "0.00";
    if (val < 0.0001) return val.toFixed(6);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const fmtUsd = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Sort assets: coins with active balance come first, with ATFC as the primary coin
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      const valA = (a.balance || 0) * (a.priceUsd || 0);
      const valB = (b.balance || 0) * (b.priceUsd || 0);

      // Coins with active balance come first
      if (valA > 0 && valB <= 0) return -1;
      if (valB > 0 && valA <= 0) return 1;
      if (valA > 0 && valB > 0) return valB - valA;

      // When balance is 0, keep ATFC at the front
      if (a.symbol === "ATFC") return -1;
      if (b.symbol === "ATFC") return 1;

      return 0;
    });
  }, [assets]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#001011] tracking-tight">
            Your Crypto Accounts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct on-chain custody accounts with live balances and rates
          </p>
        </div>
      </div>

      {/* Spacious, Responsive Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        {sortedAssets.map((asset) => {
          const hasBalance = (asset.balance || 0) > 0;
          const styles = getThemeStyles(asset.symbol, hasBalance);
          const usdValue = asset.balance * (asset.priceUsd || 0);
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
                hasBalance ? "border-[#3AAFB9]/60 ring-1 ring-[#3AAFB9]/20" : "border-[#d4e7e9]"
              } ${styles.borderHover} ${styles.cardBg}`}
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentBar}`} />

              <div>
                {/* Header: Official Logo, Names, Tag, 24h change */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 p-1.5 border border-slate-100 shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <CryptoCoinIcon symbol={asset.symbol} className="w-7 h-7" size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-[#001011] tracking-tight">
                          {asset.symbol}
                        </span>
                        {asset.requiresTag && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 tracking-wide">
                            Tag Req
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium block truncate max-w-[110px]">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 font-mono ${
                      isPositive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-rose-50 text-rose-700 border border-rose-200/60"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {asset.change24h.toFixed(1)}%
                  </span>
                </div>

                {/* Balance Display Card */}
                <div
                  className={`mb-3 p-3 rounded-xl border ${
                    hasBalance
                      ? "bg-[#3AAFB9]/8 border-[#3AAFB9]/30"
                      : "bg-slate-50/80 border-slate-100/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {asset.symbol} Balance
                    </span>
                    {hasBalance && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-1">
                    <p className="text-lg sm:text-xl font-black text-[#001011] font-mono tracking-tight truncate">
                      {fmtCrypto(asset.balance)}
                    </p>
                    <span className="text-xs font-bold text-slate-400 font-mono flex-shrink-0">
                      {asset.symbol}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-600 font-mono mt-0.5">
                    ≈ ${fmtUsd(usdValue)}{" "}
                    <span className="text-[10px] font-normal text-slate-400">USD</span>
                  </p>
                </div>

                {/* Live Market Price & Network */}
                <div className="space-y-1 text-[11px] text-slate-500 mb-3 px-0.5 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-mono font-bold text-[#093A3E]">
                      1 {asset.symbol} = ${fmtUsd(asset.priceUsd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Network:</span>
                    <span className="text-slate-600 font-semibold truncate max-w-[130px]">{asset.network}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Direct Deposit & Withdraw */}
              <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onDeposit(asset.symbol)}
                  className="py-2 px-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-[#3AAFB9]" />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => onWithdraw(asset.symbol)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
