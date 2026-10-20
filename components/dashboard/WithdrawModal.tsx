"use client";

import { useEffect, useState } from "react";
import { X, ArrowUpRight, AlertCircle, Loader2, QrCode, UploadCloud, Trash2, CheckCircle2, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";
import { uploadPayoutQrCode } from "@/lib/supabase/storage";

interface WithdrawModalProps {
  isOpen: boolean;
  interestBalance: number;
  depositBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_METHODS = [
  { id: "1", name: "USDT (TRC-20)", min_limit: 10, max_limit: 10000, fixed_charge: 1, percent_charge: 0.5 },
  { id: "2", name: "Bitcoin (BTC)", min_limit: 25, max_limit: 25000, fixed_charge: 2, percent_charge: 1.0 },
  { id: "3", name: "Bank Account Transfer", min_limit: 50, max_limit: 50000, fixed_charge: 5, percent_charge: 1.5 },
];

export default function WithdrawModal({
  isOpen,
  interestBalance,
  depositBalance,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const [methods, setMethods] = useState<any[]>(DEFAULT_METHODS);
  const [walletType, setWalletType] = useState<"interest_wallet" | "deposit_wallet">("interest_wallet");
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<any>(DEFAULT_METHODS[0]);
  const [accountDetails, setAccountDetails] = useState("");
  
  // Payout Destination Mode: "qrcode" | "address"
  const [payoutMode, setPayoutMode] = useState<"qrcode" | "address">("qrcode");

  // Payout QR states
  const [savedQrUrl, setSavedQrUrl] = useState<string | null>(null);
  const [useSavedQr, setUseSavedQr] = useState(true);
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [newQrPreview, setNewQrPreview] = useState<string | null>(null);
  const [saveToProfile, setSaveToProfile] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const supabase = createClient();
      const activeUser = await getActiveUser(supabase);
      
      // 1. Fetch available methods
      const { data: dbMethods } = await supabase.from("withdraw_methods").select("*").eq("status", true);
      let activeMethods = DEFAULT_METHODS;
      if (dbMethods && dbMethods.length > 0) {
        setMethods(dbMethods);
        activeMethods = dbMethods;
      }

      // 2. Fetch user's saved payout profile
      if (activeUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("payout_method, payout_address, payout_qr_code_url")
          .eq("id", activeUser.id)
          .single();

        if (profile) {
          if (profile.payout_address) {
            setAccountDetails(profile.payout_address);
          }
          if (profile.payout_qr_code_url) {
            setSavedQrUrl(profile.payout_qr_code_url);
            setUseSavedQr(true);
            setPayoutMode("qrcode");
          } else if (profile.payout_address) {
            setPayoutMode("address");
          }
          if (profile.payout_method) {
            const matched = activeMethods.find((m) => m.name.toLowerCase() === profile.payout_method.toLowerCase());
            if (matched) setSelectedMethod(matched);
          }
        }
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBalance = walletType === "interest_wallet" ? interestBalance : depositBalance;

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
      if (!allowed.includes(file.type)) {
        setError("Invalid file format. Please upload a PNG, JPG, or WEBP image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit.");
        return;
      }
      setSelectedQrFile(file);
      setNewQrPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveNewQr = () => {
    setSelectedQrFile(null);
    setNewQrPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setError("Please enter a valid withdrawal amount."); return; }
    if (numAmount > currentBalance) { setError(`Insufficient balance. Available: $${currentBalance.toLocaleString()}`); return; }

    const hasActiveQr = Boolean((useSavedQr && savedQrUrl) || selectedQrFile);

    // Validation depends on Payout Mode
    if (payoutMode === "qrcode") {
      if (!hasActiveQr && !accountDetails.trim()) {
        setError("Please select or upload your payout QR code.");
        return;
      }
    } else {
      if (!accountDetails.trim() && !hasActiveQr) {
        setError("Please provide your destination wallet address or account details.");
        return;
      }
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (!activeUser) { setError("Session expired."); setLoading(false); return; }

    // Upload new QR code if selected
    let finalQrCodeUrl: string | null = null;
    if (payoutMode === "qrcode" || selectedQrFile) {
      if (!useSavedQr && selectedQrFile) {
        const uploadRes = await uploadPayoutQrCode(selectedQrFile, activeUser.id);
        if (uploadRes.error) {
          setError(uploadRes.error);
          setLoading(false);
          return;
        }
        finalQrCodeUrl = uploadRes.url;
      } else if (useSavedQr && savedQrUrl) {
        finalQrCodeUrl = savedQrUrl;
      }
    }

    // If user selected QR code mode and left address blank, automatically describe it as QR Code Payout
    const finalDetails = accountDetails.trim() || (finalQrCodeUrl ? `QR Code Payout (${selectedMethod.name})` : "Wallet Address Payout");

    const payloadAccountDetails: any = {
      details: finalDetails,
      method: selectedMethod.name,
    };
    if (finalQrCodeUrl) {
      payloadAccountDetails.qr_code_url = finalQrCodeUrl;
    }

    const fixedCharge = Number(selectedMethod.fixed_charge || 0);
    const percentCharge = (numAmount * Number(selectedMethod.percent_charge || 0)) / 100;
    const totalCharge = fixedCharge + percentCharge;
    const netAmount = numAmount - totalCharge;

    const { data: rpcResult, error: rpcError } = await supabase.rpc("request_withdrawal_rpc", {
      p_user_id: activeUser.id,
      p_wallet_type: walletType,
      p_amount: numAmount,
      p_method_name: selectedMethod.name,
      p_account_details: payloadAccountDetails,
    });

    if (rpcError || (rpcResult && !rpcResult.success)) {
      // Direct insert fallback with qr_code_url column support
      const insertPayload: any = {
        user_id: activeUser.id,
        amount: numAmount,
        charge: totalCharge,
        net_amount: netAmount,
        method_name: selectedMethod.name,
        account_details: payloadAccountDetails,
        wallet_type: walletType,
        status: "pending",
      };
      if (finalQrCodeUrl) {
        insertPayload.qr_code_url = finalQrCodeUrl;
      }

      const { error: insertError } = await supabase.from("withdrawals").insert(insertPayload);
      if (insertError) {
        // Retry without explicit qr_code_url column if database schema is not yet migrated
        delete insertPayload.qr_code_url;
        const { error: retryErr } = await supabase.from("withdrawals").insert(insertPayload);
        if (retryErr) {
          setError(retryErr.message || rpcResult?.message || "Failed to submit withdrawal request.");
          setLoading(false);
          return;
        }
      }
    }

    // If user checked "Save to profile" or uploaded a new QR code to be saved
    if (saveToProfile && finalQrCodeUrl) {
      await supabase
        .from("profiles")
        .update({
          payout_method: selectedMethod.name,
          payout_address: accountDetails.trim() || undefined,
          payout_qr_code_url: finalQrCodeUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeUser.id);
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="hm-modal-overlay">
      <div className="hm-modal max-w-lg max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#093A3E]/10 border border-[#093A3E]/20 flex items-center justify-center text-[#093A3E]">
            <ArrowUpRight className="w-5 h-5 text-[#3AAFB9]" />
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-[#001011]">Withdraw Earnings</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Transfer settled yield or capital to your external destination</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-rose-700 text-[13px] font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Wallet Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Source Wallet
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWalletType("interest_wallet")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  walletType === "interest_wallet"
                    ? "border-[#093A3E] bg-[#093A3E]/6 ring-1 ring-[#3AAFB9]/40 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-500">Interest Wallet</p>
                <p className="text-[18px] font-extrabold text-emerald-600 mt-1 font-mono">${interestBalance.toLocaleString()}</p>
              </button>
              <button
                type="button"
                onClick={() => setWalletType("deposit_wallet")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  walletType === "deposit_wallet"
                    ? "border-[#093A3E] bg-[#093A3E]/6 ring-1 ring-[#3AAFB9]/40 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-500">Deposit Wallet</p>
                <p className="text-[18px] font-extrabold text-[#001011] mt-1 font-mono">${depositBalance.toLocaleString()}</p>
              </button>
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Payout Method
            </label>
            <select
              value={selectedMethod?.name}
              onChange={(e) => {
                const found = methods.find((m) => m.name === e.target.value);
                if (found) setSelectedMethod(found);
              }}
              className="hm-input font-medium"
            >
              {methods.map((m) => (
                <option key={m.id || m.code} value={m.name}>
                  {m.name} (${m.min_limit} – ${m.max_limit})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Amount (USD)
            </label>
            <input
              type="number"
              min={selectedMethod?.min_limit || 10}
              max={Math.min(currentBalance, selectedMethod?.max_limit || 50000)}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Available: $${currentBalance.toLocaleString()}`}
              className="hm-input font-mono font-bold text-base"
            />
          </div>

          {/* ── Payout Destination Type Toggle ── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Payout Destination Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPayoutMode("qrcode")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  payoutMode === "qrcode"
                    ? "bg-[#093A3E] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Pay with QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutMode("address")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  payoutMode === "address"
                    ? "bg-[#093A3E] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Pay with Address</span>
              </button>
            </div>
          </div>

          {/* ── Section A: QR Code Payout Mode ── */}
          {payoutMode === "qrcode" && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#093A3E] uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#3AAFB9]" />
                  <span>Scan to Pay (No Address Typing Required)</span>
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Instant Scan
                </span>
              </div>

              {savedQrUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qrOption"
                        checked={useSavedQr}
                        onChange={() => setUseSavedQr(true)}
                        className="accent-[#093A3E]"
                      />
                      <span>Use saved Profile QR Code</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="qrOption"
                        checked={!useSavedQr}
                        onChange={() => setUseSavedQr(false)}
                        className="accent-[#093A3E]"
                      />
                      <span>Upload different QR code</span>
                    </label>
                  </div>

                  {useSavedQr ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <img
                        src={savedQrUrl}
                        alt="Saved Payout QR"
                        className="w-14 h-14 object-contain rounded-lg border border-slate-100 flex-shrink-0"
                      />
                      <div className="text-xs">
                        <div className="font-extrabold text-[#001011] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Saved Payout QR Attached</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Admin will scan this QR code directly to disburse payment. Address input is not needed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {newQrPreview ? (
                        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                          <img
                            src={newQrPreview}
                            alt="New QR Preview"
                            className="w-14 h-14 object-contain rounded-lg border border-slate-100 flex-shrink-0"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-slate-800">New QR Selected</div>
                            <button
                              type="button"
                              onClick={handleRemoveNewQr}
                              className="text-rose-600 hover:text-rose-700 text-[11px] font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border border-dashed border-slate-300 hover:border-[#093A3E] rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer bg-white transition-colors">
                          <UploadCloud className="w-5 h-5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">Choose PNG, JPG, or WEBP QR image</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleQrFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {newQrPreview ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                      <img
                        src={newQrPreview}
                        alt="New QR Preview"
                        className="w-14 h-14 object-contain rounded-lg border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-slate-800">QR Code Attached</div>
                        <button
                          type="button"
                          onClick={handleRemoveNewQr}
                          className="text-rose-600 hover:text-rose-700 text-[11px] font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#093A3E] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                      <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">Upload Wallet / Payment QR Code</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Admin will scan to disburse funds directly</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleQrFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {newQrPreview && (
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 pt-1">
                      <input
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="rounded text-[#093A3E] focus:ring-[#3AAFB9]"
                      />
                      <span>Save this QR code to my profile for future withdrawals</span>
                    </label>
                  )}
                </div>
              )}

              {/* Optional Memo or Text Address */}
              <div className="pt-2 border-t border-slate-200/60">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Memo or Wallet Address <span className="text-slate-400">(Optional with QR Code)</span>
                </label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder="Optional memo, tag, or address (or leave empty)"
                  className="hm-input font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* ── Section B: Manual Address Payout Mode ── */}
          {payoutMode === "address" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Destination Address / Account Info <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder="e.g. TRC20 Wallet Address or Bank IBAN/SWIFT"
                  className="hm-input font-mono"
                />
              </div>

              {/* Optional QR Attachment in Address Mode */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attach QR Code Backup (Optional)</span>
                  </span>
                </div>

                {savedQrUrl && useSavedQr ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <img src={savedQrUrl} alt="QR" className="w-10 h-10 object-contain rounded flex-shrink-0" />
                    <span className="text-[11px] text-slate-600">Saved profile QR will also be sent with this request.</span>
                  </div>
                ) : (
                  newQrPreview ? (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <img src={newQrPreview} alt="QR" className="w-10 h-10 object-contain rounded flex-shrink-0" />
                      <button
                        type="button"
                        onClick={handleRemoveNewQr}
                        className="text-rose-600 text-[11px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="border border-dashed border-slate-300 rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-slate-50 text-xs text-slate-600">
                      <UploadCloud className="w-4 h-4 text-slate-400" />
                      <span>Attach QR Image (Optional)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleQrFileChange}
                        className="hidden"
                      />
                    </label>
                  )
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="hm-btn hm-btn-secondary text-[13px] cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[13px] font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing…</span></>
              ) : (
                <span>Request Withdrawal</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
