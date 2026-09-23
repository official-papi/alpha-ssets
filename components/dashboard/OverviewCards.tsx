"use client";

import React from "react";
import { Wallet, TrendingUp, Zap, RefreshCw, ArrowDownRight, ArrowUpRight, Plus, ShieldCheck } from "lucide-react";

interface OverviewCardsProps {
  depositBalance?: number;
  interestBalance?: number;
  totalInvested?: number;
  totalWithdrawn?: number;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenInvest?: () => void;
}

export default function OverviewCards({
  depositBalance = 0,
  interestBalance = 0,
  totalInvested = 0,
  totalWithdrawn = 0,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenInvest,
}: OverviewCardsProps) {
  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      {/* ── Deposit Wallet ── */}
      <div className="bg-white border border-[#d4e7e9] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#093A3E]/40 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#093A3E]" />
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit Wallet</p>
              <p className="text-[26px] font-extrabold text-[#001011] tracking-tight font-mono leading-none">
                ${fmt(depositBalance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#093A3E]/8 border border-[#093A3E]/15 flex items-center justify-center flex-shrink-0 text-[#093A3E] group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mb-4">Available liquid capital for investments</p>
        </div>
        <button
          onClick={onOpenDeposit}
          className="w-full py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-[#3AAFB9]" />
          <span>Deposit Funds</span>
        </button>
      </div>

      {/* ── Interest Wallet ── */}
      <div className="bg-white border border-[#d4e7e9] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#3AAFB9] transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#093A3E] to-[#3AAFB9]" />
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interest Earnings</p>
              <p className="text-[26px] font-extrabold text-emerald-600 tracking-tight font-mono leading-none">
                ${fmt(interestBalance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#3AAFB9]/10 border border-[#3AAFB9]/25 flex items-center justify-center flex-shrink-0 text-[#093A3E] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-[#3AAFB9]" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mb-4">Realized yield ready for payout or transfer</p>
        </div>
        <button
          onClick={onOpenWithdraw}
          className="w-full py-2.5 rounded-xl bg-[#f0f8f9] hover:bg-[#3AAFB9]/15 text-[#093A3E] border border-[#3AAFB9]/30 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-[#3AAFB9]" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* ── Total Invested ── */}
      <div className="bg-white border border-[#d4e7e9] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#093A3E]/40 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#001011]" />
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Capital</p>
              <p className="text-[26px] font-extrabold text-[#001011] tracking-tight font-mono leading-none">
                ${fmt(totalInvested)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-800 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-[#093A3E]" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mb-4">Capital locked in automated compounding</p>
        </div>
        <button
          onClick={onOpenInvest}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-[#3AAFB9]/40 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#093A3E]" />
          <span>Invest In Plan</span>
        </button>
      </div>

      {/* ── Total Payouts ── */}
      <div className="bg-white border border-[#d4e7e9] rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#3AAFB9] transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#3AAFB9]" />
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Payouts</p>
              <p className="text-[26px] font-extrabold text-[#001011] tracking-tight font-mono leading-none">
                ${fmt(totalWithdrawn)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-800 group-hover:scale-105 transition-transform">
              <RefreshCw className="w-5 h-5 text-[#3AAFB9]" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mb-4">Total principal and profit settled</p>
        </div>
        <div className="w-full py-2.5 rounded-xl bg-[#001011] text-[#3AAFB9] border border-[#093A3E] text-[11px] font-bold flex items-center justify-center gap-2 tracking-wide font-mono shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#3AAFB9] inline-block animate-pulse" />
          <span>AUDITED LEDGER · VERIFIED</span>
        </div>
      </div>

    </div>
  );
}
