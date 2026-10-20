"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
  Lock,
  PieChart,
  Check,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface LiquidityAsset {
  id: string;
  name: string;
  symbol: string;
  category: "crypto" | "equity" | "trust";
  categoryLabel: string;
  price: string;
  change24h: string;
  isPositive: boolean;
  allocationPercent: number;
  liquidityDepth: string;
  network: string;
  reserveStatus: "Active & Liquid" | "Vault Escrowed" | "Multi-Sig Stored";
  description: string;
  accentColor: string;
  bgGlow: string;
}

const LIQUIDITY_ASSETS: LiquidityAsset[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    category: "crypto",
    categoryLabel: "Core Crypto Reserve",
    price: "$96,480.00",
    change24h: "+3.42%",
    isPositive: true,
    allocationPercent: 22,
    liquidityDepth: "$84.6M Depth",
    network: "Bitcoin Native",
    reserveStatus: "Active & Liquid",
    description: "Primary store of value foundation providing macro hedge security and global liquidity clearance.",
    accentColor: "#F7931A",
    bgGlow: "rgba(247, 147, 26, 0.12)",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    category: "crypto",
    categoryLabel: "Smart Contract Liquidity",
    price: "$3,425.50",
    change24h: "+2.15%",
    isPositive: true,
    allocationPercent: 18,
    liquidityDepth: "$69.2M Depth",
    network: "Ethereum Mainnet",
    reserveStatus: "Active & Liquid",
    description: "DeFi algorithmic yield farming base and automated automated escrow settlement rail.",
    accentColor: "#627EEA",
    bgGlow: "rgba(98, 126, 234, 0.12)",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    category: "crypto",
    categoryLabel: "High-Frequency Speed",
    price: "$214.80",
    change24h: "+5.78%",
    isPositive: true,
    allocationPercent: 14,
    liquidityDepth: "$53.8M Depth",
    network: "Solana POS V2",
    reserveStatus: "Active & Liquid",
    description: "Sub-second cross-dex micro-arbitrage execution engine capitalizing on fractional spreads.",
    accentColor: "#14F195",
    bgGlow: "rgba(20, 241, 149, 0.12)",
  },
  {
    id: "xrp",
    name: "XRP (Ripple)",
    symbol: "XRP",
    category: "crypto",
    categoryLabel: "Cross-Border Liquidity",
    price: "$2.48",
    change24h: "+4.12%",
    isPositive: true,
    allocationPercent: 12,
    liquidityDepth: "$46.1M Depth",
    network: "XRPL Ledger",
    reserveStatus: "Active & Liquid",
    description: "Institutional cross-border corridor settlement vehicle ensuring instant liquidity without pre-funding delays.",
    accentColor: "#23292F",
    bgGlow: "rgba(58, 175, 185, 0.15)",
  },
  {
    id: "nvda",
    name: "Nvidia Corp",
    symbol: "NVDA",
    category: "equity",
    categoryLabel: "AI Silicon Infrastructure",
    price: "$142.60",
    change24h: "+3.85%",
    isPositive: true,
    allocationPercent: 11,
    liquidityDepth: "$42.3M Depth",
    network: "NASDAQ / FinTech Custody",
    reserveStatus: "Vault Escrowed",
    description: "Direct equity-backed liquidity exposure driving algorithmic AI model training and tech growth dividends.",
    accentColor: "#76B900",
    bgGlow: "rgba(118, 185, 0, 0.12)",
  },
  {
    id: "aapl",
    name: "Apple Inc.",
    symbol: "AAPL",
    category: "equity",
    categoryLabel: "Megacap Cashflow Anchor",
    price: "$234.90",
    change24h: "+1.20%",
    isPositive: true,
    allocationPercent: 9,
    liquidityDepth: "$34.6M Depth",
    network: "NASDAQ / Prime Brokerage",
    reserveStatus: "Vault Escrowed",
    description: "Ultra-defensive cash position hedge balancing capital preservation with steady consumer tech returns.",
    accentColor: "#A2AAAD",
    bgGlow: "rgba(162, 170, 173, 0.12)",
  },
  {
    id: "tsla",
    name: "Tesla Inc.",
    symbol: "TSLA",
    category: "equity",
    categoryLabel: "EV & Tech Volatility Yield",
    price: "$228.40",
    change24h: "+4.65%",
    isPositive: true,
    allocationPercent: 6,
    liquidityDepth: "$23.1M Depth",
    network: "NASDAQ / Derivatives Vault",
    reserveStatus: "Vault Escrowed",
    description: "Volatility capture strategies executing high-frequency hedged straddles for compounding interest.",
    accentColor: "#E82127",
    bgGlow: "rgba(232, 33, 39, 0.12)",
  },
  {
    id: "atfc",
    name: "American Trust Fund Coin",
    symbol: "ATFC",
    category: "trust",
    categoryLabel: "Institutional Trust Reserve",
    price: "$1.00",
    change24h: "+0.00%",
    isPositive: true,
    allocationPercent: 8,
    liquidityDepth: "$30.8M Depth",
    network: "Cold Escrow Ledger",
    reserveStatus: "Multi-Sig Stored",
    description: "Pegged collateral escrow token backed 1:1 by segregated institutional sovereign trust treasury securities.",
    accentColor: "#3AAFB9",
    bgGlow: "rgba(58, 175, 185, 0.22)",
  },
];

