"use client";

import React from "react";
import { Wallet, TrendingUp, Zap, RefreshCw, ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";

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
      <div className="hm-stat-card hm-stat-brand group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Deposit Wallet</p>
            <p className="text-[26px] font-bold text-zinc-950 tracking-tight font-mono leading-none">
              ${fmt(depositBalance)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-zinc-900">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <button
          onClick={onOpenDeposit}
          className="hm-btn hm-btn-primary w-full text-[12px] py-2 font-medium"
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          Deposit Funds
        </button>
      </div>

      {/* ── Interest Wallet ── */}
      <div className="hm-stat-card hm-stat-success group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Interest Wallet</p>
            <p className="text-[26px] font-bold text-emerald-600 tracking-tight font-mono leading-none">
              ${fmt(interestBalance)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <button
          onClick={onOpenWithdraw}
          className="hm-btn w-full text-[12px] py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Request Payout
        </button>
      </div>

      {/* ── Total Invested ── */}
      <div className="hm-stat-card hm-stat-sky group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Active Capital</p>
            <p className="text-[26px] font-bold text-zinc-950 tracking-tight font-mono leading-none">
              ${fmt(totalInvested)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-zinc-900">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <button
          onClick={onOpenInvest}
          className="hm-btn w-full text-[12px] py-2 bg-zinc-50 text-zinc-800 border border-zinc-200 hover:bg-zinc-100 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Invest In Plan
        </button>
      </div>

      {/* ── Total Payouts ── */}
      <div className="hm-stat-card hm-stat-purple group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total Payouts</p>
            <p className="text-[26px] font-bold text-zinc-950 tracking-tight font-mono leading-none">
              ${fmt(totalWithdrawn)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-zinc-900">
            <RefreshCw className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-normal text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Ledger: <strong className="text-zinc-800 font-semibold">Audited &amp; Verified</strong></span>
        </div>
      </div>

    </div>
  );
}
