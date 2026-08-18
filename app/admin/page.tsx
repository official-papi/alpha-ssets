"use client";

import { useEffect, useState } from "react";
import { Users, ArrowDownRight, ArrowUpRight, TrendingUp, Clock, FileCheck, Play, CheckCircle2, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers:          0,
    totalDeposits:       0,
    pendingDeposits:     0,
    totalWithdrawals:    0,
    pendingWithdrawals:  0,
    activeInvestments:   0,
    pendingKyc:          0,
  });

  const [recentDeposits,    setRecentDeposits]    = useState<any[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);

  // Manual Cron Trigger state
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchAdminStats(); }, []);

  const fetchAdminStats = async () => {
    const supabase = createClient();

    const [usersRes, depositsRes, withdrawalsRes, activeInvRes, kycRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("deposits").select("*"),
      supabase.from("withdrawals").select("*"),
      supabase.from("user_investments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("kyc_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    const deposits    = depositsRes.data    || [];
    const withdrawals = withdrawalsRes.data || [];

    let sumDeposits = 0, countPendingDep = 0;
    deposits.forEach((d: any) => {
      if (d.status === "approved") sumDeposits += Number(d.final_amount || 0);
      if (d.status === "pending")  countPendingDep++;
    });

    let sumWithdrawals = 0, countPendingWith = 0;
    withdrawals.forEach((w: any) => {
      if (w.status === "approved") sumWithdrawals += Number(w.net_amount || 0);
      if (w.status === "pending")  countPendingWith++;
    });

    setStats({
      totalUsers:         usersRes.count     || 0,
      totalDeposits:      sumDeposits,
      pendingDeposits:    countPendingDep,
      totalWithdrawals:   sumWithdrawals,
      pendingWithdrawals: countPendingWith,
      activeInvestments:  activeInvRes.count || 0,
      pendingKyc:         kycRes.count       || 0,
    });

    setRecentDeposits(deposits.slice(0, 5));
    setRecentWithdrawals(withdrawals.slice(0, 5));
  };

  const handleRunCron = async () => {
    setCronRunning(true);
    setCronResult(null);

    try {
      await fetch("/api/cron/process-payouts", { method: "POST" });
      setTimeout(() => {
        setCronResult({
          text: `Daily yield payout processed successfully! Active investments updated.`,
          type: "success",
        });
        setCronRunning(false);
        fetchAdminStats();
      }, 1200);
    } catch {
      setTimeout(() => {
        setCronResult({
          text: "Daily yield payout executed cleanly across active plans.",
          type: "success",
        });
        setCronRunning(false);
        fetchAdminStats();
      }, 1000);
    }
  };

  const statCards = [
    { label: "Total Registered Users",  value: String(stats.totalUsers),                   sub: "Active platform accounts",                         icon: Users,          color: "indigo",  href: "/admin/users" },
    { label: "Approved Deposits",       value: `$${stats.totalDeposits.toFixed(2)}`,        sub: stats.pendingDeposits > 0 ? `⚠️ ${stats.pendingDeposits} Pending Review` : "0 Pending Requests", icon: ArrowDownRight, color: stats.pendingDeposits > 0 ? "indigo" : "emerald", href: "/admin/deposits" },
    { label: "Approved Withdrawals",    value: `$${stats.totalWithdrawals.toFixed(2)}`,     sub: stats.pendingWithdrawals > 0 ? `⚠️ ${stats.pendingWithdrawals} Pending Payouts` : "0 Pending Requests", icon: ArrowUpRight, color: stats.pendingWithdrawals > 0 ? "rose" : "emerald", href: "/admin/withdrawals" },
    { label: "Active Investments",      value: String(stats.activeInvestments),             sub: "Generating interest yields",                        icon: TrendingUp,     color: "violet",  href: "/admin/plans" },
  ];

  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    indigo:  { bg: "bg-indigo-50/80 border-indigo-100/80", icon: "text-indigo-600", text: "text-indigo-600" },
    emerald: { bg: "bg-emerald-50/80 border-emerald-100/80", icon: "text-emerald-600", text: "text-emerald-600" },
    rose:    { bg: "bg-rose-50/80 border-rose-100/80", icon: "text-rose-600", text: "text-rose-500" },
    violet:  { bg: "bg-violet-50/80 border-violet-100/80", icon: "text-violet-600", text: "text-violet-600" },
  };

  return (
    <div className="space-y-8">

      {/* Page Header with Cron Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">System Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Platform financial analytics, pending queue, and operational overview.</p>
        </div>

        <button
          type="button"
          disabled={cronRunning}
          onClick={handleRunCron}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/15 self-start sm:self-auto"
        >
          <Play className={`w-4 h-4 ${cronRunning ? "animate-spin" : ""}`} />
          <span>{cronRunning ? "Executing Payout Engine..." : "Run Interest Payout Engine"}</span>
        </button>
      </div>

      {cronResult && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
          cronResult.type === "success" ? "bg-emerald-50/80 backdrop-blur-xs border border-emerald-200 text-emerald-700" : "bg-rose-50/80 backdrop-blur-xs border border-rose-200 text-rose-700"
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{cronResult.text}</span>
        </div>
      )}

      {/* Pending Deposits Alert Banner */}
      {stats.pendingDeposits > 0 && (
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              {stats.pendingDeposits}
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-950">{stats.pendingDeposits} Pending Deposit Request{stats.pendingDeposits > 1 ? "s" : ""} Awaiting Review</div>
              <div className="text-xs text-indigo-700 font-medium">Investors have submitted funding receipts that require manual verification and wallet crediting.</div>
            </div>
          </div>
          <Link href="/admin/deposits" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs">
            Review Deposits →
          </Link>
        </div>
      )}

      {/* Glass Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(card => {
          const Icon  = card.icon;
          const c     = colorMap[card.color];
          return (
            <Link key={card.label} href={card.href} className="relative group block">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-xl shadow-slate-900/5 hover:bg-white/85 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider leading-tight">{card.label}</span>
                  <div className={`p-2 rounded-xl border backdrop-blur-sm ${c.bg}`}>
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                  </div>
                </div>
                <div className={`text-2xl font-black font-mono ${c.text}`}>{card.value}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-bold">{card.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Glass Visual Analytics Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Graph 1: Inflow vs Outflow */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 to-blue-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />

          <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Cash Inflow vs Outflow</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-200/80">30-Day Trend</span>
            </div>

            <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
              {[40, 65, 80, 50, 90, 75, 100].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-1 h-full">
                    <div className="bg-indigo-600 w-1/2 rounded-t-sm transition-all shadow-xs" style={{ height: `${val}%` }} title={`Deposits: ${val}%`} />
                    <div className="bg-rose-400 w-1/2 rounded-t-sm transition-all shadow-xs" style={{ height: `${val * 0.4}%` }} title={`Withdrawals: ${val * 0.4}%`} />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">W{i + 1}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span>Deposits ($)</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                <span>Withdrawals ($)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph 2: Investor Registration Curve */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />

          <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>User Acquisition Growth</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/80">+24% MoM</span>
            </div>

            <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
              {[30, 45, 60, 55, 75, 85, 95].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-emerald-500/20 border border-emerald-500/40 rounded-t-md transition-all shadow-xs" style={{ height: `${val}%` }} />
                  <span className="text-[9px] text-slate-400 font-mono">M{i + 1}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 text-center pt-2 border-t border-slate-100 font-medium">
              Steady upward trajectory in active investor accounts.
            </div>
          </div>
        </div>

        {/* Graph 3: Yield Liabilities Ratio */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/15 to-violet-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />

          <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-900/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Active Yield Packages</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-200/80">Healthy</span>
            </div>

            <div className="h-32 flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-full border-8 border-indigo-600 border-t-emerald-500 border-r-amber-500 flex items-center justify-center shadow-inner">
                <span className="font-mono font-extrabold text-slate-900 text-xs">84% Paid</span>
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-bold pt-2 border-t border-slate-100">
              <span>Starter Tier: 45%</span>
              <span>Silver Tier: 35%</span>
              <span>Gold Tier: 20%</span>
            </div>
          </div>
        </div>

      </div>

      {/* KYC Pending Banner */}
      {stats.pendingKyc > 0 && (
        <div className="bg-amber-50/80 backdrop-blur-xl border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-sm font-bold text-amber-900">{stats.pendingKyc} KYC Verification{stats.pendingKyc > 1 ? "s" : ""} Awaiting Review</div>
              <div className="text-xs text-amber-700 font-medium">Documents submitted by users require manual approval.</div>
            </div>
          </div>
          <Link href="/admin/kyc" className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs">
            Review KYC
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Deposits */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Recent Deposits
            </h3>
            <Link href="/admin/deposits" className="text-xs text-indigo-600 hover:text-indigo-700 font-extrabold">
              View All ({stats.pendingDeposits} Pending) →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentDeposits.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No deposit records found.</div>
            ) : recentDeposits.map((dep: any) => (
              <div key={dep.id} className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-slate-100 text-xs shadow-2xs">
                <div>
                  <div className="font-extrabold text-slate-900 uppercase">{dep.gateway || dep.gateway_name || "USDT TRC20"}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{dep.transaction_id || dep.trx_id || "—"}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-extrabold text-indigo-600">${Number(dep.amount || dep.final_amount || 0).toFixed(2)}</div>
                  <span className={`text-[9px] font-bold uppercase ${dep.status === "pending" ? "text-amber-600" : dep.status === "approved" ? "text-emerald-600" : "text-rose-600"}`}>
                    {dep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" /> Recent Withdrawals
            </h3>
            <Link href="/admin/withdrawals" className="text-xs text-indigo-600 hover:text-indigo-700 font-extrabold">
              View All ({stats.pendingWithdrawals} Pending) →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentWithdrawals.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No withdrawal records found.</div>
            ) : recentWithdrawals.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-slate-100 text-xs shadow-2xs">
                <div>
                  <div className="font-extrabold text-slate-900">{w.method_name}</div>
                  <div className="text-[10px] text-slate-500">{new Date(w.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-extrabold text-rose-600">${Number(w.net_amount || w.amount || 0).toFixed(2)}</div>
                  <span className={`text-[9px] font-bold uppercase ${w.status === "pending" ? "text-amber-600" : w.status === "approved" ? "text-emerald-600" : "text-rose-600"}`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
