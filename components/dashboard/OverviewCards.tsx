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
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Deposit Wallet</p>
            <p className="text-[28px] font-bold text-slate-900 tracking-tight font-[family-name:var(--font-jakarta)] leading-none">
              ${fmt(depositBalance)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-4.5 h-4.5 text-indigo-600" />
          </div>
        </div>
        <button
          onClick={onOpenDeposit}
          className="hm-btn hm-btn-primary w-full text-[12px] py-2"
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          Deposit Funds
        </button>
      </div>

      {/* ── Interest Wallet ── */}
      <div className="hm-stat-card hm-stat-success group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Interest Wallet</p>
            <p className="text-[28px] font-bold text-emerald-600 tracking-tight font-[family-name:var(--font-jakarta)] leading-none">
              ${fmt(interestBalance)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
          </div>
        </div>
        <button
          onClick={onOpenWithdraw}
          className="hm-btn w-full text-[12px] py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Request Payout
        </button>
      </div>

      {/* ── Total Invested ── */}
      <div className="hm-stat-card hm-stat-sky group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Active Capital</p>
            <p className="text-[28px] font-bold text-slate-900 tracking-tight font-[family-name:var(--font-jakarta)] leading-none">
              ${fmt(totalInvested)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4.5 h-4.5 text-sky-600" />
          </div>
        </div>
        <button
          onClick={onOpenInvest}
          className="hm-btn w-full text-[12px] py-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Invest In Plan
        </button>
      </div>

      {/* ── Total Payouts ── */}
      <div className="hm-stat-card hm-stat-purple group hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Payouts</p>
            <p className="text-[28px] font-bold text-violet-700 tracking-tight font-[family-name:var(--font-jakarta)] leading-none">
              ${fmt(totalWithdrawn)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4.5 h-4.5 text-violet-600" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Ledger: <strong className="text-slate-700">Audited &amp; Verified</strong></span>
        </div>
      </div>

    </div>
  );
}
