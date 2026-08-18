"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Clock, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function KycPage() {
  const [userEmail, setUserEmail] = useState("");
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [docType, setDocType] = useState("National ID");
  const [docNumber, setDocNumber] = useState("");
  const [docFrontUrl, setDocFrontUrl] = useState("");
  const [docBackUrl, setDocBackUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      const { data: requests } = await supabase
        .from("kyc_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (requests) setKycRequests(requests);
    }
  };

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMsg({ text: "Authentication error. Please log in again.", type: "error" });
      setSubmitting(false);
      return;
    }

    let finalFrontUrl = docFrontUrl;
    let finalBackUrl = docBackUrl;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    if (frontFile) {
      if (!allowedTypes.includes(frontFile.type)) {
        setMsg({ text: "Invalid document format for Front Image. Only JPG, PNG, WEBP, and PDF documents are allowed.", type: "error" });
        setSubmitting(false);
        return;
      }
      if (frontFile.size > 5 * 1024 * 1024) {
        setMsg({ text: "Document Front Image size exceeds 5MB limit.", type: "error" });
        setSubmitting(false);
        return;
      }

      const fileExt = frontFile.name.split(".").pop();
      const fileName = `${user.id}/front_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, frontFile, { upsert: true });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from("kyc-documents").getPublicUrl(uploadData.path);
        finalFrontUrl = publicUrlData.publicUrl;
      }
    }

    if (backFile) {
      if (!allowedTypes.includes(backFile.type)) {
        setMsg({ text: "Invalid document format for Back Image. Only JPG, PNG, WEBP, and PDF documents are allowed.", type: "error" });
        setSubmitting(false);
        return;
      }
      if (backFile.size > 5 * 1024 * 1024) {
        setMsg({ text: "Document Back Image size exceeds 5MB limit.", type: "error" });
        setSubmitting(false);
        return;
      }

      const fileExt = backFile.name.split(".").pop();
      const fileName = `${user.id}/back_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, backFile, { upsert: true });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from("kyc-documents").getPublicUrl(uploadData.path);
        finalBackUrl = publicUrlData.publicUrl;
      }
    }

    if (!finalFrontUrl) {
      setMsg({ text: "Please attach or provide a document front image.", type: "error" });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("kyc_requests").insert({
      user_id: user.id,
      document_type: docType,
      document_number: docNumber,
      document_front_url: finalFrontUrl,
      document_back_url: finalBackUrl || null,
      status: "pending",
    });

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: "KYC documents submitted successfully! Compliance team will review your submission.", type: "success" });
      setDocNumber("");
      setDocFrontUrl("");
      setDocBackUrl("");
      setFrontFile(null);
      setBackFile(null);
      fetchKycData();
    }
    setSubmitting(false);
  };


  const latestRequest = kycRequests[0];
  const currentStatus = latestRequest ? latestRequest.status : "unverified";

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-8 max-w-4xl">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">KYC Verification</h1>
          <p className="text-xs text-slate-500 mt-1">Submit official identification documents to verify your investor account.</p>
        </div>

        {/* Status Card */}
        <div className="minimal-card p-6 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              currentStatus === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
              currentStatus === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
              currentStatus === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
              "bg-slate-100 text-slate-500 border border-slate-200"
            }`}>
              {currentStatus === "approved" ? <CheckCircle2 className="w-6 h-6" /> :
               currentStatus === "pending" ? <Clock className="w-6 h-6" /> :
               currentStatus === "rejected" ? <AlertCircle className="w-6 h-6" /> :
               <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verification Status</div>
              <div className="text-lg font-extrabold text-slate-900 uppercase mt-0.5">{currentStatus}</div>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium max-w-xs">
            {currentStatus === "approved" && "Your account is fully verified. You have full access to high-volume withdrawals."}
            {currentStatus === "pending" && "Your submission is under review by compliance. Approvals usually take 1-12 hours."}
            {currentStatus === "rejected" && `Submission rejected: ${latestRequest?.admin_feedback || "Please re-upload clearer document copies."}`}
            {currentStatus === "unverified" && "Please complete the submission form below to verify your identity."}
          </div>
        </div>

        {/* Document Submission Form */}
        {(currentStatus === "unverified" || currentStatus === "rejected") && (
          <div className="minimal-card p-6 border-slate-200 space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Submit Verification Documents</span>
            </h3>

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitKyc} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-bold"
                  >
                    <option value="National ID">National ID Card</option>
                    <option value="Passport">International Passport</option>
                    <option value="Driver License">Driver&apos;s License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Document / ID Number</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. A12345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Document Front Image</label>
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFrontFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <input
                      type="text"
                      value={docFrontUrl}
                      onChange={(e) => setDocFrontUrl(e.target.value)}
                      placeholder="Or paste front image URL..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Document Back Image (Optional)</label>
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBackFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <input
                      type="text"
                      value={docBackUrl}
                      onChange={(e) => setDocBackUrl(e.target.value)}
                      placeholder="Or paste back image URL..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>


              <button
                type="submit"
                disabled={submitting}
                className="minimal-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {submitting ? "Submitting Documents..." : "Submit Documents for Verification"}
              </button>
            </form>
          </div>
        )}

        {/* KYC History Table */}
        <div className="minimal-card p-6 border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Submission Log</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Doc Type</th>
                  <th className="pb-3">Doc ID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Admin Notes</th>
                  <th className="pb-3">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kycRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-medium">
                      No KYC document requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  kycRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-extrabold text-slate-900">{req.document_type}</td>
                      <td className="py-3 font-mono text-slate-700">{req.document_number || "-"}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          req.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          req.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">{req.admin_feedback || "-"}</td>
                      <td className="py-3 text-slate-500 text-[11px]">{new Date(req.submitted_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
