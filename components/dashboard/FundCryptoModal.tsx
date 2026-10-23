"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Loader2, CheckCircle2, ArrowRight, Wallet, ArrowDownRight } from "lucide-react";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";
import { CryptoAssetItem } from "./CryptoAssetCards";

interface FundCryptoModalProps {
  isOpen: boolean;
  depositBalance: number;
  assets: CryptoAssetItem[];
  preSelectedSymbol?: string;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDeposit: () => void;
}

export default function FundCryptoModal({
  isOpen,
  depositBalance,
  assets,
  preSelectedSymbol = "ATFC",
  onClose,
  onSuccess,
  onOpenDeposit,
}: FundCryptoModalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("ATFC");
  const [amountUsd, setAmountUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedSymbol) {
      setSelectedSymbol(preSelectedSymbol.toUpperCase());
    }
  }, [preSelectedSymbol]);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];
  const unitPrice = currentAsset?.priceUsd || 1.0;
  const numUsd = parseFloat(amountUsd) || 0;
  const cryptoAmount = unitPrice > 0 ? numUsd / unitPrice : 0;
  const isInsufficient = numUsd > depositBalance;

  const handleQuickPercent = (pct: number) => {
    const val = (depositBalance * pct).toFixed(2);
    setAmountUsd(val);
    setError(null);
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numUsd <= 0) {
      setError("Please enter a valid amount to fund.");
      return;
    }

    if (numUsd > depositBalance) {
      setError(`Insufficient platform wallet balance ($${depositBalance.toFixed(2)}). Please deposit to your platform wallet first.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const impersonatedId = typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_id") : null;

      const res = await fetch("/api/crypto/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedSymbol,
          amountUsd: numUsd,
          impersonateUserId: impersonatedId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to fund asset.");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || `Successfully funded ${cryptoAmount.toFixed(4)} ${selectedSymbol}!`);
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setAmountUsd("");
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
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
            <Sparkles className="w-5 h-5 text-[#3AAFB9]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#001011]">Fund Crypto From Platform Wallet</h3>
            <p className="text-xs text-slate-400">Allocate your platform cash balance directly into any supported crypto</p>
          </div>
        </div>

        {/* Step Indicator / Workflow Info */}
        <div className="bg-[#f0f8f9] border border-[#3AAFB9]/30 rounded-xl p-3.5 mb-5 text-xs text-[#093A3E] space-y-1.5">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Available Platform Deposit Wallet:</span>
            </span>
            <span className="font-mono text-sm text-[#001011] font-black">${depositBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            Your deposited funds can be freely allocated across <strong>American Trust Fund</strong>, <strong>XRP</strong>, <strong>Bitcoin</strong>, <strong>Ethereum</strong>, or <strong>Solana</strong>.
          </p>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {isInsufficient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#093A3E] text-white text-[11px] font-bold shrink-0 hover:bg-[#001011]"
              >
                Deposit Now
              </button>
            )}
          </div>
        )}

        {/* Asset Selection Grid */}
        <div className="mb-5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            1. Select Coin / Asset to Fund
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {assets.map((asset) => {
              const isSelected = asset.symbol === selectedSymbol;
              const isAtfc = asset.symbol === "ATFC";
              return (
                <button
                  key={asset.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(asset.symbol);
                    setError(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "border-[#3AAFB9] bg-[#093A3E] text-white shadow-md ring-1 ring-[#3AAFB9]/40"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  {isAtfc && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-[#3AAFB9] text-[#001011]">
                      Featured
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <CryptoCoinIcon symbol={asset.symbol} className="w-5 h-5 flex-shrink-0" />
                    <span className="font-extrabold font-mono text-xs truncate">{asset.symbol}</span>
                  </div>
                  <div className={`text-[11px] font-bold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {asset.name}
                  </div>
                  <div className={`text-[10px] font-mono mt-1 ${isSelected ? "text-[#3AAFB9]" : "text-slate-500"}`}>
                    1 {asset.symbol} ≈ ${asset.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Funding Form */}
        <form onSubmit={handleFund} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                2. Amount to Allocate from Platform Wallet ($ USD)
              </label>
              <div className="flex gap-1.5">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-base">$</span>
              <input
                type="number"
                step="any"
                min="1"
                max={depositBalance}
                required
                value={amountUsd}
                onChange={(e) => {
                  setAmountUsd(e.target.value);
                  setError(null);
                }}
                placeholder="1000.00"
                className="w-full py-2.5 pl-8 pr-16 rounded-xl border border-slate-200 font-mono text-base font-extrabold text-[#001011] focus:outline-none focus:border-[#3AAFB9]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
            </div>
          </div>

          {/* Real-time Crypto Conversion Preview */}
          {numUsd > 0 && (
            <div className="bg-[#001011] border border-[#093A3E] text-white rounded-xl p-4 space-y-2 shadow-md">
              <div className="flex items-center justify-between text-xs text-[#86cbd1]">
                <span>Allocating to:</span>
                <span className="font-extrabold text-white">{currentAsset?.name} ({selectedSymbol})</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#86cbd1] border-b border-[#093A3E] pb-2">
                <span>Exchange Valuation:</span>
                <span className="font-mono text-white">1 {selectedSymbol} = ${unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#3AAFB9] font-bold">You will receive:</span>
                <span className="font-mono text-base font-extrabold text-[#3AAFB9]">
                  {cryptoAmount.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} {selectedSymbol}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || numUsd <= 0 || isInsufficient}
              className="py-2.5 px-6 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#3AAFB9]" />
                  <span>Allocating Funds...</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-[#3AAFB9]" />
                  <span>Confirm Funding {selectedSymbol}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
