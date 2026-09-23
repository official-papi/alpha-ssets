"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, TrendingUp, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, DollarSign, Calendar, Layers } from "lucide-react";

interface InvestmentDetailsModalProps {
  isOpen: boolean;
  investment: any | null;
  onClose: () => void;
}

export function LivePayoutCounter({ targetDate }: { targetDate: string | Date | undefined }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isPast: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const targetTime = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return <span className="text-slate-400 font-mono text-xs">Processing...</span>;
  }

  if (timeLeft.isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold font-mono animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Due for Payout
      </span>
    );
  }

  const format2 = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-2 font-mono font-bold text-xs text-[#093A3E] bg-[#093A3E]/8 border border-[#3AAFB9]/40 px-3 py-1.5 rounded-xl shadow-2xs">
      <Clock className="w-3.5 h-3.5 text-[#3AAFB9] animate-spin shrink-0" style={{ animationDuration: "4s" }} />
      <span>
        {timeLeft.days > 0 ? `${format2(timeLeft.days)}d ` : ""}
        {format2(timeLeft.hours)}h {format2(timeLeft.minutes)}m {format2(timeLeft.seconds)}s
      </span>
    </div>
  );
}

export default function InvestmentDetailsModal({
  isOpen,
  investment,
  onClose,
}: InvestmentDetailsModalProps) {
  if (!isOpen || !investment) return null;

  const amount = Number(investment.amount ?? investment.invest_amount ?? 0);
  const dailyReturn = Number(investment.dailyReturn ?? investment.payout_per_period ?? 0);
  const completedPayouts = Number(investment.completedPayouts ?? investment.paid_periods ?? 0);
  const totalPayouts = Math.max(1, Number(investment.totalPayouts ?? investment.total_payout_periods ?? 1));
  const planName = investment.planName || investment.investment_plans?.name || "Investment Package";
  const badge = investment.badge || investment.investment_plans?.badge || "Active Tier";
  const status = investment.status || "active";
  const isActive = status === "active";
  const capitalBack = investment.capital_back ?? investment.investment_plans?.capital_back ?? true;
  const rawNextPayout = investment.next_payout_at || investment.nextPayoutAt;

  const totalEarnedSoFar = Number(investment.total_profit_earned || (completedPayouts * dailyReturn));
  const totalNetExpectedProfit = dailyReturn * totalPayouts;
  const totalReturnAtMaturity = amount + totalNetExpectedProfit;
  const progressPct = Math.min(100, Math.max(0, Math.round((completedPayouts / totalPayouts) * 100)));

  return (
    <div className="hm-modal-overlay">
      <div className="hm-modal max-w-2xl overflow-hidden p-0 bg-white">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#001011] via-[#093A3E] to-[#001011] p-6 text-white relative border-b border-[#3AAFB9]/30">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#3AAFB9]/20 border border-[#3AAFB9]/40 text-[#3AAFB9] text-[11px] font-extrabold uppercase tracking-wider">
              {badge}
            </span>
            {isActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9] animate-ping" /> Active Compounding
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-300 text-[11px] font-bold">
                {status}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">{planName}</h2>
          <p className="text-slate-300 text-xs mt-1 font-mono">
            Contract Ledger ID: <span className="text-[#3AAFB9] font-bold">{investment.id}</span>
          </p>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Hero Profit Progress Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Yield Realized</span>
                <div className="text-3xl font-mono font-black text-emerald-600 mt-0.5">
                  +${totalEarnedSoFar.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Return at Maturity</span>
                <div className="text-xl font-mono font-black text-[#001011] mt-0.5">
                  ${totalReturnAtMaturity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Payout Progress ({completedPayouts}/{totalPayouts})</span>
                <span className="text-[#093A3E] font-mono font-bold">{progressPct}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#093A3E] to-[#3AAFB9] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Live Payout Countdown Banner */}
          {isActive && (
            <div className="bg-[#001011] border border-[#093A3E] rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/30 text-[#3AAFB9] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Next Scheduled ROI Payout</h4>
                  <p className="text-[11px] text-slate-300 font-medium">Automatic execution direct to Interest Wallet</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Per Period Yield</div>
                  <div className="text-sm font-mono font-black text-emerald-400">+${dailyReturn.toFixed(2)}</div>
                </div>
                <LivePayoutCounter targetDate={rawNextPayout} />
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capital Invested</span>
              <span className="text-sm font-mono font-extrabold text-slate-900 mt-1 block">
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Yield Per Period</span>
              <span className="text-sm font-mono font-extrabold text-emerald-600 mt-1 block">
                +${dailyReturn.toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed Payouts</span>
              <span className="text-sm font-mono font-extrabold text-[#093A3E] mt-1 block">
                {completedPayouts} / {totalPayouts}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capital Refund</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block flex items-center gap-1">
                {capitalBack ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Guaranteed</span>
                  </>
                ) : (
                  <span>Compounded</span>
                )}
              </span>
            </div>
          </div>

          {/* Payout Schedule Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#093A3E]" />
              <span>Investment Yield Schedule Breakdown</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Yield Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {Array.from({ length: totalPayouts }).map((_, idx) => {
                    const periodNum = idx + 1;
                    const isPaid = periodNum <= completedPayouts;
                    const isNext = periodNum === completedPayouts + 1 && isActive;

                    return (
                      <tr key={idx} className={isNext ? "bg-[#093A3E]/6 font-bold" : ""}>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          Period #{periodNum} {isNext && <span className="text-[10px] text-[#093A3E] font-sans font-bold ml-1">(Next Up)</span>}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600 font-bold">
                          +${dailyReturn.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          {isPaid ? (
                            <span className="text-emerald-700 font-sans text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
                            </span>
                          ) : isNext ? (
                            <span className="text-[#093A3E] font-sans text-[11px] font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#3AAFB9] animate-spin" /> Pending Payout
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans text-[11px]">Scheduled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="hm-btn hm-btn-secondary text-xs px-5 py-2.5 cursor-pointer"
            >
              Close Overview
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
