"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Copy, Check } from "lucide-react";
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
}

export default function CryptoAssetCards({ assets, onDeposit, onWithdraw }: CryptoAssetCardsProps) {
  const getThemeStyles = (symbol: string) => {
    switch (symbol.toUpperCase()) {
      case "XRP":
        return {
          border: "hover:border-[#3AAFB9]",
          accentBar: "bg-gradient-to-r from-[#093A3E] to-[#3AAFB9]",
          iconBg: "bg-[#093A3E]/10 text-[#093A3E] border-[#3AAFB9]/30",
          tagBg: "bg-[#3AAFB9]/10 text-[#093A3E]",
        };
      case "BTC":
        return {
          border: "hover:border-amber-400",
          accentBar: "bg-gradient-to-r from-amber-500 to-amber-300",
          iconBg: "bg-amber-50 text-amber-600 border-amber-200",
          tagBg: "bg-amber-50 text-amber-700",
        };
      case "ETH":
        return {
          border: "hover:border-indigo-400",
          accentBar: "bg-gradient-to-r from-indigo-600 to-violet-400",
          iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
          tagBg: "bg-indigo-50 text-indigo-700",
        };
      case "USDT":
        return {
          border: "hover:border-emerald-400",
          accentBar: "bg-gradient-to-r from-emerald-600 to-teal-400",
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          tagBg: "bg-emerald-50 text-emerald-700",
        };
      case "SOL":
        return {
          border: "hover:border-purple-400",
          accentBar: "bg-gradient-to-r from-purple-600 to-pink-500",
          iconBg: "bg-purple-50 text-purple-600 border-purple-200",
          tagBg: "bg-purple-50 text-purple-700",
        };
      default:
        return {
          border: "hover:border-[#093A3E]",
          accentBar: "bg-[#093A3E]",
          iconBg: "bg-slate-100 text-slate-700 border-slate-200",
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#001011]">Your Crypto Accounts</h3>
          <p className="text-xs text-slate-500">Dedicated on-chain accounts reflecting each deposited asset</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {assets.map((asset) => {
          const styles = getThemeStyles(asset.symbol);
          const usdValue = asset.balance * (asset.priceUsd || 0);
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              className={`bg-white border border-[#d4e7e9] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${styles.border}`}
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.accentBar}`} />

              <div>
                {/* Header: Icon, Symbol, Network */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs ${styles.iconBg}`}>
                      <CryptoCoinIcon symbol={asset.symbol} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-[#001011] tracking-tight">{asset.symbol}</span>
                        {asset.requiresTag && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Tag Req
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[90px]">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  {/* 24h change */}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {asset.change24h.toFixed(1)}%
                  </span>
                </div>

                {/* Account Balance Display */}
                <div className="my-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {asset.symbol} Balance
                  </p>
                  <p className="text-lg font-black text-[#001011] font-mono tracking-tight truncate">
                    {fmtCrypto(asset.balance)} <span className="text-xs font-bold text-slate-400">{asset.symbol}</span>
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500 font-mono mt-0.5">
                    ≈ ${fmtUsd(usdValue)} USD
                  </p>
                </div>

                {/* Network / Market Rate Info */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-3 px-1">
                  <span>Net: {asset.network.split(" ")[0]}</span>
                  <span>1 {asset.symbol} = ${fmtUsd(asset.priceUsd)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onDeposit(asset.symbol)}
                  className="py-1.5 px-2 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowDownRight className="w-3 h-3 text-[#3AAFB9]" />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => onWithdraw(asset.symbol)}
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
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
