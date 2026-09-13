"use client";

import { useState } from "react";
import { X, ArrowDownRight, Copy, Check, AlertCircle, Loader2, QrCode } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }
    if (numAmount < (selectedGateway.min_limit || 10) || numAmount > (selectedGateway.max_limit || 100000)) {
      setError(`Amount must be between $${selectedGateway.min_limit} and $${selectedGateway.max_limit}`);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (!activeUser) { setError("Session expired. Please log in again."); setLoading(false); return; }

    let finalProofUrl = proofUrlInput;
    if (proofFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(proofFile.type)) {
        setError("Invalid file format. Only JPG, PNG, WEBP, and PDF are allowed.");
        setLoading(false); return;
      }
      if (proofFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        setLoading(false); return;
      }
      const fileExt = proofFile.name.split(".").pop();
      const fileName = `${activeUser.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("deposit-proofs")
        .upload(fileName, proofFile, { upsert: true });
      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from("deposit-proofs").getPublicUrl(uploadData.path);
        finalProofUrl = publicUrlData.publicUrl;
      }
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
      trx_id: trxId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
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
      <div className="hm-modal max-w-lg">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-slate-900">Deposit Funds</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Add funds to your Deposit Wallet</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-red-600 text-[13px] font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Gateway Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Payment Gateway
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/60">
              {gateways.map((g) => (
                <button
                  key={g.id || g.code}
                  type="button"
                  onClick={() => setSelectedGateway(g)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedGateway?.id === g.id
                      ? "border-indigo-500 bg-white ring-2 ring-indigo-500/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <p className="text-[12px] font-semibold text-slate-900 truncate">{g.name}</p>
                  <p className="text-[11px] text-indigo-600 font-medium mt-0.5">${g.min_limit}–${g.max_limit}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Deposit Amount (USD)
            </label>
            <input
              type="number"
              min={selectedGateway?.min_limit || 10}
              max={selectedGateway?.max_limit || 100000}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min: $${selectedGateway?.min_limit || 10}`}
              className="hm-input"
            />
          </div>

          {/* Payment Details */}
          {selectedGateway && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-600">{selectedGateway.name} Details</span>
                <span className="text-[11px] text-slate-400">
                  Fee: ${selectedGateway.fixed_charge || 0} + {selectedGateway.percent_charge || 0}%
                </span>
              </div>

              {/* QR Code */}
              {selectedGateway.qr_code_url && (
                <div className="flex flex-col items-center gap-2 bg-white border border-slate-200 rounded-xl p-4">
                  <img
                    src={selectedGateway.qr_code_url}
                    alt={`${selectedGateway.name} QR Code`}
                    className="w-32 h-32 object-contain rounded-lg"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <QrCode className="w-3 h-3" />
                    Scan to Pay
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2.5 gap-2">
                <span className="text-[12px] font-mono text-slate-700 truncate">{selectedGateway.wallet_address || "Contact Admin"}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 flex-shrink-0 text-[12px] font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {selectedGateway.instructions && (
                <p className="text-[11px] text-slate-500">{selectedGateway.instructions}</p>
              )}
            </div>
          )}

          {/* Transaction Hash */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Transaction Reference / Hash
            </label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 0x8a9f... or Bank Reference #"
              className="hm-input"
            />
          </div>

          {/* Proof Upload */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Upload Payment Proof
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="block w-full text-[12px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <input
                type="text"
                value={proofUrlInput}
                onChange={(e) => setProofUrlInput(e.target.value)}
                placeholder="Or paste receipt image URL..."
                className="hm-input text-[13px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="hm-btn hm-btn-secondary text-[13px] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="hm-btn hm-btn-primary text-[13px] cursor-pointer">
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
