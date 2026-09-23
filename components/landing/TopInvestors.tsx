"use client";

import { useState } from "react";
import { Trophy, ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";

const TOP_INVESTORS = [
  { rank: "1st", name: "Alexander Wright", amount: "$486,000.00", badge: "VIP Platinum", flag: "🇺🇸" },
  { rank: "2nd", name: "Sophia Chen",       amount: "$400,000.00", badge: "Gold Executive", flag: "🇸🇬" },
  { rank: "3rd", name: "Marcus Vance",      amount: "$287,000.00", badge: "Gold Executive", flag: "🇬🇧" },
  { rank: "4th", name: "Elena Rostova",     amount: "$250,000.00", badge: "Silver Growth",   flag: "🇩🇪" },
];

const RECENT_TRANSACTIONS = [
  { type: "deposit", user: "0x7f...3a9", amount: "$85,000.00", method: "USDT TRC20", flag: "🇺🇸", time: "2 mins ago" },
  { type: "withdrawal", user: "0x3b...9d1", amount: "$24,500.00", method: "Bitcoin BTC", flag: "🇬🇧", time: "5 mins ago" },
  { type: "deposit", user: "0x9e...1f4", amount: "$50,000.00", method: "Ethereum ETH", flag: "🇩🇪", time: "11 mins ago" },
  { type: "withdrawal", user: "0x5c...4a2", amount: "$18,200.00", method: "USDT TRC20", flag: "🇯🇵", time: "18 mins ago" },
];

export default function TopInvestors() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "live_feed">("leaderboard");

  return (
    <section className="py-24 border-b border-zinc-200/70 relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-14">
          <div>
            <div className="hm-section-label mb-3">
              <span>Live Proof Of Activity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">Leaderboard & Live Ledger Feed</h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-950 font-medium"
              }`}
            >
              Top Investors
            </button>
            <button
              onClick={() => setActiveTab("live_feed")}
              className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                activeTab === "live_feed"
                  ? "bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-950 font-medium"
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
              <div key={idx} className="bg-[#fafafa] border border-zinc-200 rounded-2xl p-6 text-center flex flex-col items-center gap-4 shadow-xs hover:border-zinc-300 transition-all">
                <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center text-lg shadow-2xs">
                  <span>{inv.flag}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-950">{inv.name}</h3>
                  <div className="text-[11px] font-medium text-zinc-500 mt-0.5">{inv.badge}</div>
                </div>
                <div className="w-full bg-white p-3 rounded-xl border border-zinc-200/80">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Capital Invested</div>
                  <div className="text-lg font-bold font-mono text-zinc-950 mt-0.5">{inv.amount}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Live Activity Feed */
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#fafafa] border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span>Investor Wallet</span>
                <span>Gateway Method</span>
                <span>Amount</span>
                <span>Timestamp</span>
              </div>

              {RECENT_TRANSACTIONS.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200/80 text-xs shadow-2xs font-normal">
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{tx.flag}</span>
                    <span className="font-mono font-semibold text-zinc-950">{tx.user}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      tx.type === "deposit" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {tx.type}
                    </span>
                  </div>

                  <span className="font-mono font-medium text-zinc-600">{tx.method}</span>
                  <span className={`font-mono font-bold ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "deposit" ? "+" : "-"}{tx.amount}
                  </span>
                  <span className="text-zinc-400 text-[11px] font-mono">{tx.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
