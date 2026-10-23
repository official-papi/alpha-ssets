"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
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

export default function CryptoAssetCards({ assets, onDeposit, onWithdraw, onFund }: CryptoAssetCardsProps) {
  const getThemeStyles = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case "ATFC":
        return {
          borderHover: "hover:border-[#3AAFB9]",
          cardBg: "hover:bg-gradient-to-b hover:from-white hover:to-[#f0f8f9]/60",
          accentBar: "bg-gradient-to-r from-[#001011] via-[#093A3E] to-[#3AAFB9]",
          tagBg: "bg-[#3AAFB9]/10 text-[#093A3E]",
        };
      case "XRP":
        return {
          borderHover: "hover:border-[#3AAFB9]",
          cardBg: "hover:bg-gradient-to-b hover:from-white hover:to-[#f0f8f9]/50",
          accentBar: "bg-gradient-to-r from-[#093A3E] to-[#3AAFB9]",
          tagBg: "bg-[#3AAFB9]/10 text-[#093A3E]",
        };
      case "BTC":
        return {
          borderHover: "hover:border-amber-400",
          cardBg: "hover:bg-gradient-to-b hover:from-white hover:to-amber-50/30",
          accentBar: "bg-gradient-to-r from-amber-500 to-amber-400",
          tagBg: "bg-amber-50 text-amber-700",
        };
      case "ETH":
        return {
          borderHover: "hover:border-indigo-400",
          cardBg: "hover:bg-gradient-to-b hover:from-white hover:to-indigo-50/30",
          accentBar: "bg-gradient-to-r from-indigo-600 to-violet-400",
          tagBg: "bg-indigo-50 text-indigo-700",
        };
      case "USDT":
        return {
          borderHover: "hover:border-emerald-400",
          cardBg: "hover:bg-gradient-to-b hover:from-white hover:to-emerald-50/30",
          accentBar: "bg-gradient-to-r from-emerald-600 to-teal-400",
          tagBg: "bg-emerald-50 text-emerald-700",
        };
      case "SOL":
        return {
          borderHover: "hover:border-purple-400",
          cardBg: "hover:bg-gradient-to-b hover:from-white hover:to-purple-50/30",
          accentBar: "bg-gradient-to-r from-purple-600 to-pink-500",
          tagBg: "bg-purple-50 text-purple-700",
        };
      default:
        return {
          borderHover: "hover:border-[#093A3E]",
          cardBg: "hover:bg-slate-50",
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-black text-[#001011] tracking-tight">Your Crypto Accounts</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live on-chain custody accounts with real-time market valuations</p>
        </div>
      </div>

      {/* Spacious, Responsive Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5">
        {assets.map((asset) => {
          const styles = getThemeStyles(asset.symbol);
          const usdValue = asset.balance * (asset.priceUsd || 0);
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              className={`bg-white border border-[#d4e7e9] rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${styles.borderHover} ${styles.cardBg}`}
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentBar}`} />

              <div>
                {/* Header: Official Logo, Names, Tag, 24h change */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 p-1.5 border border-slate-100 shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <CryptoCoinIcon symbol={asset.symbol} className="w-8 h-8" size={32} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-[#001011] tracking-tight">{asset.symbol}</span>
                        {asset.requiresTag && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 tracking-wide">
                            Tag Req
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium block truncate max-w-[120px]">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 font-mono ${
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
                <div className="mb-4 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    {asset.symbol} Balance
                  </span>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xl sm:text-2xl font-black text-[#001011] font-mono tracking-tight truncate">
                      {fmtCrypto(asset.balance)}
                    </p>
                    <span className="text-xs font-bold text-slate-400 font-mono flex-shrink-0">{asset.symbol}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 font-mono mt-1">
                    ≈ ${fmtUsd(usdValue)} <span className="text-[10px] font-normal text-slate-400">USD</span>
                  </p>
                </div>

                {/* Live Market Price & Network */}
                <div className="space-y-1 text-[11px] text-slate-500 mb-4 px-0.5 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-mono font-bold text-[#093A3E]">
                      1 {asset.symbol} = ${fmtUsd(asset.priceUsd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Network:</span>
                    <span className="text-slate-600 font-semibold">{asset.network}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {onFund && (
                  <button
                    type="button"
                    onClick={() => onFund(asset.symbol)}
                    className="w-full py-2 px-3 rounded-xl bg-[#3AAFB9] hover:bg-[#4bc7d2] text-[#001011] text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#001011]" />
                    <span>Fund with Wallet</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
