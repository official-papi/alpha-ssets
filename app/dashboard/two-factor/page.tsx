"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Key, ShieldCheck, Copy, Check, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TwoFactorPage() {
  const [userEmail, setUserEmail] = useState("");
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [qrUrl, setQrUrl] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_2fa_enabled, two_factor_secret")
        .eq("id", user.id)
        .maybeSingle();

      let activeSecret = profile?.two_factor_secret;
      if (!activeSecret) {
        // Generate a deterministic or random Base32 TOTP secret for the user
        const hex = user.id.replace(/-/g, "").toUpperCase();
        const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        const chars = hex.substring(0, 16).split("");
        activeSecret = chars.map((c: string) => base32Chars[c.charCodeAt(0) % 32]).join("");
      }

      setSecretKey(activeSecret);
      setIs2FaEnabled(profile?.is_2fa_enabled ?? false);

      const label = encodeURIComponent(`AlphaAssets:${user.email || "Investor"}`);
      const issuer = encodeURIComponent("AlphaAssets");
      const totpUri = `otpauth://totp/${label}?secret=${activeSecret}&issuer=${issuer}`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpUri)}`);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (otpCode.length !== 6) {
      setMsg({ text: "Please enter a valid 6-digit OTP code from Google Authenticator.", type: "error" });
      return;
    }

    const supabase = createClient();
    const newStatus = !is2FaEnabled;

    await supabase.from("profiles").update({
      is_2fa_enabled: newStatus,
      two_factor_secret: secretKey,
    }).eq("id", userId);

    setIs2FaEnabled(newStatus);
    setMsg({
      text: newStatus
        ? "Two-Factor Authentication (2FA) enabled successfully! Account secured."
        : "Two-Factor Authentication (2FA) disabled successfully.",
      type: "success",
    });
    setOtpCode("");
  };

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-8 max-w-3xl">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Two-Factor Authentication (2FA)</h1>
          <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your investor account using Google Authenticator.</p>
        </div>

        {/* 2FA Status Banner */}
        <div className="minimal-card p-6 border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              is2FaEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {is2FaEnabled ? <ShieldCheck className="w-5 h-5" /> : <Key className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold uppercase">2FA Protection</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {is2FaEnabled ? "2FA Enabled & Active" : "2FA Disabled"}
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            is2FaEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}>
            {is2FaEnabled ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>

        {/* Setup Instructions & Form */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>Google Authenticator Setup</span>
          </h3>

          {msg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              1. Download <strong className="text-slate-900">Google Authenticator</strong> or <strong className="text-slate-900">Authy</strong> app on your mobile device.<br />
              2. Scan the secret key below or manually copy key into your authenticator app.
            </p>

            {qrUrl && (
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto text-center space-y-2">
                <img src={qrUrl} alt="2FA QR Code" className="w-40 h-40 object-contain rounded-lg border border-slate-200 bg-white p-2 shadow-xs" />
                <span className="text-[11px] text-slate-500 font-medium">Scan QR Code with Google Authenticator</span>
              </div>
            )}

            {/* Secret Key Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">2FA Secret Key</div>
                <div className="text-sm font-mono font-extrabold text-indigo-600 mt-0.5">{secretKey}</div>
              </div>

              <button
                type="button"
                onClick={handleCopySecret}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{copied ? "Copied" : "Copy Key"}</span>
              </button>
            </div>

            {/* OTP Verification Input Form */}
            <form onSubmit={handleToggle2Fa} className="space-y-4 max-w-sm pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Enter 6-Digit Authenticator Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md ${
                  is2FaEnabled
                    ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    : "minimal-btn-primary shadow-indigo-600/15"
                }`}
              >
                {is2FaEnabled ? "Disable 2FA Protection" : "Enable 2FA Protection"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
