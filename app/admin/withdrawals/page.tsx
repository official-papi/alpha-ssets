"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, XCircle, Clock, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("withdrawals")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false });

    if (data) setWithdrawals(data);
  };

  const handleApprove = async (withdrawalId: string) => {
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    await supabase.from("withdrawals").update({
      status: "approved",
      admin_feedback: feedback || "Withdrawal payout sent successfully",
      updated_at: new Date().toISOString(),
    }).eq("id", withdrawalId);

    setMsg({ text: "Withdrawal approved and completed!", type: "success" });
    setTimeout(() => {
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    }, 1200);
    setSubmitting(false);
  };

  const handleReject = async (withdrawalId: string) => {
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const withObj = withdrawals.find((w) => w.id === withdrawalId);

    if (withObj) {
      const refundAmount = Number(withObj.amount || withObj.net_amount || 0);
      const userId = withObj.user_id;

      // Update withdrawal status to rejected
      await supabase.from("withdrawals").update({
        status: "rejected",
        admin_feedback: feedback || "Invalid payout details or failed verification",
        updated_at: new Date().toISOString(),
      }).eq("id", withdrawalId);

      // Refund user's interest wallet
      const { data: profile } = await supabase.from("profiles").select("interest_wallet").eq("id", userId).single();
      const currentInterest = Number(profile?.interest_wallet || 0);
      const newInterest = currentInterest + refundAmount;

      await supabase.from("profiles").update({ interest_wallet: newInterest }).eq("id", userId);

      // Log transaction entry
      await supabase.from("wallet_transactions").insert({
        user_id: userId,
        type: "withdraw_refund",
        amount: refundAmount,
        wallet_type: "interest_wallet",
        description: `Refunded rejected withdrawal of $${refundAmount.toFixed(2)}`,
      });
    }

    setMsg({ text: "Withdrawal rejected and funds refunded to user interest wallet.", type: "success" });
    setTimeout(() => {
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    }, 1200);
    setSubmitting(false);
  };

  const filteredWithdrawals = withdrawals.filter((w) =>
    filterStatus === "all" ? true : w.status === filterStatus
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Withdrawal Payout Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Process investor payout requests and verify target wallet addresses.</p>
        </div>

        <div className="flex items-center space-x-2">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
                filterStatus === status ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="minimal-card p-6 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Investor</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Amount Requested</th>
                <th className="pb-3">Net Payout</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No withdrawal records matching filter.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{w.profiles?.full_name || "Investor"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{w.profiles?.email}</div>
                    </td>
                    <td className="py-3 font-extrabold text-slate-900">{w.method_name || w.wallet_type || "Crypto"}</td>
                    <td className="py-3 font-mono font-bold text-slate-700">${Number(w.amount || 0).toFixed(2)}</td>
                    <td className="py-3 font-mono font-bold text-indigo-600">${Number(w.net_amount || w.amount || 0).toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        w.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        w.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">{new Date(w.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWithdrawal(w);
                          setFeedback("");
                          setMsg(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Process Payout
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Payout Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Process Withdrawal Request</h3>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Investor:</span>
                <span className="font-extrabold text-slate-900">{selectedWithdrawal.profiles?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-extrabold text-slate-900">{selectedWithdrawal.method_name || "Crypto Payout"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Amount to Transfer:</span>
                <span className="font-mono font-extrabold text-indigo-600">${Number(selectedWithdrawal.net_amount || selectedWithdrawal.amount || 0).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1 font-semibold">Target Account / Wallet Details:</span>
                <pre className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-900 whitespace-pre-wrap select-all">
                  {typeof selectedWithdrawal.account_details === "object"
                    ? JSON.stringify(selectedWithdrawal.account_details, null, 2)
                    : selectedWithdrawal.account_details || selectedWithdrawal.payout_details || "-"}
                </pre>
              </div>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{msg.text}</span>
              </div>
            )}

            {selectedWithdrawal.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Admin Transaction Note / Payout Reference</label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Transaction hash or payout reference..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReject(selectedWithdrawal.id)}
                    className="py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    {submitting ? "Processing..." : "Reject & Refund"}
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleApprove(selectedWithdrawal.id)}
                    className="py-2.5 rounded-xl text-xs font-bold minimal-btn-primary cursor-pointer shadow-md shadow-indigo-600/15"
                  >
                    {submitting ? "Processing..." : "Approve & Mark Paid"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
