"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminEmailPage() {
  const [targetAudience, setTargetAudience] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const supabase = createClient();
      let query = supabase.from("profiles").select("id, email");

      if (targetAudience === "kyc_approved") {
        query = query.eq("is_kyc_verified", true);
      }

      const { data: users, error: fetchErr } = await query;

      if (fetchErr || !users || users.length === 0) {
        setStatusMsg({ text: "No target users found for selected audience.", type: "error" });
        setSubmitting(false);
        return;
      }

      // Insert broadcast entries into notifications table for target users
      const notificationRows = users.map((u: any) => ({
        user_id: u.id,
        title: subject,
        message: message,
        type: "info",
        is_read: false,
      }));

      const { error: insertErr } = await supabase.from("notifications").insert(notificationRows);

      if (insertErr) {
        setStatusMsg({ text: insertErr.message, type: "error" });
      } else {
        setStatusMsg({
          text: `Broadcast sent successfully to ${users.length} investor account${users.length > 1 ? "s" : ""}!`,
          type: "success",
        });
        setSubject("");
        setMessage("");
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || "Failed to dispatch broadcast.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Mass Email Broadcast Center</h1>
        <p className="text-xs text-slate-500 mt-1">Dispatch announcements, platform updates, and newsletter alerts to all registered investors.</p>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
          statusMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
        }`}>
          {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="minimal-card p-6 border-slate-200 space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <Mail className="w-4 h-4 text-indigo-600" />
          <span>New Broadcast Announcement</span>
        </h3>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Target Recipient Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-bold"
            >
              <option value="all">All Registered Investors</option>
              <option value="active_investors">Active Depositors Only</option>
              <option value="kyc_approved">KYC Verified Users Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Subject Line</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Important Platform Update: New Investment Tiers & Features"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">HTML / Plain Text Message Body</label>
            <textarea
              rows={8}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear Investor, we are pleased to announce..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="minimal-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15 flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Queuing Broadcast..." : "Send Mass Broadcast"}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
