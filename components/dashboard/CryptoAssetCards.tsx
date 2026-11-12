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
  const fmtCrypto = (val: number, decimals: number = 4) => {
    if (!val || val === 0) return "0.00";
    if (val < 0.0001) return val.toFixed(6);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const fmtUsd = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Keep ATFC first, then active balances, then standard crypto
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => {
      if (a.symbol === "ATFC") return -1;
      if (b.symbol === "ATFC") return 1;
      const valA = a.balance * (a.priceUsd || 0);
      const valB = b.balance * (b.priceUsd || 0);
      return valB - valA;
    });
  }, [assets]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#20281f] tracking-tight">
            Your Crypto Accounts
          </h3>
          <p className="text-xs text-[#60695b] mt-0.5">
            Direct on-chain custody vaults with real-time exchange rates
          </p>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        {sortedAssets.map((asset) => {
          const hasBalance = (asset.balance || 0) > 0;
          const usdValue = asset.balance * (asset.priceUsd || 0);
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              className={`bg-white border rounded-[10px] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                hasBalance ? "border-[#86a951]/60 bg-[#fafaf5]" : "border-[#e4e7dc]"
              }`}
            >
              <div>
                {/* Header: Official Logo, Names, Tag, 24h change */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-[8px] bg-[#fafaf5] p-1.5 border border-[#e4e7dc] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <CryptoCoinIcon symbol={asset.symbol} className="w-7 h-7" size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-[#20281f] tracking-tight">
                          {asset.symbol}
                        </span>
                        {asset.requiresTag && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 tracking-wide">
                            Tag Req
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#7d8573] font-medium block truncate max-w-[110px]">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-[5px] flex-shrink-0 font-mono ${
                      isPositive
                        ? "bg-[#e3f2c9] text-[#476b1b] border border-[#c4ee70]"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {asset.change24h.toFixed(1)}%
                  </span>
                </div>

                {/* Balance Display Card */}
                <div
                  className={`mb-3 p-3 rounded-[8px] border ${
                    hasBalance
                      ? "bg-[#e3f2c9]/30 border-[#c4ee70]"
                      : "bg-[#fafaf5] border-[#e4e7dc]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d8573]">
                      {asset.symbol} Balance
                    </span>
                    {hasBalance && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-[#476b1b] bg-[#e3f2c9] px-1.5 py-0.2 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-1">
                    <p className="text-lg sm:text-xl font-bold text-[#20281f] font-mono tracking-tight truncate">
                      {fmtCrypto(asset.balance)}
                    </p>
                    <span className="text-xs font-semibold text-[#7d8573] font-mono flex-shrink-0">
                      {asset.symbol}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#60695b] font-mono mt-0.5">
                    ≈ ${fmtUsd(usdValue)}{" "}
                    <span className="text-[10px] font-normal text-[#7d8573]">USD</span>
                  </p>
                </div>

                {/* Live Market Price & Network */}
                <div className="space-y-1 text-[11px] text-[#60695b] mb-3 px-0.5 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7d8573]">Rate:</span>
                    <span className="font-mono font-bold text-[#20281f]">
                      1 {asset.symbol} = ${fmtUsd(asset.priceUsd)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7d8573]">Network:</span>
                    <span className="text-[#20281f] font-semibold truncate max-w-[130px]">{asset.network}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Direct Deposit & Withdraw */}
              <div className="pt-2.5 border-t border-[#e4e7dc] grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onDeposit(asset.symbol)}
                  className="py-2 px-2.5 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-[#d1f18b]" />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => onWithdraw(asset.symbol)}
                  className="py-2 px-2.5 rounded-[7px] bg-[#fafaf5] hover:bg-[#e4e7dc] border border-[#20281f20] text-[#20281f] text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#60695b]" />
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
