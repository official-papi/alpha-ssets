"use client";

import { useState } from "react";
import { Trophy, ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";

const TOP_INVESTORS = [
  { rank: "1st", name: "Alexander Wright", amount: "$48,500.00", badge: "VIP Platinum", flag: "🇺🇸" },
  { rank: "2nd", name: "Sophia Chen",       amount: "$32,100.00", badge: "Gold Executive", flag: "🇸🇬" },
  { rank: "3rd", name: "Marcus Vance",      amount: "$27,450.00", badge: "Gold Executive", flag: "🇬🇧" },
  { rank: "4th", name: "Elena Rostova",     amount: "$19,800.00", badge: "Silver Growth",   flag: "🇩🇪" },
];

const RECENT_TRANSACTIONS = [
  { type: "deposit", user: "0x7f...3a9", amount: "$5,000.00", method: "USDT TRC20", flag: "🇺🇸", time: "2 mins ago" },
  { type: "withdrawal", user: "0x3b...9d1", amount: "$1,250.00", method: "Bitcoin BTC", flag: "🇬🇧", time: "5 mins ago" },
  { type: "deposit", user: "0x9e...1f4", amount: "$2,500.00", method: "Ethereum ETH", flag: "🇩🇪", time: "11 mins ago" },
  { type: "withdrawal", user: "0x5c...4a2", amount: "$850.00", method: "USDT TRC20", flag: "🇯🇵", time: "18 mins ago" },
];

export default function TopInvestors() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "live_feed">("leaderboard");

  return (
    <section className="py-24 border-b border-white/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-14">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2">Live Proof Of Activity</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Leaderboard & Live Ledger Feed</h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-xs">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Top Investors
            </button>
            <button
              onClick={() => setActiveTab("live_feed")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "live_feed"
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Live Transactions
            </button>
          </div>
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === "leaderboard" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOP_INVESTORS.map((inv, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 to-violet-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 text-center flex flex-col items-center gap-4 shadow-xl shadow-slate-900/5 hover:bg-white/85 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shadow-xs text-lg">
                    <span>{inv.flag}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{inv.name}</h3>
                    <div className="text-[11px] font-extrabold text-indigo-600 mt-0.5">{inv.badge}</div>
                  </div>
                  <div className="w-full bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Capital Invested</div>
                    <div className="text-lg font-black font-mono text-slate-900 mt-0.5">{inv.amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Live Activity Feed */
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/15 to-emerald-500/15 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />

            <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Investor Wallet</span>
                <span>Gateway Method</span>
                <span>Amount</span>
                <span>Timestamp</span>
              </div>

              {RECENT_TRANSACTIONS.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-slate-100/80 text-xs shadow-2xs font-medium">
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{tx.flag}</span>
                    <span className="font-mono font-bold text-slate-900">{tx.user}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      tx.type === "deposit" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {tx.type}
                    </span>
                  </div>

                  <span className="font-mono font-bold text-slate-600">{tx.method}</span>
                  <span className={`font-mono font-black ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "deposit" ? "+" : "-"}{tx.amount}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">{tx.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
