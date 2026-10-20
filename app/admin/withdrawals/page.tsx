"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, XCircle, Clock, AlertCircle, X, QrCode, Copy, Check, Download, ExternalLink, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isZoomedQr, setIsZoomedQr] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("withdrawals")
      .select("*, profiles(email, full_name, payout_qr_code_url)")
      .order("created_at", { ascending: false });

    if (data) setWithdrawals(data);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDownloadQr = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  const handleReject = async (withdrawalId: string, forceRefund = false) => {
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/withdrawals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalId,
          feedback: feedback || "Withdrawal request rejected by administrator",
          forceRefund,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ text: data.message || "Withdrawal rejected and funds refunded to user wallet!", type: "success" });
        setTimeout(() => {
          setSelectedWithdrawal(null);
          fetchWithdrawals();
        }, 1500);
      } else {
        setMsg({ text: data.error || "Failed to process rejection refund.", type: "error" });
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Network error while processing refund.", type: "error" });
    }

    setSubmitting(false);
  };

  const filteredWithdrawals = withdrawals.filter((w) =>
    filterStatus === "all" ? true : w.status === filterStatus
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#001011]">Withdrawal Payout Requests</h1>
          <p className="text-xs text-slate-500 mt-1">Process investor payout requests and verify target wallet addresses or scan QR codes.</p>
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
                <th className="pb-3 text-center">Payout QR</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No withdrawal records matching filter.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => {
                  const qrUrl = w.qr_code_url || w.account_details?.qr_code_url || w.profiles?.payout_qr_code_url;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <div className="font-extrabold text-[#001011]">{w.profiles?.full_name || "Investor"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{w.profiles?.email}</div>
                      </td>
                      <td className="py-3 font-extrabold text-slate-800">{w.method_name || w.wallet_type || "Crypto"}</td>
                      <td className="py-3 font-mono font-bold text-slate-700">${Number(w.amount || 0).toFixed(2)}</td>
                      <td className="py-3 font-mono font-bold text-[#093A3E]">${Number(w.net_amount || w.amount || 0).toFixed(2)}</td>
                      <td className="py-3 text-center">
                        {qrUrl ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#093A3E]/10 text-[#093A3E] border border-[#093A3E]/20 inline-flex items-center gap-1">
                            <QrCode className="w-3 h-3 text-[#3AAFB9]" />
                            <span>QR Ready</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>
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
                            setCopiedAddress(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#093A3E]/10 text-[#093A3E] border border-[#093A3E]/20 hover:bg-[#093A3E] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {w.status === "pending" ? "Process Payout" : w.status === "rejected" ? "Review / Refund" : "View Details"}
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

      {/* Withdrawal Payout Modal */}
      {selectedWithdrawal && (() => {
        const qrUrl = selectedWithdrawal.qr_code_url || selectedWithdrawal.account_details?.qr_code_url || selectedWithdrawal.profiles?.payout_qr_code_url;
        const destinationText =
          typeof selectedWithdrawal.account_details === "object"
            ? selectedWithdrawal.account_details?.details || selectedWithdrawal.payout_details || ""
            : selectedWithdrawal.account_details || selectedWithdrawal.payout_details || "";

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800 max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#093A3E] flex items-center justify-center text-[#3AAFB9]">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#001011]">Process Withdrawal Request</h3>
                    <p className="text-[11px] text-slate-400">Scan or copy payment credentials to send payout</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWithdrawal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Investor Details & Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Investor:</span>
                  <span className="font-extrabold text-[#001011]">{selectedWithdrawal.profiles?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-extrabold text-[#001011]">{selectedWithdrawal.method_name || "Crypto Payout"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Amount to Transfer:</span>
                  <span className="font-mono font-extrabold text-[#093A3E] text-sm">
                    ${Number(selectedWithdrawal.net_amount || selectedWithdrawal.amount || 0).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* ── Scannable Payout QR Code Display ── */}
              {qrUrl ? (
                <div className="bg-gradient-to-b from-[#093A3E]/5 to-transparent border border-[#093A3E]/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#093A3E] uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#3AAFB9]" />
                      <span>Investor Payout QR Code</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsZoomedQr(true)}
                        className="px-2.5 py-1 rounded-lg bg-[#093A3E] hover:bg-[#001011] text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#3AAFB9]" />
                        <span>Enlarge QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadQr(qrUrl, `payout-qr-${selectedWithdrawal.id}.png`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div
                      onClick={() => setIsZoomedQr(true)}
                      className="relative group w-36 h-36 bg-slate-50 p-2 rounded-xl border border-slate-200 hover:border-[#093A3E] flex flex-col items-center justify-center flex-shrink-0 cursor-pointer transition-all shadow-xs"
                      title="Click to Enlarge QR Code"
                    >
                      <img
                        src={qrUrl}
                        alt="Investor Payout QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-x-0 bottom-1 flex justify-center">
                        <span className="text-[9px] font-extrabold bg-[#093A3E]/90 text-white px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5 text-[#3AAFB9]" />
                          <span>Click to Zoom</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs flex-1">
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200">
                        Ready for Mobile Wallet Scan
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Scan directly using Binance, Trust Wallet, MetaMask, Cash App, or your exchange terminal.
                      </p>

                      {destinationText && !destinationText.startsWith("QR Code Payout") ? (
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Destination Address / Memo:</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-800 break-all bg-slate-50 p-1.5 rounded-lg border border-slate-200 flex-1">
                              {destinationText}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(destinationText)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex-shrink-0"
                              title="Copy Address"
                            >
                              {copiedAddress ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#093A3E] bg-[#093A3E]/5 p-2 rounded-lg border border-[#093A3E]/15 font-medium">
                          Payment destination is encoded in the QR code above. Scan with your wallet app to transfer.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                destinationText && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        Destination Wallet / Account Details
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(destinationText)}
                        className="text-[11px] font-bold text-[#093A3E] hover:text-[#3AAFB9] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAddress ? "Copied!" : "Copy Address"}</span>
                      </button>
                    </div>
                    <pre className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-900 whitespace-pre-wrap select-all">
                      {destinationText}
                    </pre>
                  </div>
                )
              )}

              {msg && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                  msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}>
                  {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {selectedWithdrawal.status === "pending" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Admin Transaction Note / Payout Reference (Hash)
                    </label>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="e.g. TXID / Blockchain Hash / Payment Reference"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleReject(selectedWithdrawal.id)}
                      className="py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                    >
                      {submitting ? "Processing..." : "Reject & Refund"}
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleApprove(selectedWithdrawal.id)}
                      className="py-2.5 rounded-xl text-xs font-bold bg-[#093A3E] hover:bg-[#001011] text-white cursor-pointer shadow-md shadow-[#093A3E]/15 transition-colors"
                    >
                      {submitting ? "Processing..." : "Approve & Mark Paid"}
                    </button>
                  </div>
                </div>
              )}

              {selectedWithdrawal.status === "rejected" && (
                <div className="space-y-3 pt-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Withdrawal Status: Rejected</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      If the deducted amount of <strong>${Number(selectedWithdrawal.amount || 0).toFixed(2)} USD</strong> did not reflect back into the user&apos;s account balance, you can restore and credit it now.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReject(selectedWithdrawal.id, true)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#093A3E] hover:bg-[#001011] text-white cursor-pointer shadow-md shadow-[#093A3E]/15 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#3AAFB9]" />
                    <span>{submitting ? "Refunding..." : `Refund $${Number(selectedWithdrawal.amount || 0).toFixed(2)} to User Wallet`}</span>
                  </button>
                </div>
              )}

              {selectedWithdrawal.status === "approved" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This withdrawal was approved and payout was dispatched.</span>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* Enlarged QR Modal for Admin */}
      {isZoomedQr && selectedWithdrawal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomedQr(false);
          }}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-center border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-[#093A3E] flex items-center justify-center text-[#3AAFB9]">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#001011]">Scan Investor QR</h4>
                  <p className="text-[11px] text-slate-400">High resolution scannable preview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomedQr(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex items-center justify-center shadow-xs">
              <img
                src={selectedWithdrawal.qr_code_url || selectedWithdrawal.account_details?.qr_code_url || selectedWithdrawal.profiles?.payout_qr_code_url}
                alt="Enlarged QR"
                className="w-72 h-72 sm:w-80 sm:h-80 object-contain rounded-xl"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Investor:</span>
                <span className="font-extrabold text-[#001011]">{selectedWithdrawal.profiles?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-extrabold text-[#093A3E]">{selectedWithdrawal.method_name || "Crypto"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Amount:</span>
                <span className="font-mono font-extrabold text-emerald-600">
                  ${Number(selectedWithdrawal.net_amount || selectedWithdrawal.amount || 0).toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const qrUrl = selectedWithdrawal.qr_code_url || selectedWithdrawal.account_details?.qr_code_url || selectedWithdrawal.profiles?.payout_qr_code_url;
                  if (qrUrl) handleDownloadQr(qrUrl, `payout-qr-${selectedWithdrawal.id}.png`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>
              <button
                type="button"
                onClick={() => setIsZoomedQr(false)}
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
