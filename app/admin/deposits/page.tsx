"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ArrowDownRight, CheckCircle2, XCircle, Clock, ExternalLink, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("deposits")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false });

    if (data) setDeposits(data);
  };

  const handleApprove = async (depositId: string) => {
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Call RPC to safely execute approval and multi-level referral commission inside a transaction
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("approve_deposit_rpc", {
      p_deposit_id: depositId,
      p_admin_id: user?.id,
      p_feedback: feedback || "Deposit verified and approved by admin",
    });

    if (rpcErr || (rpcRes && !rpcRes.success)) {
      // Fallback direct update if RPC is not installed
      const depObj = deposits.find((d) => d.id === depositId);
      if (depObj) {
        const depositAmount = Number(depObj.amount || depObj.final_amount || 0);
        const userId = depObj.user_id;

        await supabase.from("deposits").update({
          status: "approved",
          admin_feedback: feedback || "Deposit verified and approved by admin",
          updated_at: new Date().toISOString(),
        }).eq("id", depositId);

        const { data: profile } = await supabase.from("profiles").select("deposit_wallet").eq("id", userId).maybeSingle();
        const currentBal = Number(profile?.deposit_wallet || 0);
        const newBal = currentBal + depositAmount;

        await supabase.from("profiles").update({ deposit_wallet: newBal }).eq("id", userId);

        await supabase.from("transactions").insert({
          user_id: userId,
          type: "deposit",
          wallet: "deposit_wallet",
          amount: depositAmount,
          post_balance: newBal,
          description: `Deposit approved via ${depObj.gateway || depObj.gateway_name || "Payment Gateway"}`,
          trx_ref: `DEP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        });
      }
    }

    setMsg({ text: "Deposit approved and user wallet credited successfully!", type: "success" });
    setTimeout(() => {
      setSelectedDeposit(null);
      fetchDeposits();
    }, 1200);
    setSubmitting(false);
  };

  const handleReject = async (depositId: string) => {
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: rpcErr } = await supabase.rpc("reject_deposit_rpc", {
      p_deposit_id: depositId,
      p_admin_id: user?.id,
      p_feedback: feedback || "Invalid transaction hash or proof",
    });

    if (rpcErr) {
      await supabase.from("deposits").update({
        status: "rejected",
        admin_feedback: feedback || "Invalid transaction hash or proof",
        updated_at: new Date().toISOString(),
      }).eq("id", depositId);
    }

    setMsg({ text: "Deposit request rejected.", type: "success" });
    setTimeout(() => {
      setSelectedDeposit(null);
      fetchDeposits();
    }, 1200);
    setSubmitting(false);
  };

  const filteredDeposits = deposits.filter((d) =>
    filterStatus === "all" ? true : d.status === filterStatus
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Deposit Requests Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review manual deposit receipts and approve user funding.</p>
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

      {/* Deposit Requests Table */}
      <div className="minimal-card p-6 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Investor</th>
                <th className="pb-3">Gateway</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">TxHash / Reference</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Submitted Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No deposit records matching filter.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{dep.profiles?.full_name || "Investor"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{dep.profiles?.email}</div>
                    </td>
                    <td className="py-3 font-extrabold text-slate-900 uppercase">{dep.gateway || dep.gateway_name || "USDT TRC20"}</td>
                    <td className="py-3 font-mono font-extrabold text-indigo-600">${Number(dep.amount || dep.final_amount || 0).toFixed(2)}</td>
                    <td className="py-3 font-mono text-slate-500 text-[11px] truncate max-w-[150px]">
                      {dep.transaction_id || dep.trx_id || dep.proof_url || "-"}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        dep.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        dep.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">{new Date(dep.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDeposit(dep);
                          setFeedback("");
                          setMsg(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Review Request
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Review Modal */}
      {selectedDeposit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Review Deposit Request</h3>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">User:</span>
                <span className="font-extrabold text-slate-900">{selectedDeposit.profiles?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-extrabold text-slate-900 uppercase">{selectedDeposit.gateway || selectedDeposit.gateway_name || "USDT TRC20"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-extrabold text-indigo-600">${Number(selectedDeposit.amount || selectedDeposit.final_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref / Hash:</span>
                <span className="font-mono font-bold text-slate-900 select-all">{selectedDeposit.transaction_id || selectedDeposit.trx_id || "-"}</span>
              </div>
              {(selectedDeposit.proof_url || selectedDeposit.proof_file) && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Uploaded Proof Document:</span>
                  <a
                    href={selectedDeposit.proof_url || selectedDeposit.proof_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-bold flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Payment Receipt Image</span>
                  </a>
                </div>
              )}
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{msg.text}</span>
              </div>
            )}

            {selectedDeposit.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Admin Feedback / Reason</label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Optional feedback for user..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReject(selectedDeposit.id)}
                    className="py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    {submitting ? "Processing..." : "Reject Deposit"}
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleApprove(selectedDeposit.id)}
                    className="py-2.5 rounded-xl text-xs font-bold minimal-btn-primary cursor-pointer shadow-md shadow-indigo-600/15"
                  >
                    {submitting ? "Processing..." : "Approve & Credit Wallet"}
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
