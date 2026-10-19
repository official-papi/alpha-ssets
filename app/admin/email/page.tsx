"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Sparkles, Server, Globe, Key, HelpCircle, Loader2 } from "lucide-react";

export default function AdminEmailPage() {
  // Broadcast states
  const [targetAudience, setTargetAudience] = useState("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Test Email states
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testStatus, setTestStatus] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"broadcast" | "test" | "guide">("broadcast");

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBroadcast(true);
    setBroadcastMsg(null);

    try {
      const res = await fetch("/api/admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAudience, subject, message }),
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastMsg({ text: data.message, type: "success" });
        setSubject("");
        setMessage("");
      } else {
        setBroadcastMsg({ text: data.error || "Failed to dispatch broadcast.", type: "error" });
      }
    } catch (err: any) {
      setBroadcastMsg({ text: err.message || "Failed to dispatch broadcast.", type: "error" });
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setTestingEmail(true);
    setTestStatus(null);

    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmailAddress }),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus({
          text: `Success! ${data.message} Check your inbox or spam folder.`,
          type: "success",
        });
      } else {
        setTestStatus({
          text: `${data.error} ${data.hint || ""}`,
          type: "error",
        });
      }
    } catch (err: any) {
      setTestStatus({ text: err.message || "Network error while sending test email.", type: "error" });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Email System & Resend Hub</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage transactional platform notifications, test domain deliverability, and dispatch mass email broadcasts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer ${
            activeTab === "broadcast"
              ? "border-[#093A3E] text-[#093A3E]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Mass Broadcast
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "test"
              ? "border-[#093A3E] text-[#093A3E]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Resend Deliverability Tester</span>
        </button>
        <button
          onClick={() => setActiveTab("guide")}
          className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === "guide"
              ? "border-[#093A3E] text-[#093A3E]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Domain & Supabase Setup Guide</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST */}
      {activeTab === "broadcast" && (
        <div className="space-y-6">
          {broadcastMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              broadcastMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {broadcastMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{broadcastMsg.text}</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#093A3E]" />
              <span>Compose Broadcast Notification</span>
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Target Recipient Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] font-bold"
                >
                  <option value="all">All Registered Investors</option>
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
                  placeholder="e.g. Important Platform Update: New Features & Compounding Yields"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Message Content</label>
                <textarea
                  rows={8}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dear Investor, we are pleased to announce..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submittingBroadcast}
                className="bg-[#093A3E] hover:bg-[#072d30] text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md flex items-center space-x-2 transition-all"
              >
                {submittingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submittingBroadcast ? "Dispatching Broadcast..." : "Send Mass Broadcast via Resend & Notifications"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: TEST EMAIL */}
      {activeTab === "test" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Test Live Resend Deliverability</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Send an immediate branded test email through your configured Resend credentials to verify SPF, DKIM, and inbox delivery.
              </p>
            </div>

            {testStatus && (
              <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 font-semibold ${
                testStatus.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {testStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />}
                <div>{testStatus.text}</div>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Recipient Test Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="your-personal-email@gmail.com"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E]"
                  />
                  <button
                    type="submit"
                    disabled={testingEmail}
                    className="bg-[#093A3E] hover:bg-[#072d30] text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md flex items-center space-x-2 transition-all shrink-0"
                  >
                    {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{testingEmail ? "Sending..." : "Send Test Email"}</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#3AAFB9]" />
                <span>Quick Setup Checklist:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>RESEND_API_KEY</code> must be added to your <code>.env.local</code> (format: <code>re_...</code>)</li>
                <li><code>RESEND_FROM_EMAIL</code> must use your verified domain (e.g. <code>Alpha Assets &lt;noreply@yourdomain.com&gt;</code>)</li>
                <li>Your domain must be in <strong>Verified</strong> status on <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-blue-600 underline">resend.com/domains</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETUP GUIDE */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          {/* Step 1: Resend Domain Verification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Step 1: Add & Verify Domain in Resend</h3>
                <p className="text-xs text-slate-500">Enable high-deliverability sending from your own branded domain.</p>
              </div>
            </div>

            <ol className="list-decimal pl-5 text-xs text-slate-700 space-y-2 leading-relaxed">
              <li>Log in to your account at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">resend.com</a>.</li>
              <li>Navigate to <strong>Domains</strong> &rarr; Click <strong>Add Domain</strong> and enter your domain name (e.g. <code>yourdomain.com</code>).</li>
              <li>Resend will provide 3 DNS records:
                <div className="mt-2 grid grid-cols-1 gap-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div><strong>1. DKIM:</strong> Type <code>CNAME</code> or <code>TXT</code> &bull; Name <code>resend._domainkey</code></div>
                  <div><strong>2. SPF / Mail From:</strong> Type <code>MX</code> &amp; <code>TXT</code> &bull; Name <code>bounces.yourdomain.com</code></div>
                  <div><strong>3. DMARC:</strong> Type <code>TXT</code> &bull; Name <code>_dmarc.yourdomain.com</code> &bull; Value <code>v=DMARC1; p=none;</code></div>
                </div>
              </li>
              <li>Add these records at your DNS manager (Cloudflare, Namecheap, GoDaddy, Hostinger, etc.).</li>
              <li>Click <strong>Verify Records</strong> in Resend. Once status is <strong>Verified</strong>, you are ready to send!</li>
            </ol>
          </div>

          {/* Step 2: Set Environment Variables */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Step 2: Add Resend API Key to .env.local</h3>
                <p className="text-xs text-slate-500">Connect the Next.js server to your Resend account.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              Create an API key on Resend (<strong>API Keys</strong> &rarr; <strong>Create API Key</strong> with Full Access permission) and paste it into <code>.env.local</code>:
            </p>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[12px] font-mono overflow-x-auto">
{`RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL="Alpha Assets <notifications@yourdomain.com>"
ADMIN_EMAIL=admin@yourdomain.com`}
            </pre>
          </div>

          {/* Step 3: Connect Resend with Supabase Auth SMTP */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Step 3: Connect Supabase Auth to Resend SMTP</h3>
                <p className="text-xs text-slate-500">Route all Supabase verification and password reset emails through your verified domain.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              Open your Supabase Project &rarr; <strong>Project Settings</strong> &rarr; <strong>Authentication</strong> &rarr; scroll to <strong>SMTP Settings</strong>:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Enable Custom SMTP</div>
                <div className="font-bold text-slate-800 mt-1">Enabled (Toggle ON)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Sender Email</div>
                <div className="font-bold text-slate-800 mt-1">noreply@yourdomain.com</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Sender Name</div>
                <div className="font-bold text-slate-800 mt-1">Alpha Assets</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Host</div>
                <div className="font-bold text-slate-800 mt-1 font-mono">smtp.resend.com</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Port</div>
                <div className="font-bold text-slate-800 mt-1 font-mono">465 (SSL) or 587 (TLS)</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">User</div>
                <div className="font-bold text-slate-800 mt-1 font-mono">resend</div>
              </div>
              <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Password</div>
                <div className="font-bold text-slate-800 mt-1 font-mono">Your Resend API Key (re_...)</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
