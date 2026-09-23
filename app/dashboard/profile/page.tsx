"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, QrCode, UploadCloud, Trash2, Eye, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";
import { uploadPayoutQrCode } from "@/lib/supabase/storage";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeUserId, setActiveUserId] = useState("");
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  
  // Payout & QR code states
  const [payoutMethod, setPayoutMethod] = useState("USDT (TRC-20)");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutQrCodeUrl, setPayoutQrCodeUrl] = useState<string | null>(null);
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [savingPayout, setSavingPayout] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isViewingQrModal, setIsViewingQrModal] = useState(false);
  
  // Password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setActiveUserId(activeUser.id);
      setIsImpersonating(activeUser.isImpersonating);
      setUserEmail(activeUser.email);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", activeUser.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setUsername(profile.username || "");
        setPhone(profile.phone || "");
        if (profile.payout_method) setPayoutMethod(profile.payout_method);
        if (profile.payout_address) setPayoutAddress(profile.payout_address);
        if (profile.payout_qr_code_url) {
          setPayoutQrCodeUrl(profile.payout_qr_code_url);
          setQrPreviewUrl(profile.payout_qr_code_url);
        }
      }
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);

    const supabase = createClient();
    if (!activeUserId) {
      setProfileMsg({ text: "Authentication error", type: "error" });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeUserId);

    if (error) {
      setProfileMsg({ text: error.message, type: "error" });
    } else {
      setProfileMsg({ text: "Profile details updated successfully!", type: "success" });
    }
    setSaving(false);
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
      if (!allowed.includes(file.type)) {
        setPayoutMsg({ text: "Invalid format. Please select a PNG, JPG, or WEBP image.", type: "error" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPayoutMsg({ text: "Image size exceeds 5MB limit.", type: "error" });
        return;
      }
      setSelectedQrFile(file);
      const objUrl = URL.createObjectURL(file);
      setQrPreviewUrl(objUrl);
      setPayoutMsg(null);
    }
  };

  const handleRemoveQr = () => {
    setSelectedQrFile(null);
    setQrPreviewUrl(null);
    setPayoutQrCodeUrl(null);
  };

  const handleUpdatePayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayout(true);
    setPayoutMsg(null);

    const supabase = createClient();
    if (!activeUserId) {
      setPayoutMsg({ text: "Authentication error. Please refresh.", type: "error" });
      setSavingPayout(false);
      return;
    }

    let finalQrUrl = payoutQrCodeUrl;

    if (selectedQrFile) {
      const uploadRes = await uploadPayoutQrCode(selectedQrFile, activeUserId);
      if (uploadRes.error) {
        setPayoutMsg({ text: uploadRes.error, type: "error" });
        setSavingPayout(false);
        return;
      }
      finalQrUrl = uploadRes.url;
    }

    if (!payoutAddress.trim() && !finalQrUrl) {
      setPayoutMsg({ text: "Please upload a payout QR code or enter a destination wallet address.", type: "error" });
      setSavingPayout(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        payout_method: payoutMethod,
        payout_address: payoutAddress,
        payout_qr_code_url: finalQrUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeUserId);

    if (error) {
      setPayoutMsg({ text: error.message, type: "error" });
    } else {
      setPayoutQrCodeUrl(finalQrUrl);
      setSelectedQrFile(null);
      setPayoutMsg({ text: "Payout destination & QR code saved successfully!", type: "success" });
    }
    setSavingPayout(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (isImpersonating) {
      setPasswordMsg({ text: "Password changes in Impersonation mode are disabled. Manage user passwords in Admin Panel.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ text: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Passwords do not match.", type: "error" });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg({ text: error.message, type: "error" });
    } else {
      setPasswordMsg({ text: "Password updated successfully!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-8 max-w-4xl">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Profile Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account information and security credentials.</p>
        </div>

        {/* Profile Info Form */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
            <User className="w-4 h-4 text-[#093A3E]" />
            <span>Personal Information</span>
          </h3>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              profileMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093A3E] hover:bg-[#001011] transition-all cursor-pointer shadow-md shadow-[#093A3E]/15"
            >
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Payout Destination & Wallet QR Code Form */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-[#093A3E]" />
                <span>Payout Destination & Wallet QR Code</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your personal payment QR code to enable fast, error-free payouts directly to your wallet.
              </p>
            </div>
            {payoutQrCodeUrl && (
              <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                QR Verified Active
              </span>
            )}
          </div>

          {payoutMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              payoutMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {payoutMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{payoutMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePayoutSettings} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Default Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9] font-medium"
                >
                  <option value="USDT (TRC-20)">USDT (TRC-20 - Tron Network)</option>
                  <option value="Bitcoin (BTC)">Bitcoin (BTC Network)</option>
                  <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
                  <option value="BNB (BEP-20)">BNB (Binance Smart Chain)</option>
                  <option value="Cash App Pay">Cash App Pay / $Cashtag</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Account Transfer">Bank Account Wire / IBAN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Destination Wallet Address / Account Details <span className="text-slate-400 font-normal normal-case">(Optional with QR Code)</span>
                </label>
                <input
                  type="text"
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  placeholder="Optional: leave blank if using QR code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
                />
              </div>
            </div>

            {/* QR Code Upload / Preview Container */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Personal Payout QR Code
              </label>

              {qrPreviewUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative group w-36 h-36 rounded-xl bg-white p-2 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                    <img
                      src={qrPreviewUrl}
                      alt="Payout QR Code"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setIsViewingQrModal(true)}
                      className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer gap-1.5 text-xs font-bold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Full</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="text-xs font-bold text-slate-900">QR Code Attached</div>
                    <p className="text-[11px] text-slate-500">
                      This QR code will be presented automatically whenever you request a withdrawal or payment.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-[#093A3E]" />
                        <span>Replace QR</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleQrFileChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-[#093A3E] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/60 hover:bg-[#093A3E]/5 group">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 group-hover:border-[#093A3E]/30 flex items-center justify-center text-slate-400 group-hover:text-[#093A3E] shadow-xs mb-3 transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700 group-hover:text-[#093A3E]">
                    Click to upload your Payout QR code
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, or WEBP (Max 5MB)
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleQrFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPayout}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093A3E] hover:bg-[#001011] transition-all cursor-pointer shadow-md shadow-[#093A3E]/15 flex items-center gap-2"
            >
              {savingPayout ? "Saving Payout Details..." : "Save Payout Settings"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#093A3E]" />
            <span>Change Password</span>
          </h3>

          {passwordMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
              passwordMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
            }`}>
              {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#093A3E] focus:ring-1 focus:ring-[#3AAFB9]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093A3E] hover:bg-[#001011] transition-all cursor-pointer shadow-md shadow-[#093A3E]/15"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* QR Code Full View Modal */}
        {isViewingQrModal && qrPreviewUrl && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#093A3E]" />
                  <span className="text-sm font-extrabold text-slate-900">Personal Payout QR</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewingQrModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                <img
                  src={qrPreviewUrl}
                  alt="Full Payout QR"
                  className="max-h-72 w-auto object-contain rounded-lg shadow-xs"
                />
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-slate-900">{payoutMethod}</div>
                {payoutAddress && (
                  <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-100 p-2 rounded-lg">
                    {payoutAddress}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsViewingQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

