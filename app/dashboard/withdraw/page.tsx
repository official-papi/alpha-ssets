"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import { ArrowUpRight, History, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

export default function WithdrawPage() {
  const [userEmail, setUserEmail] = useState("");
  const [depositWallet, setDepositWallet] = useState(0);
  const [interestWallet, setInterestWallet] = useState(0);
  const [withdrawLogs, setWithdrawLogs] = useState<any[]>([]);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const fetchWithdrawData = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setUserEmail(activeUser.email);
      const { data: profile } = await supabase.from("profiles").select("deposit_wallet, interest_wallet").eq("id", activeUser.id).single();
      if (profile) {
        setDepositWallet(Number(profile.deposit_wallet || 0));
        setInterestWallet(Number(profile.interest_wallet || 0));
      }

      const { data: logs } = await supabase.from("withdrawals").select("*").eq("user_id", activeUser.id).order("created_at", { ascending: false });
      if (logs) setWithdrawLogs(logs);
    }
  };

  useEffect(() => {
    fetchWithdrawData();
  }, []);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#001011]">Withdraw Funds</h1>
            <p className="text-xs text-slate-500 mt-1">Request payout from your Interest Wallet or Deposit Wallet.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#3AAFB9]" />
            <span>Request Withdrawal</span>
          </button>
        </div>

        {/* Balance Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#093A3E] to-[#3AAFB9]" />
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Interest Wallet (Earnings)</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">${interestWallet.toFixed(2)}</div>
          </div>

          <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#093A3E]" />
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Deposit Wallet</div>
            <div className="text-3xl font-extrabold font-mono text-[#001011] mt-1">${depositWallet.toFixed(2)}</div>
          </div>
        </div>

        {/* Withdraw Logs Table */}
        <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-extrabold text-[#001011] mb-4 flex items-center space-x-2">
            <History className="w-4 h-4 text-[#093A3E]" />
            <span>Withdrawal History Ledger</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Wallet Source</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payout Destination</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                      No withdrawal requests found.
                    </td>
                  </tr>
                ) : (
                  withdrawLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-extrabold text-[#001011] uppercase">{log.wallet_type}</td>
                      <td className="py-3 font-mono font-extrabold text-[#093A3E]">-${Number(log.amount).toFixed(2)}</td>
                      <td className="py-3 font-mono text-slate-500 text-[11px] truncate max-w-[180px]">{log.payout_details || "-"}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          log.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          log.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">{new Date(log.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          interestBalance={interestWallet}
          depositBalance={depositWallet}
          onSuccess={fetchWithdrawData}
        />

      </div>
    </DashboardLayout>
  );
}
