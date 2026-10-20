"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
  Lock,
  PieChart,
  Check,
  TrendingUp,
} from "lucide-react";

interface LiquidityAsset {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change24h: string;
  isPositive: boolean;
  allocationPercent: number;
  liquidityDepth: string;
  network: string;
  status: "Active & Liquid" | "Vault Escrowed" | "Multi-Sig Stored";
  description: string;
  accentColor: string;
}

const LIQUIDITY_ASSETS: LiquidityAsset[] = [
  {
    id: "xrp",
    name: "XRP",
    symbol: "XRP",
    price: "$2.48",
    change24h: "+4.12%",
    isPositive: true,
    allocationPercent: 12,
    liquidityDepth: "$46.1M Liquidity",
    network: "XRPL Ledger",
    status: "Active & Liquid",
    description: "Cross-border liquidity bridge for instant settlement and zero-friction execution.",
    accentColor: "#23292F",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    price: "$3,425.50",
    change24h: "+2.15%",
    isPositive: true,
    allocationPercent: 18,
    liquidityDepth: "$69.2M Liquidity",
    network: "Ethereum Mainnet",
    status: "Active & Liquid",
    description: "Smart contract liquidity pool base facilitating high-yield DeFi algorithmic execution.",
    accentColor: "#627EEA",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    price: "$96,480.00",
    change24h: "+3.42%",
    isPositive: true,
    allocationPercent: 22,
    liquidityDepth: "$84.6M Liquidity",
    network: "Bitcoin Native",
    status: "Active & Liquid",
    description: "Core digital store of value and macro reserve anchoring portfolio liquidity.",
    accentColor: "#F7931A",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    price: "$214.80",
    change24h: "+5.78%",
    isPositive: true,
    allocationPercent: 14,
    liquidityDepth: "$53.8M Liquidity",
    network: "Solana POS V2",
    status: "Active & Liquid",
    description: "High-frequency sub-second micro-arbitrage channel capturing rapid market spreads.",
    accentColor: "#14F195",
  },
  {
    id: "nvda",
    name: "Nvidia",
    symbol: "NVDA",
    price: "$142.60",
    change24h: "+3.85%",
    isPositive: true,
    allocationPercent: 11,
    liquidityDepth: "$42.3M Liquidity",
    network: "NASDAQ / FinTech Custody",
    status: "Vault Escrowed",
    description: "AI silicon infrastructure equity exposure delivering algorithmic growth returns.",
    accentColor: "#76B900",
  },
  {
    id: "aapl",
    name: "Apple",
    symbol: "AAPL",
    price: "$234.90",
    change24h: "+1.20%",
    isPositive: true,
    allocationPercent: 9,
    liquidityDepth: "$34.6M Liquidity",
    network: "NASDAQ / Prime Brokerage",
    status: "Vault Escrowed",
    description: "Megacap cashflow anchor balancing risk mitigation with stable institutional capital yield.",
    accentColor: "#A2AAAD",
  },
  {
    id: "tsla",
    name: "Tesla",
    symbol: "TSLA",
    price: "$228.40",
    change24h: "+4.65%",
    isPositive: true,
    allocationPercent: 6,
    liquidityDepth: "$23.1M Liquidity",
    network: "NASDAQ / Derivatives Vault",
    status: "Vault Escrowed",
    description: "High-volatility autonomous tech strategy capturing dynamic market upside.",
    accentColor: "#E82127",
  },
  {
    id: "atfc",
    name: "American Trust Fund Coin",
    symbol: "ATFC",
    price: "$1.00",
    change24h: "+0.00%",
    isPositive: true,
    allocationPercent: 8,
    liquidityDepth: "$30.8M Liquidity",
    network: "Cold Escrow Ledger",
    status: "Multi-Sig Stored",
    description: "1:1 sovereign trust reserve asset providing private institutional escrow security.",
    accentColor: "#3AAFB9",
  },
];

