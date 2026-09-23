"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ArrowDownRight, CheckCircle2, XCircle, Clock, ExternalLink, AlertCircle, X, Eye, Download, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isZoomedProof, setIsZoomedProof] = useState(false);

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

  const handleDownloadProof = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApprove = async (depositId: string) => {
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/deposits/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId,
          feedback: feedback || "Deposit verified and approved by admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message || "Deposit approved and user wallet credited successfully!", type: "success" });
        setTimeout(() => {
          setSelectedDeposit(null);
          fetchDeposits();
        }, 1200);
      } else {
        setMsg({ text: data.error || "Failed to approve deposit.", type: "error" });
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Network error while approving deposit.", type: "error" });
    }

    setSubmitting(false);
  };

  const handleReject = async (depositId: string) => {
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/deposits/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId,
          feedback: feedback || "Invalid transaction hash or proof",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message || "Deposit request rejected.", type: "success" });
        setTimeout(() => {
          setSelectedDeposit(null);
          fetchDeposits();
        }, 1200);
      } else {
        setMsg({ text: data.error || "Failed to reject deposit.", type: "error" });
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Network error while rejecting deposit.", type: "error" });
    }

    setSubmitting(false);
  };

  const filteredDeposits = deposits.filter((d) =>
    filterStatus === "all" ? true : d.status === filterStatus
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001011]">Deposit Requests Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Review manual deposit receipts, verify payment proofs, and credit user wallets.</p>
        </div>

        <div className="flex items-center space-x-2">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-[#093A3E] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
                <th className="pb-3 text-center">Proof Receipt</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Submitted Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No deposit records matching filter.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => {
                  const proof = dep.proof_url || dep.proof_file;

                  return (
                    <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <div className="font-extrabold text-[#001011]">{dep.profiles?.full_name || "Investor"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{dep.profiles?.email}</div>
                      </td>
                      <td className="py-3 font-extrabold text-slate-800 uppercase">{dep.gateway || dep.gateway_name || "USDT TRC20"}</td>
                      <td className="py-3 font-mono font-extrabold text-[#093A3E]">${Number(dep.amount || dep.final_amount || 0).toFixed(2)}</td>
                      <td className="py-3 font-mono text-slate-500 text-[11px] truncate max-w-[140px]">
                        {dep.transaction_id || dep.trx_id || "-"}
                      </td>
                      <td className="py-3 text-center">
                        {proof ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDeposit(dep);
                              setIsZoomedProof(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#093A3E]/10 hover:bg-[#093A3E] text-[#093A3E] hover:text-white border border-[#093A3E]/20 text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-[#3AAFB9]" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">No File</span>
                        )}
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
                            setIsZoomedProof(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#093A3E]/10 text-[#093A3E] border border-[#093A3E]/20 hover:bg-[#093A3E] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Review Request
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

      {/* Deposit Review Modal */}
      {selectedDeposit && (() => {
        const proof = selectedDeposit.proof_url || selectedDeposit.proof_file;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800 max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#093A3E] flex items-center justify-center text-[#3AAFB9]">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#001011]">Review Deposit Request</h3>
                    <p className="text-[11px] text-slate-400">Verify payment proof and disburse deposit wallet balance</p>
                  </div>
                </div>
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
                  <span className="font-extrabold text-[#001011]">{selectedDeposit.profiles?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="font-extrabold text-[#001011] uppercase">{selectedDeposit.gateway || selectedDeposit.gateway_name || "USDT TRC20"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-mono font-extrabold text-[#093A3E] text-sm">
                    ${Number(selectedDeposit.amount || selectedDeposit.final_amount || 0).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref / Hash:</span>
                  <span className="font-mono font-bold text-slate-900 select-all break-all">{selectedDeposit.transaction_id || selectedDeposit.trx_id || "-"}</span>
                </div>
              </div>

              {/* ── Embedded Proof of Payment Card with Zoom ── */}
              {proof ? (
                <div className="bg-gradient-to-b from-[#093A3E]/5 to-transparent border border-[#093A3E]/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#093A3E] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#3AAFB9]" />
                      <span>Uploaded Payment Proof Receipt</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsZoomedProof(true)}
                        className="px-2.5 py-1 rounded-lg bg-[#093A3E] hover:bg-[#001011] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#3AAFB9]" />
                        <span>Enlarge Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadProof(proof, `deposit-proof-${selectedDeposit.id}.png`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => setIsZoomedProof(true)}
                    className="relative group bg-white p-3 rounded-xl border border-slate-200 hover:border-[#093A3E] cursor-pointer transition-all flex flex-col items-center justify-center shadow-xs"
                    title="Click to Zoom Fullscreen"
                  >
                    <img
                      src={proof}
                      alt="Deposit Payment Proof"
                      className="max-h-56 w-auto object-contain rounded-lg"
                    />
                    <div className="mt-2 text-center">
                      <span className="text-[10px] font-bold text-[#093A3E] bg-[#093A3E]/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#3AAFB9]" />
                        <span>Click to Enlarge / Inspect Document</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>No receipt image uploaded</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-1">
                    The user submitted this deposit with transaction reference only: <code className="font-mono">{selectedDeposit.transaction_id || selectedDeposit.trx_id || "N/A"}</code>
                  </p>
                </div>
              )}

              {msg && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                  msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}>
                  {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {selectedDeposit.status === "pending" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Admin Feedback / Note
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Optional feedback for user..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleReject(selectedDeposit.id)}
                      className="py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                    >
                      {submitting ? "Processing..." : "Reject Deposit"}
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleApprove(selectedDeposit.id)}
                      className="py-2.5 rounded-xl text-xs font-bold bg-[#093A3E] hover:bg-[#001011] text-white cursor-pointer shadow-md shadow-[#093A3E]/15 transition-colors"
                    >
                      {submitting ? "Processing..." : "Approve & Credit Wallet"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Enlarged Proof Modal */}
      {isZoomedProof && selectedDeposit && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomedProof(false);
          }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative text-center border border-slate-200 max-h-[94vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-[#093A3E] flex items-center justify-center text-[#3AAFB9]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#001011]">Payment Proof Document</h4>
                  <p className="text-[11px] text-slate-400">
                    {selectedDeposit.profiles?.email} • ${Number(selectedDeposit.amount || 0).toFixed(2)} USD
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomedProof(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
              <img
                src={selectedDeposit.proof_url || selectedDeposit.proof_file}
                alt="Enlarged Payment Proof"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  const proof = selectedDeposit.proof_url || selectedDeposit.proof_file;
                  if (proof) handleDownloadProof(proof, `deposit-proof-${selectedDeposit.id}.png`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>
              <button
                type="button"
                onClick={() => setIsZoomedProof(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
