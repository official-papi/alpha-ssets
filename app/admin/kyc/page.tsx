"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { FileCheck, CheckCircle2, XCircle, Clock, ExternalLink, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminKycPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchKycRequests();
  }, []);

  const fetchKycRequests = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("kyc_requests")
      .select("*, profiles(email, full_name)")
      .order("submitted_at", { ascending: false });

    if (data) setRequests(data);
  };

  const handleApproveKyc = async (reqId: string) => {
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const targetReq = requests.find((r) => r.id === reqId);

    const { error } = await supabase
      .from("kyc_requests")
      .update({
        status: "approved",
        admin_feedback: feedback || "Identity document verified and approved.",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reqId);

    if (targetReq?.user_id) {
      await supabase.from("profiles").update({
        is_kyc_verified: true,
        kyc_status: "approved",
      }).eq("id", targetReq.user_id);
    }

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: "KYC request approved and user marked as verified!", type: "success" });
      setTimeout(() => {
        setSelectedReq(null);
        fetchKycRequests();
      }, 1000);
    }
    setSubmitting(false);
  };

  const handleRejectKyc = async (reqId: string) => {
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const targetReq = requests.find((r) => r.id === reqId);

    const { error } = await supabase
      .from("kyc_requests")
      .update({
        status: "rejected",
        admin_feedback: feedback || "Document unreadable or invalid copy.",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reqId);

    if (targetReq?.user_id) {
      await supabase.from("profiles").update({
        is_kyc_verified: false,
        kyc_status: "rejected",
      }).eq("id", targetReq.user_id);
    }

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: "KYC request rejected.", type: "success" });
      setTimeout(() => {
        setSelectedReq(null);
        fetchKycRequests();
      }, 1000);
    }
    setSubmitting(false);
  };

  const filteredRequests = requests.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">KYC Document Verification Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Inspect identity document submissions and manage account compliance.</p>
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

      {/* KYC Table */}
      <div className="minimal-card p-6 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Investor</th>
                <th className="pb-3">Document Type</th>
                <th className="pb-3">Document Number</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Submitted Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No KYC document requests matching filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{req.profiles?.full_name || "Investor"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{req.profiles?.email}</div>
                    </td>
                    <td className="py-3 font-extrabold text-slate-900">{req.document_type}</td>
                    <td className="py-3 font-mono font-bold text-slate-900">{req.document_number || "-"}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        req.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        req.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">{new Date(req.submitted_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReq(req);
                          setFeedback("");
                          setMsg(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs font-bold transition-all cursor-pointer"
                      >
                        Inspect Document
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Inspect KYC Submission</h3>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Investor Email:</span>
                <span className="font-extrabold text-slate-900">{selectedReq.profiles?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-extrabold text-slate-900">{selectedReq.document_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReq.document_number || "-"}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-500 block mb-1 font-semibold">Document Front Image:</span>
                  <a
                    href={selectedReq.document_front_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-bold flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[280px]">{selectedReq.document_front_url}</span>
                  </a>
                </div>

                {selectedReq.document_back_url && (
                  <div>
                    <span className="text-slate-500 block mb-1 font-semibold">Document Back Image:</span>
                    <a
                      href={selectedReq.document_back_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline font-bold flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[280px]">{selectedReq.document_back_url}</span>
                    </a>
                  </div>
                )}
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

            {selectedReq.status === "pending" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Admin Feedback / Review Note</label>
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback for investor..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleRejectKyc(selectedReq.id)}
                    className="py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
                  >
                    {submitting ? "Processing..." : "Reject Document"}
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleApproveKyc(selectedReq.id)}
                    className="py-2.5 rounded-xl text-xs font-bold minimal-btn-primary cursor-pointer shadow-md shadow-indigo-600/15"
                  >
                    {submitting ? "Processing..." : "Approve Verification"}
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
