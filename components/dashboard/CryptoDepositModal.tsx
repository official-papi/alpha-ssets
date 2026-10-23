"use client";

import { useState, useEffect } from "react";
import { X, ArrowDownRight, Copy, Check, AlertCircle, Loader2, QrCode, UploadCloud, Trash2, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";
import { uploadDepositProof } from "@/lib/supabase/storage";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";
import { CryptoAssetItem } from "./CryptoAssetCards";

interface CryptoDepositModalProps {
  isOpen: boolean;
  assets: CryptoAssetItem[];
  preSelectedSymbol?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CryptoDepositModal({
  isOpen,
  assets,
  preSelectedSymbol,
  onClose,
  onSuccess,
}: CryptoDepositModalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("XRP");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedSymbol) {
      setSelectedSymbol(preSelectedSymbol.toUpperCase());
    } else if (assets.length > 0) {
      setSelectedSymbol(assets[0].symbol);
    }
  }, [preSelectedSymbol, assets]);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  const price = currentAsset?.priceUsd || 1;
  const numAmount = parseFloat(cryptoAmount) || 0;
  const approxUsd = numAmount * price;

  const depositAddress =
    currentAsset?.walletAddress ||
    (selectedSymbol === "XRP"
      ? "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh"
      : selectedSymbol === "BTC"
      ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      : selectedSymbol === "ETH"
      ? "0x71C83d3b7da5F23e098a5F38A88950d81745Fe1e"
      : selectedSymbol === "SOL"
      ? "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
      : selectedSymbol === "ATFC"
      ? "0x892aF75dE163B8d6263B2dD6C9eA75d5032F5e71"
      : "T9yD14Nj9j7x8kL2m1n0PqRsTuVwXyZ3aB");

  const tagValue = currentAsset?.tagValue || "583921";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyTag = () => {
    navigator.clipboard.writeText(tagValue);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError(`Please enter a valid amount of ${selectedSymbol} to deposit.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const activeUser = await getActiveUser(supabase);
      if (!activeUser) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      let proofUrl: string | null = null;
      if (proofFile) {
        const uploadRes = await uploadDepositProof(proofFile, activeUser.id);
        if (uploadRes.error) {
          setError(uploadRes.error);
          setLoading(false);
          return;
        }
        proofUrl = uploadRes.url || null;
      }

      const generatedRef = `DEP-${selectedSymbol}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Insert deposit tagged with exact crypto symbol and amount
      const standardPayload: any = {
        user_id: activeUser.id,
        amount: approxUsd,
        charge: 0,
        final_amount: approxUsd,
        gateway_name: `${selectedSymbol} - ${numAmount} ${selectedSymbol}`,
        trx_id: txHash.trim() || generatedRef,
        proof_url: proofUrl,
        status: "pending",
      };

      // Try with extended columns first
      let { error: insertError } = await supabase.from("deposits").insert({
        ...standardPayload,
        crypto_symbol: selectedSymbol,
        crypto_amount: numAmount,
        tx_hash: txHash.trim() || null,
      });

      // If column doesn't exist in existing schema, retry with standard payload
      if (insertError && (insertError.message.includes("column") || insertError.code === "PGRST204")) {
        const retryRes = await supabase.from("deposits").insert(standardPayload);
        insertError = retryRes.error;
      }

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
      } else {
        setLoading(false);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="hm-modal-overlay">
      <div className="hm-modal max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#093A3E]/10 border border-[#093A3E]/20 flex items-center justify-center text-[#093A3E]">
            <ArrowDownRight className="w-5 h-5 text-[#3AAFB9]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#001011]">Deposit Cryptocurrency</h3>
            <p className="text-xs text-slate-400">Funds are credited directly to your dedicated asset account</p>
          </div>
        </div>

        {/* Coin Selector Tabs */}
        <div className="mb-5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Asset to Deposit
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {assets.map((coin) => {
              const isSelected = coin.symbol === selectedSymbol;
              return (
                <button
                  key={coin.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(coin.symbol);
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#093A3E] text-white border-[#093A3E] shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <CryptoCoinIcon
                    symbol={coin.symbol}
                    className={`w-5 h-5 ${isSelected ? "text-[#3AAFB9]" : "text-slate-600"}`}
                  />
                  <span className="text-[11px] font-black">{coin.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deposit Address Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">{currentAsset?.name} ({currentAsset?.network})</span>
            <span className="font-mono text-[11px] font-bold text-[#093A3E]">
              1 {selectedSymbol} ≈ ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Deposit Address */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Your {selectedSymbol} Deposit Address:
            </span>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-mono text-[#001011] font-bold flex-1 break-all select-all">
                {depositAddress}
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer flex-shrink-0"
                title="Copy Address"
              >
                {copiedAddress ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Destination Tag for XRP */}
          {currentAsset?.requiresTag && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold mb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>XRP Destination Tag Required!</span>
              </div>
              <p className="text-[10px] text-amber-700 mb-2">
                You must include this Destination Tag when sending XRP, or your deposit cannot be identified.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-300">
                <span className="text-xs font-mono font-black text-amber-950 flex-1">{tagValue}</span>
                <button
                  type="button"
                  onClick={handleCopyTag}
                  className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedTag ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTag ? "Copied" : "Copy Tag"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crypto Amount */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Deposit Amount in {selectedSymbol}
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.000001"
                required
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                placeholder={`0.00 ${selectedSymbol}`}
                className="w-full py-2.5 pl-3 pr-20 rounded-xl border border-slate-200 font-mono text-sm font-bold text-[#001011] focus:outline-none focus:border-[#3AAFB9]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {selectedSymbol}
              </div>
            </div>
            {numAmount > 0 && (
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Estimated Valuation: <span className="font-bold text-[#093A3E] font-mono">≈ ${approxUsd.toFixed(2)} USD</span>
              </p>
            )}
          </div>

          {/* Transaction Hash / ID */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Blockchain Transaction Hash (TxID)
            </label>
            <input
              type="text"
              required
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste transaction hash / TxID from wallet"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-mono text-xs text-[#001011] focus:outline-none focus:border-[#3AAFB9]"
            />
          </div>

          {/* Upload Screenshot / Proof */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Deposit Screenshot / Receipt (Optional)
            </label>
            {proofPreviewUrl ? (
              <div className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofPreviewUrl} alt="Receipt preview" className="h-14 w-auto rounded object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setProofFile(null);
                    setProofPreviewUrl(null);
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#3AAFB9] transition-all bg-slate-50/50">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-600">Click to upload transfer screenshot</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#3AAFB9]" />
                <span>Submitting Verification...</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-[#3AAFB9]" />
                <span>Confirm {selectedSymbol} Deposit</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
