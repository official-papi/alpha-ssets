"use client";

import React from "react";
import { Clock, CheckCircle2, XCircle, Plus, TrendingUp } from "lucide-react";

interface InvestmentItem {
  id: string;
  planName: string;
  amount: number;
  dailyReturn: number;
  completedPayouts: number;
  totalPayouts: number;
  nextPayout: string;
  status: string;
}

interface InvestmentsTableProps {
  investments?: InvestmentItem[];
  onOpenInvest?: () => void;
}

export default function InvestmentsTable({
  investments = [],
  onOpenInvest,
}: InvestmentsTableProps) {
  return (
    <div id="investments" className="hm-card overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Active Investment Portfolio</h2>
            <p className="text-[12px] text-slate-400">Real-time tracking for active yield-generating plans.</p>
          </div>
        </div>
        <button
          onClick={onOpenInvest}
          className="hm-btn hm-btn-primary text-[12px] py-2 px-4 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          New Investment
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
              <th>Next Payout</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-[13px] text-slate-400 font-medium">No active investments</p>
                    <p className="text-[12px] text-slate-300">Click &ldquo;New Investment&rdquo; to subscribe to a plan</p>
                  </div>
                </td>
              </tr>
            ) : (
              investments.map((inv) => {
                const progressPct = Math.min(100, Math.round((inv.completedPayouts / inv.totalPayouts) * 100));
                const isActive = inv.status === "active";
                return (
                  <tr key={inv.id}>

                    <td>
                      <div className="font-semibold text-slate-900 text-[13px]">{inv.planName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">{inv.id.slice(0, 8)}…</div>
                    </td>

                    <td>
                      <span className="font-semibold text-slate-900 font-mono text-[13px]">
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    <td>
                      <span className="text-emerald-600 font-semibold font-mono text-[13px]">
                        +${inv.dailyReturn.toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1">/day</span>
                    </td>

                    <td className="w-48">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                        <span>{inv.completedPayouts}/{inv.totalPayouts} payouts</span>
                        <span className="text-indigo-600 font-semibold">{progressPct}%</span>
                      </div>
                      <div className="hm-progress-track">
                        <div
                          className="hm-progress-fill"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{inv.nextPayout}</span>
                      </div>
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
                          {inv.status}
                        </span>
                      )}
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
