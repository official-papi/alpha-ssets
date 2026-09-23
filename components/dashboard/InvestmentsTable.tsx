"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle, Plus, TrendingUp, Eye, Sparkles } from "lucide-react";
import { LivePayoutCounter } from "@/components/dashboard/InvestmentDetailsModal";

interface InvestmentItem {
  id: string;
  planName?: string;
  amount?: number;
  dailyReturn?: number;
  completedPayouts?: number;
  totalPayouts?: number;
  nextPayout?: string;
  status: string;
  invest_amount?: number;
  payout_per_period?: number;
  paid_periods?: number;
  total_payout_periods?: number;
  investment_plans?: { name?: string; badge?: string; capital_back?: boolean };
  next_payout_at?: string;
}

interface InvestmentsTableProps {
  investments?: any[];
  onOpenInvest?: () => void;
  onSelectInvestment?: (inv: any) => void;
}

export default function InvestmentsTable({
  investments = [],
  onOpenInvest,
  onSelectInvestment,
}: InvestmentsTableProps) {
  return (
    <div id="investments" className="bg-white border border-[#d4e7e9] rounded-2xl shadow-xs overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#093A3E]/10 border border-[#093A3E]/20 flex items-center justify-center text-[#093A3E]">
            <TrendingUp className="w-5 h-5 text-[#093A3E]" />
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-[#001011]">Active Investment Portfolio</h2>
            <p className="text-[12px] text-slate-400">Algorithmic yield generation, live countdowns, and progress tracking.</p>
          </div>
        </div>
        <button
          onClick={onOpenInvest}
          className="py-2.5 px-4 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[12px] font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#3AAFB9]" />
          <span>New Investment</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="hm-table">
          <thead>
            <tr>
              <th>Plan</th>
              <th>Capital</th>
              <th>Yield / Period</th>
              <th>Progress</th>
              <th>Next Payout Counter</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {investments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#093A3E]/8 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#093A3E]" />
                    </div>
                    <p className="text-[13px] text-slate-500 font-semibold">No active investments</p>
                    <p className="text-[12px] text-slate-400">Click &ldquo;New Investment&rdquo; to subscribe to a compounding package</p>
                  </div>
                </td>
              </tr>
            ) : (
              investments.map((inv, idx) => {
                const amount = Number(inv.amount ?? inv.invest_amount ?? 0);
                const dailyReturn = Number(inv.dailyReturn ?? inv.payout_per_period ?? 0);
                const completedPayouts = Number(inv.completedPayouts ?? inv.paid_periods ?? 0);
                const totalPayouts = Math.max(1, Number(inv.totalPayouts ?? inv.total_payout_periods ?? 1));
                const progressPct = Math.min(100, Math.max(0, Math.round((completedPayouts / totalPayouts) * 100)));
                const planName = inv.planName || inv.investment_plans?.name || "Investment Package";
                const isActive = inv.status === "active";
                const invId = inv.id ? String(inv.id) : `inv-${idx}`;
                const rawNextPayout = inv.next_payout_at || inv.nextPayoutAt;

                return (
                  <tr key={invId} className="hover:bg-slate-50/70 transition-colors">

                    <td>
                      <div className="font-bold text-[#001011] text-[13px]">{planName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">{invId.slice(0, 8)}…</div>
                    </td>

                    <td>
                      <span className="font-extrabold text-[#001011] font-mono text-[13px]">
                        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td>
                      <span className="text-emerald-600 font-extrabold font-mono text-[13px]">
                        +${dailyReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1 font-medium">/period</span>
                    </td>

                    <td className="w-44">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                        <span>{completedPayouts}/{totalPayouts} payouts</span>
                        <span className="text-[#093A3E] font-bold font-mono">{progressPct}%</span>
                      </div>
                      <div className="hm-progress-track">
                        <div
                          className="hm-progress-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </td>

                    <td>
                      {isActive && rawNextPayout ? (
                        <LivePayoutCounter targetDate={rawNextPayout} />
                      ) : (
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 font-medium font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.nextPayout || "Completed"}</span>
                        </div>
                      )}
                    </td>

                    <td>
                      {isActive ? (
                        <span className="hm-badge hm-badge-success">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : inv.status === "completed" ? (
                        <span className="hm-badge hm-badge-neutral">
                          Completed
                        </span>
                      ) : (
                        <span className="hm-badge hm-badge-danger">
                          <XCircle className="w-3 h-3" />
                          {inv.status || "Inactive"}
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => onSelectInvestment?.(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#093A3E]/8 hover:bg-[#093A3E] hover:text-white text-[#093A3E] font-bold text-[11px] border border-[#093A3E]/20 transition-all cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Overview</span>
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
