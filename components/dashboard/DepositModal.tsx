"use client";

import { useState } from "react";
import { X, ArrowDownRight, Copy, Check, AlertCircle, Loader2, QrCode, UploadCloud, Trash2, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";
import { uploadDepositProof } from "@/lib/supabase/storage";

interface DepositModalProps {
  isOpen: boolean;
  gateways: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositModal({ isOpen, gateways, onClose, onSuccess }: DepositModalProps) {
  const [selectedGateway, setSelectedGateway] = useState<any>(gateways[0] ?? null);
  const [amount, setAmount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofUrlInput, setProofUrlInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep selectedGateway in sync when gateways list loads
  if (gateways.length > 0 && !selectedGateway) {
    setSelectedGateway(gateways[0]);
  }

  if (!isOpen) return null;

  const handleCopy = () => {
    if (selectedGateway?.wallet_address) {
      navigator.clipboard.writeText(selectedGateway.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      setProofPreviewUrl(URL.createObjectURL(file));
      setError(null);
    } else {
      setProofPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    setProofPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }
    if (selectedGateway) {
      const min = Number(selectedGateway.min_limit || 0);
      const max = Number(selectedGateway.max_limit || Infinity);
      if (numAmount < min) { setError(`Minimum deposit is $${min}`); return; }
      if (numAmount > max) { setError(`Maximum deposit is $${max}`); return; }
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (!activeUser) { setError("Session expired. Please log in again."); setLoading(false); return; }

    let finalProofUrl = proofUrlInput.trim();

    if (proofFile) {
      const uploadRes = await uploadDepositProof(proofFile, activeUser.id);
      if (uploadRes.error) {
        setError(uploadRes.error);
        setLoading(false);
        return;
      }
      finalProofUrl = uploadRes.url || "";
    }

    const fixedCharge = Number(selectedGateway.fixed_charge || 0);
    const percentCharge = (numAmount * Number(selectedGateway.percent_charge || 0)) / 100;
    const totalCharge = fixedCharge + percentCharge;
    const finalAmount = numAmount - totalCharge;

    const { error: insertError } = await supabase.from("deposits").insert({
      user_id: activeUser.id,
      amount: numAmount,
      charge: totalCharge,
      final_amount: finalAmount,
      gateway_name: selectedGateway.name,
      trx_id: trxId.trim() || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      proof_url: finalProofUrl || null,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="hm-modal-overlay">
      <div className="hm-modal max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#093A3E]/10 border border-[#093A3E]/20 flex items-center justify-center text-[#093A3E]">
            <ArrowDownRight className="w-5 h-5 text-[#3AAFB9]" />
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-[#001011]">Fund Deposit Wallet</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Transfer funds to invest in yield compounding plans</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-rose-700 text-[13px] font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gateway selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Payment Gateway
            </label>
            <select
              value={selectedGateway?.id ?? ""}
              onChange={(e) => {
                const found = gateways.find((g) => String(g.id) === e.target.value);
                if (found) setSelectedGateway(found);
              }}
              className="hm-input font-medium"
            >
              {gateways.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (Min: ${g.min_limit} – Max: ${g.max_limit})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Deposit Amount (USD)
            </label>
            <input
              type="number"
              min={selectedGateway?.min_limit || 1}
              max={selectedGateway?.max_limit || 100000}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="hm-input font-mono font-bold text-base"
            />
          </div>

          {/* Gateway payment details */}
          {selectedGateway && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gateway Instructions</div>

              {selectedGateway.qr_code && (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedGateway.qr_code}
                    alt="Gateway QR"
                    className="w-20 h-20 rounded-lg border border-slate-200 bg-white object-contain p-1"
                  />
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-800">Scan QR to pay directly</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use your mobile crypto wallet or payment app</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="font-mono text-[12px] text-slate-700 break-all select-all">
                  {selectedGateway.wallet_address || selectedGateway.account_number || "Payment address will be assigned"}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[#093A3E] hover:text-[#3AAFB9] flex-shrink-0 text-[12px] font-bold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {selectedGateway.instructions && (
                <p className="text-[11px] text-slate-500 leading-relaxed">{selectedGateway.instructions}</p>
              )}
            </div>
          )}

          {/* Transaction Hash */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Transaction Reference / Hash
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 0x8a9f... or Bank Reference #"
              className="hm-input font-mono"
            />
          </div>

          {/* Proof Upload with Live Preview */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Upload Payment Proof / Receipt Image
            </label>
            
            {proofPreviewUrl ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={proofPreviewUrl}
                    alt="Receipt Preview"
                    className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{proofFile?.name || "Payment Receipt"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {proofFile ? `${(proofFile.size / 1024).toFixed(1)} KB` : "Attached"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Receipt"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-300 hover:border-[#093A3E] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-white transition-colors">
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">Click to upload Receipt Image</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP, or PDF (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={proofUrlInput}
                  onChange={(e) => setProofUrlInput(e.target.value)}
                  placeholder="Or paste receipt image URL..."
                  className="hm-input text-xs"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="hm-btn hm-btn-secondary text-[13px] cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[13px] font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting…</span></>
              ) : (
                <span>Confirm Deposit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
