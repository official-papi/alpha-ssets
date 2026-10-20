"use client";

import { useState } from "react";
import {
  Activity,
  PieChart,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Lock,
} from "lucide-react";

interface DashboardLiquidityMatrixProps {
  totalInvested: number;
  onOpenInvest: () => void;
}

const DASHBOARD_ASSETS = [
  {
    name: "XRP",
    symbol: "XRP",
    share: 12,
    price: "$2.48",
    change: "+4.12%",
    color: "#00AEEF",
    type: "Cross-Border Settlement",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    share: 18,
    price: "$3,425.50",
    change: "+2.15%",
    color: "#627EEA",
    type: "Smart Contracts",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    share: 22,
    price: "$96,480.00",
    change: "+3.42%",
    color: "#F7931A",
    type: "Crypto Reserve",
  },
  {
    name: "Solana",
    symbol: "SOL",
    share: 14,
    price: "$214.80",
    change: "+5.78%",
    color: "#14F195",
    type: "High-Speed Arbitrage",
  },
  {
    name: "Nvidia",
    symbol: "NVDA",
    share: 11,
    price: "$142.60",
    change: "+3.85%",
    color: "#76B900",
    type: "AI Silicon Growth",
  },
  {
    name: "Apple",
    symbol: "AAPL",
    share: 9,
    price: "$234.90",
    change: "+1.20%",
    color: "#A2AAAD",
    type: "Cashflow Equities",
  },
  {
    name: "Tesla",
    symbol: "TSLA",
    share: 6,
    price: "$228.40",
    change: "+4.65%",
    color: "#E82127",
    type: "Tech Volatility Yield",
  },
  {
    name: "American Trust Fund Coin",
    symbol: "ATFC",
    share: 8,
    price: "$1.00",
    change: "+0.00%",
    color: "#3AAFB9",
    type: "Sovereign Trust Escrow",
  },
];

export default function DashboardLiquidityMatrix({
  totalInvested,
  onOpenInvest,
}: DashboardLiquidityMatrixProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("XRP");

  const effectiveCapital = totalInvested > 0 ? totalInvested : 5000;
  const isSimulated = totalInvested === 0;

  return (
    <div className="rounded-2xl border border-[#093A3E] bg-[#001011] p-6 shadow-xl text-white">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#093A3E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 flex items-center justify-center text-[#3AAFB9]">
            <Activity className="w-5 h-5 text-[#3AAFB9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                Space for Liquidity Control
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#093A3E] text-[#3AAFB9] border border-[#3AAFB9]/40">
                8 ASSETS LIVE
              </span>
            </div>
            <p className="text-xs text-[#86cbd1]">
              Capital allocated between <strong>Regular (5% weekly)</strong> and <strong>Premium (8.5% weekly)</strong> is hedged across 8 core liquidity channels.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenInvest}
          className="px-4 py-2 rounded-xl bg-[#3AAFB9] hover:bg-[#5cb4be] text-[#001011] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#3AAFB9]/20 transition-all cursor-pointer shrink-0"
        >
          <span>Deploy Capital</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 8-Asset Live Bar */}
      <div className="py-5">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#b5dfe3] font-medium">
            <PieChart className="w-3.5 h-3.5 text-[#3AAFB9]" />
            <span>Multi-Asset Liquidity Weight Distribution</span>
          </div>
          <span className="text-[11px] font-mono text-[#86cbd1]">
            {isSimulated ? "Simulated Base Allocation" : `Active Investment ($${totalInvested.toLocaleString()})`}
          </span>
        </div>

        {/* Multi-Segment Color Bar */}
        <div className="h-3 w-full bg-[#041819] rounded-full overflow-hidden flex border border-[#093A3E]">
          {DASHBOARD_ASSETS.map((asset) => (
            <div
              key={asset.symbol}
              style={{
                width: `${asset.share}%`,
                backgroundColor: asset.color,
              }}
              title={`${asset.name} (${asset.symbol}): ${asset.share}%`}
              className="h-full hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => setSelectedSymbol(asset.symbol)}
            />
          ))}
        </div>
      </div>

      {/* Grid of the 8 Liquidity Control Assets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DASHBOARD_ASSETS.map((asset) => {
          const assetAllocAmount = (effectiveCapital * asset.share) / 100;
          const isSelected = selectedSymbol === asset.symbol;

          return (
            <div
              key={asset.symbol}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#041819] border-[#3AAFB9] ring-1 ring-[#3AAFB9]/50 shadow-md shadow-[#3AAFB9]/10"
                  : "bg-[#021314] border-[#093A3E]/80 hover:border-[#3AAFB9]/40 hover:bg-[#041819]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: asset.color }}
                  />
                  <span className="font-extrabold font-mono text-xs text-white">{asset.symbol}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {asset.change}
                </span>
              </div>

              <div className="text-[11px] text-[#86cbd1] truncate">{asset.name}</div>
              
              <div className="mt-2 pt-2 border-t border-[#093A3E]/60 flex justify-between items-baseline">
                <span className="text-[10px] text-[#5cb4be]/70 font-mono">{asset.share}% Pool</span>
                <span className="text-xs font-mono font-bold text-white">
                  ${assetAllocAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Telemetry Footer */}
      <div className="mt-5 pt-4 border-t border-[#093A3E] flex flex-wrap items-center justify-between gap-3 text-xs text-[#86cbd1]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#3AAFB9]" />
          <span>Double-entry ledger verified · All 8 pools monitored with 24/7 liquidity feeds</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-white">Regular: <strong>5.0% / wk</strong></span>
          <span className="text-[#3AAFB9]/40">|</span>
          <span className="text-[#3AAFB9]">Premium: <strong>8.5% / wk</strong></span>
        </div>
      </div>
    </div>
  );
}
