"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, ExternalLink, ShieldCheck } from "lucide-react";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";
import { CryptoAssetItem } from "./CryptoAssetCards";

interface CryptoHoldingsTableProps {
  assets: CryptoAssetItem[];
  totalUsdValue: number;
  onDeposit: (symbol: string) => void;
  onWithdraw: (symbol: string) => void;
}

export default function CryptoHoldingsTable({
  assets,
  totalUsdValue,
  onDeposit,
  onWithdraw,
}: CryptoHoldingsTableProps) {
  const fmtCrypto = (val: number, decimals: number = 4) => {
    if (!val || val === 0) return "0.00";
    if (val < 0.0001) return val.toFixed(6);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  };

  const fmtUsd = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-[#001011]">Portfolio Asset Breakdown</h3>
          <p className="text-xs text-slate-500">Real-time asset allocations and verified on-chain custody balances</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Cold Custody Backed</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 pl-2">Asset</th>
              <th className="pb-3">Network</th>
              <th className="pb-3 text-right">Holdings</th>
              <th className="pb-3 text-right">Market Price</th>
              <th className="pb-3 text-right">Portfolio Share</th>
              <th className="pb-3 text-center pr-2">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => {
              const usdValue = asset.balance * (asset.priceUsd || 0);
              const sharePercent = totalUsdValue > 0 ? (usdValue / totalUsdValue) * 100 : 0;
              const isPositive = asset.change24h >= 0;

              return (
                <tr key={asset.symbol} className="hover:bg-slate-50/80 transition-colors">
                  {/* Asset name & icon */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shadow-2xs">
                        <CryptoCoinIcon symbol={asset.symbol} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-[#001011]">{asset.symbol}</span>
                          <span className="text-xs text-slate-400 font-medium hidden sm:inline">({asset.name})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium sm:hidden block">{asset.name}</span>
                      </div>
                    </div>
                  </td>

                  {/* Network */}
                  <td className="py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">
                      {asset.network}
                    </span>
                  </td>

                  {/* Holdings */}
                  <td className="py-3.5 text-right font-mono">
                    <div className="font-extrabold text-[#001011] text-[13px]">
                      {fmtCrypto(asset.balance)} {asset.symbol}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      ≈ ${fmtUsd(usdValue)}
                    </div>
                  </td>

                  {/* Live Price & Change */}
                  <td className="py-3.5 text-right font-mono">
                    <div className="font-bold text-[#093A3E] text-[13px]">
                      ${fmtUsd(asset.priceUsd)}
                    </div>
                    <div className={`text-[10px] font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      {isPositive ? "+" : ""}{asset.change24h.toFixed(2)}%
                    </div>
                  </td>

                  {/* Portfolio Share */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-bold text-slate-600 text-[11px] w-12 text-right">
                        {sharePercent.toFixed(1)}%
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#093A3E] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(sharePercent, 3))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 text-center pr-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDeposit(asset.symbol)}
                        className="py-1 px-2.5 rounded-lg bg-[#093A3E] hover:bg-[#001011] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        title={`Deposit ${asset.symbol}`}
                      >
                        <ArrowDownRight className="w-3 h-3 text-[#3AAFB9]" />
                        <span>Deposit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onWithdraw(asset.symbol)}
                        className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title={`Withdraw ${asset.symbol}`}
                      >
                        <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        <span>Withdraw</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