export default function LiquidityControlSection() {
  const [filter, setFilter] = useState<"all" | "crypto" | "equity" | "trust">("all");
  const [selectedAsset, setSelectedAsset] = useState<LiquidityAsset>(LIQUIDITY_ASSETS[0]);
  const [testAmount, setTestAmount] = useState<number>(10000);

  const filteredAssets = LIQUIDITY_ASSETS.filter(
    (a) => filter === "all" || a.category === filter
  );

  const totalPool = "$384,500,000";

  return (
    <section className="py-20 bg-[#001011] relative overflow-hidden border-b border-[#093A3E] text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#093A3E_0%,transparent_60%)] pointer-events-none opacity-40" />
      <div className="absolute -left-40 top-40 w-96 h-96 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093A3E]/80 border border-[#3AAFB9]/40 text-xs font-semibold text-[#b5dfe3] shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#3AAFB9] animate-pulse" />
              <span>Multi-Asset Liquidity Architecture</span>
              <span className="text-[#3AAFB9]/40">|</span>
              <span className="text-[#3AAFB9] font-mono">8 Dynamic Pools</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              The Space for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#b5dfe3] to-[#3AAFB9]">
                Liquidity Control
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#86cbd1] font-normal leading-relaxed">
              Capital deployed across the <strong>Regular (5% weekly)</strong> and <strong>Premium (8.5% weekly)</strong> packages is automatically governed across our 8 institutional liquidity pools. Monitor live depth, reserve ratios, and algorithmic capital routing in real time.
            </p>
          </div>

          {/* Metric Pill Badge */}
          <div className="flex items-center gap-4 bg-[#041819] border border-[#093A3E] p-4 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 flex items-center justify-center text-[#3AAFB9]">
              <PieChart className="w-6 h-6 text-[#3AAFB9]" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#86cbd1]">Total Managed Liquidity</div>
              <div className="text-2xl font-black font-mono text-white tracking-tight">{totalPool}</div>
              <div className="text-[10px] text-[#3AAFB9] font-semibold flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" /> 100% Backed & Instant Settlement
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#093A3E]/80 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All 8 Assets" },
              { id: "crypto", label: "Cryptocurrencies (4)" },
              { id: "equity", label: "US Tech & Megacap (3)" },
              { id: "trust", label: "American Trust Fund Coin (1)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === t.id
                    ? "bg-[#3AAFB9] text-[#001011] shadow-md shadow-[#3AAFB9]/20"
                    : "bg-[#041819] text-[#86cbd1] border border-[#093A3E] hover:border-[#3AAFB9]/50 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#86cbd1]">
            <Activity className="w-3.5 h-3.5 text-[#3AAFB9]" />
            <span className="font-mono text-[11px]">Realtime Oracle Feeds Active</span>
          </div>
        </div>

        {/* Main Grid: 8 Assets Grid + Interactive Liquidity Router HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Asset Cards Grid (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.id === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden border ${
                    isSelected
                      ? "bg-[#041819] border-[#3AAFB9] shadow-xl shadow-[#3AAFB9]/10 ring-1 ring-[#3AAFB9]"
                      : "bg-[#021314] border-[#093A3E] hover:border-[#3AAFB9]/60 hover:bg-[#041819]"
                  }`}
                >
                  {/* Top Bar with Symbol & Price */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-sm border shadow-sm"
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
                        <div className="text-[10px] text-[#86cbd1] font-medium">{asset.categoryLabel}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black font-mono text-white">{asset.price}</div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {asset.change24h}
                      </span>
                    </div>
                  </div>

                  {/* Allocation & Depth Meter */}
                  <div className="space-y-1.5 pt-2 border-t border-[#093A3E]/60">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#86cbd1] text-[10px] uppercase font-bold tracking-wider">Pool Weight</span>
                      <span className="font-mono font-bold text-[#3AAFB9]">{asset.allocationPercent}%</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-[#001011] rounded-full overflow-hidden border border-[#093A3E]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${asset.allocationPercent * 4}%`,
                          backgroundColor: asset.accentColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Bottom Network & Status Tag */}
                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <span className="text-[#5cb4be]/80 font-mono truncate max-w-[130px]">{asset.network}</span>
                    <span className="inline-flex items-center gap-1 text-[#3AAFB9] bg-[#093A3E]/80 px-2 py-0.5 rounded font-medium border border-[#3AAFB9]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9]" />
                      {asset.reserveStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Interactive Liquidity Telemetry & Allocation HUD (5 Cols) */}
          <div className="lg:col-span-5 bg-[#041819] border border-[#093A3E] rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            
            {/* Header of HUD */}
            <div className="flex items-center justify-between pb-4 border-b border-[#093A3E] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#093A3E] text-[#3AAFB9] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-[#3AAFB9]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Liquidity Router</h3>
                  <div className="text-[10px] text-[#86cbd1]">Deterministic Portfolio Execution</div>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-md bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] font-mono text-[10px] font-bold">
                ESCROW V2.4
              </div>
            </div>

            {/* Selected Asset Spotlight */}
            <div className="p-4 rounded-2xl bg-[#001011] border border-[#093A3E] mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedAsset.accentColor }}
                  />
                  <span className="text-sm font-extrabold text-white">{selectedAsset.name} ({selectedAsset.symbol})</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#3AAFB9] bg-[#093A3E] px-2 py-0.5 rounded">
                  {selectedAsset.liquidityDepth}
                </span>
              </div>

              <p className="text-xs text-[#b5dfe3] leading-relaxed">
                {selectedAsset.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#093A3E] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#86cbd1] block">Clearing Network</span>
                  <span className="font-bold text-white">{selectedAsset.network}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#86cbd1] block">Liquidity Cushion</span>
                  <span className="font-bold text-emerald-400">Overcollateralized 135%</span>
                </div>
              </div>
            </div>

            {/* Interactive Investment Allocation Slider */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#86cbd1] font-bold">Simulate Capital Allocation:</span>
                <span className="text-base font-black font-mono text-[#3AAFB9]">
                  ${testAmount.toLocaleString()} USD
                </span>
              </div>

              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full accent-[#3AAFB9] bg-[#001011] rounded-lg h-2 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-[#5cb4be]/70 font-mono">
                <span>$500 (Min Regular)</span>
                <span>$20,000 (Premium Entry)</span>
                <span>$100,000+</span>
              </div>

              {/* Dynamic Route Breakdown for this amount */}
              <div className="p-3.5 bg-[#021314] rounded-xl border border-[#093A3E] space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-[#093A3E]/60">
                  <span className="text-[#86cbd1]">Target Yield Tier</span>
                  <span className="font-bold font-mono text-white">
                    {testAmount >= 20000 ? "Premium Package (8.5% / Week)" : "Regular Package (5.0% / Week)"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#86cbd1]">Estimated Weekly Return</span>
                  <span className="font-bold font-mono text-emerald-400">
                    +${(testAmount * (testAmount >= 20000 ? 0.085 : 0.05)).toLocaleString(undefined, { minimumFractionDigits: 2 })} / week
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#86cbd1]">Capital in {selectedAsset.symbol} Pool</span>
                  <span className="font-bold font-mono text-[#3AAFB9]">
                    ${((testAmount * selectedAsset.allocationPercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({selectedAsset.allocationPercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* CTA to Start Investing */}
            <div className="space-y-3">
              <Link
                href="/register"
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 bg-[#3AAFB9] hover:bg-[#5cb4be] text-[#001011] transition-all shadow-lg shadow-[#3AAFB9]/25 cursor-pointer"
              >
                <span>Deploy Liquidity Into {testAmount >= 20000 ? "Premium" : "Regular"} Plan</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#86cbd1]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3AAFB9]" />
                <span>Instant automated withdrawals & double-entry ledger guarantee</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
