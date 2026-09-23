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
      const res = await fetch("/api/cron/payouts", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        setCronResult({
          text: json.message || `Daily yield payout processed successfully! Active investments updated.`,
          type: "success",
        });
      } else {
        setCronResult({
          text: json.message || json.error || "Failed to process payouts engine.",
          type: "error",
        });
      }
    } catch (err: any) {
      setCronResult({
        text: `Error executing payout engine: ${err.message || "Network error"}`,
        type: "error",
      });
    } finally {
      setCronRunning(false);
      fetchAdminStats();
    }
  };

  const statCards = [
    { label: "Total Registered Users",  value: String(stats.totalUsers),                   sub: "Active platform accounts",                         icon: Users,          href: "/admin/users" },
    { label: "Approved Deposits",       value: `$${stats.totalDeposits.toFixed(2)}`,        sub: stats.pendingDeposits > 0 ? `${stats.pendingDeposits} Pending Review` : "0 Pending Requests", icon: ArrowDownRight, href: "/admin/deposits", alert: stats.pendingDeposits > 0 },
    { label: "Approved Withdrawals",    value: `$${stats.totalWithdrawals.toFixed(2)}`,     sub: stats.pendingWithdrawals > 0 ? `${stats.pendingWithdrawals} Pending Payouts` : "0 Pending Requests", icon: ArrowUpRight, href: "/admin/withdrawals", alert: stats.pendingWithdrawals > 0 },
    { label: "Active Investments",      value: String(stats.activeInvestments),             sub: "Generating interest yields",                        icon: TrendingUp,     href: "/admin/plans" },
  ];

  return (
    <div className="space-y-8">

      {/* Page Header with Cron Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">System Executive Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Platform financial analytics, pending queue, and operational overview.</p>
        </div>

        <button
          type="button"
          disabled={cronRunning}
          onClick={handleRunCron}
          className="hm-btn hm-btn-primary text-xs py-2 px-4 flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <Play className={`w-3.5 h-3.5 ${cronRunning ? "animate-spin" : ""}`} />
          <span>{cronRunning ? "Executing Engine..." : "Run Interest Payout Engine"}</span>
        </button>
      </div>

      {cronResult && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-medium ${
          cronResult.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{cronResult.text}</span>
        </div>
      )}

      {/* Pending Deposits Alert Banner */}
      {stats.pendingDeposits > 0 && (
        <div className="bg-zinc-950 text-white border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xs">
              {stats.pendingDeposits}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{stats.pendingDeposits} Pending Deposit Request{stats.pendingDeposits > 1 ? "s" : ""} Awaiting Review</div>
              <div className="text-xs text-zinc-400 font-normal">Investors have submitted funding receipts that require manual verification and wallet crediting.</div>
            </div>
          </div>
          <Link href="/admin/deposits" className="px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors">
            Review Deposits →
          </Link>
        </div>
      )}

      {/* Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group block">
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-zinc-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider leading-tight">{card.label}</span>
                  <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">{card.value}</div>
                <div className={`text-[11px] mt-1 font-medium ${card.alert ? "text-amber-600" : "text-zinc-400"}`}>{card.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Graph 1: Inflow vs Outflow */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-zinc-700" />
              <span>Cash Inflow vs Outflow</span>
            </h3>
            <span className="text-[10px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">30-Day Trend</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
            {[40, 65, 80, 50, 90, 75, 100].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1 h-full">
                  <div className="bg-zinc-950 w-1/2 rounded-t-xs transition-all" style={{ height: `${val}%` }} title={`Deposits: ${val}%`} />
                  <div className="bg-zinc-300 w-1/2 rounded-t-xs transition-all" style={{ height: `${val * 0.4}%` }} title={`Withdrawals: ${val * 0.4}%`} />
                </div>
                <span className="text-[9px] text-zinc-400 font-mono">W{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 text-[11px] font-medium text-zinc-500 pt-2 border-t border-zinc-100">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-xs bg-zinc-950" />
              <span>Deposits</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-xs bg-zinc-300" />
              <span>Withdrawals</span>
            </div>
          </div>
        </div>

        {/* Graph 2: Investor Registration Curve */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-zinc-700" />
              <span>User Acquisition Growth</span>
            </h3>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">+24% MoM</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
            {[30, 45, 60, 55, 75, 85, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-zinc-900 rounded-t-xs transition-all" style={{ height: `${val}%` }} />
                <span className="text-[9px] text-zinc-400 font-mono">M{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500 text-center pt-2 border-t border-zinc-100 font-normal">
            Steady upward trajectory in active investor accounts.
          </div>
        </div>

        {/* Graph 3: Active Yield Packages */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-zinc-700" />
              <span>Active Yield Packages</span>
            </h3>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Healthy</span>
          </div>

          <div className="h-32 flex items-center justify-center relative">
            <div className="w-24 h-24 rounded-full border-8 border-zinc-950 border-t-emerald-500 border-r-zinc-300 flex items-center justify-center">
              <span className="font-mono tabular-nums font-bold text-zinc-950 text-xs">84% Paid</span>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 font-medium pt-2 border-t border-zinc-100">
            <span>Starter: 45%</span>
            <span>Silver: 35%</span>
            <span>Gold: 20%</span>
          </div>
        </div>

      </div>

      {/* KYC Pending Banner */}
      {stats.pendingKyc > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-amber-700" />
            <div>
              <div className="text-sm font-semibold text-amber-900">{stats.pendingKyc} KYC Verification{stats.pendingKyc > 1 ? "s" : ""} Awaiting Review</div>
              <div className="text-xs text-amber-700 font-normal">Documents submitted by users require manual approval.</div>
            </div>
          </div>
          <Link href="/admin/kyc" className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors">
            Review KYC
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Deposits */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-700" /> Recent Deposits
            </h3>
            <Link href="/admin/deposits" className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold">
              View All ({stats.pendingDeposits} Pending) →
            </Link>
          </div>
          <div className="space-y-2">
            {recentDeposits.length === 0 ? (
              <div className="text-xs text-zinc-400 py-6 text-center">No deposit records found.</div>
            ) : recentDeposits.map((dep: any) => (
              <div key={dep.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
                <div>
                  <div className="font-semibold text-zinc-900 uppercase">{dep.gateway || dep.gateway_name || "USDT TRC20"}</div>
                  <div className="text-[10px] text-zinc-400 font-mono tabular-nums">{dep.transaction_id || dep.trx_id || "—"}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums font-bold text-zinc-950">${Number(dep.amount || dep.final_amount || 0).toFixed(2)}</div>
                  <span className={`text-[10px] font-medium uppercase ${dep.status === "pending" ? "text-amber-600" : dep.status === "approved" ? "text-emerald-600" : "text-rose-600"}`}>
                    {dep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Withdrawals */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-700" /> Recent Withdrawals
            </h3>
            <Link href="/admin/withdrawals" className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold">
              View All ({stats.pendingWithdrawals} Pending) →
            </Link>
          </div>
          <div className="space-y-2">
            {recentWithdrawals.length === 0 ? (
              <div className="text-xs text-zinc-400 py-6 text-center">No withdrawal records found.</div>
            ) : recentWithdrawals.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/60 text-xs">
                <div>
                  <div className="font-semibold text-zinc-900">{w.method_name}</div>
                  <div className="text-[10px] text-zinc-400">{new Date(w.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular-nums font-bold text-zinc-950">${Number(w.net_amount || w.amount || 0).toFixed(2)}</div>
                  <span className={`text-[10px] font-medium uppercase ${w.status === "pending" ? "text-amber-600" : w.status === "approved" ? "text-emerald-600" : "text-rose-600"}`}>
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