export default function LiquidityControlSection() {
  const [selectedAsset, setSelectedAsset] = useState<LiquidityAsset>(LIQUIDITY_ASSETS[0]);

  return (
    <section className="py-20 bg-[#001011] relative overflow-hidden border-b border-[#093A3E] text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#093A3E_0%,transparent_65%)] pointer-events-none opacity-50" />
      <div className="absolute -right-40 top-40 w-96 h-96 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093A3E]/80 border border-[#3AAFB9]/40 text-xs font-semibold text-[#b5dfe3] shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#3AAFB9] animate-pulse" />
            <span>Liquidity Control Hub</span>
            <span className="text-[#3AAFB9]/40">|</span>
            <span className="text-[#3AAFB9] font-mono">8 Core Channels</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            The Space for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#b5dfe3] to-[#3AAFB9]">
              Liquidity Control
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#86cbd1] font-normal leading-relaxed">
            Liquidity is governed across 8 selected channels to back your <strong>Regular (5.0% weekly)</strong> and <strong>Premium (8.5% weekly)</strong> returns:
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#b5dfe3]">
            {["XRP", "Ethereum", "Bitcoin", "Solana", "Nvidia", "Apple", "Tesla", "American Trust Fund Coin"].map((name, idx) => (
              <span key={idx} className="bg-[#041819] px-3 py-1 rounded-lg border border-[#093A3E] text-white font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9]" />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* 8-Asset Live Grid in Exact Specified Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {LIQUIDITY_ASSETS.map((asset, i) => {
            const isSelected = selectedAsset.id === asset.id;

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden border flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#041819] border-[#3AAFB9] shadow-xl shadow-[#3AAFB9]/10 ring-1 ring-[#3AAFB9]"
                    : "bg-[#021314] border-[#093A3E] hover:border-[#3AAFB9]/60 hover:bg-[#041819]"
                }`}
              >
                <div>
                  {/* Number Badge & Symbol */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-xs border shadow-sm"
                        style={{
                          backgroundColor: "#001011",
                          borderColor: asset.accentColor,
                          color: asset.accentColor,
                        }}
                      >
                        {asset.symbol.slice(0, 4)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{asset.name}</h4>
                        <div className="text-[10px] text-[#86cbd1] font-mono">{asset.network}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#093A3E] text-[#3AAFB9] border border-[#3AAFB9]/30">
                      #{i + 1}
                    </span>
                  </div>

                  {/* Price & 24h Change */}
                  <div className="flex items-baseline justify-between mb-3 py-2 px-3 rounded-xl bg-[#001011] border border-[#093A3E]">
                    <span className="text-base font-black font-mono text-white">{asset.price}</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {asset.change24h}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[#86cbd1] leading-relaxed mb-4 min-h-[36px]">
                    {asset.description}
                  </p>
                </div>

                {/* Pool Allocation & Status */}
                <div className="pt-3 border-t border-[#093A3E]/70 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#86cbd1]">Liquidity Share</span>
                    <span className="font-mono font-bold text-[#3AAFB9]">{asset.allocationPercent}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#001011] rounded-full overflow-hidden border border-[#093A3E]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${asset.allocationPercent * 4}%`,
                        backgroundColor: asset.accentColor,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-400 font-mono">{asset.liquidityDepth}</span>
                    <span className="text-[#3AAFB9] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9]" />
                      {asset.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Summary & Action Banner */}
        <div className="bg-[#041819] border border-[#093A3E] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#3AAFB9]">
              <ShieldCheck className="w-4 h-4 text-[#3AAFB9]" />
              <span>Full Double-Entry Ledger Custody</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Ready to deploy capital across these 8 liquidity pools?
            </h3>
            <p className="text-xs text-[#86cbd1]">
              Select between our <strong>Regular Package (5.0% / week)</strong> or <strong>Premium Package (8.5% / week)</strong> with instant automated weekly payouts.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/plans"
              className="px-6 py-3 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white border border-[#3AAFB9]/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-[#3AAFB9] w-full md:w-auto"
            >
              <span>View Plans</span>
            </Link>

            <Link
              href="/register"
              className="px-7 py-3 rounded-xl bg-[#3AAFB9] hover:bg-[#5cb4be] text-[#001011] text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3AAFB9]/25 cursor-pointer w-full md:w-auto"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
