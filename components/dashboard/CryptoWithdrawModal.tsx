"use client";

import { useState, useEffect } from "react";
import { X, ArrowUpRight, AlertCircle, Loader2, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";
import { CryptoAssetItem } from "./CryptoAssetCards";

interface CryptoWithdrawModalProps {
  isOpen: boolean;
  assets: CryptoAssetItem[];
  preSelectedSymbol?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CryptoWithdrawModal({
  isOpen,
  assets,
  preSelectedSymbol,
  onClose,
  onSuccess,
}: CryptoWithdrawModalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("XRP");
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationTag, setDestinationTag] = useState("");
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
  const availableBal = currentAsset?.balance || 0;
  const numAmount = parseFloat(amount) || 0;
  const price = currentAsset?.priceUsd || 1;
  const approxUsd = numAmount * price;

  const handleMax = () => {
    if (availableBal > 0) {
      setAmount(availableBal.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError(`Please enter a valid amount of ${selectedSymbol} to withdraw.`);
      return;
    }
    if (numAmount > availableBal) {
      setError(`Insufficient ${selectedSymbol} balance. You have ${availableBal.toFixed(4)} ${selectedSymbol} available.`);
      return;
    }
    if (!destinationAddress.trim()) {
      setError(`Please provide your external ${selectedSymbol} receiving address.`);
      return;
    }
    if (currentAsset?.requiresTag && !destinationTag.trim()) {
      // Warn if tag is required
      const confirmNoTag = window.confirm(
        "XRP destinations usually require a Destination Tag. Are you sure your destination wallet does not require a Tag?"
      );
      if (!confirmNoTag) return;
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

      // Standard withdrawal payload
      const standardPayload: any = {
        user_id: activeUser.id,
        amount: approxUsd,
        charge: 0,
        net_amount: approxUsd,
        method_name: `${selectedSymbol} (${currentAsset?.network || "Crypto"})`,
        account_details: {
          currency: selectedSymbol,
          crypto_amount: numAmount,
          destination_address: destinationAddress.trim(),
          destination_tag: destinationTag.trim() || null,
        },
        status: "pending",
      };

      // Try with extended columns first
      let { error: withdrawErr } = await supabase.from("withdrawals").insert({
        ...standardPayload,
        crypto_symbol: selectedSymbol,
        crypto_amount: numAmount,
        destination_address: destinationAddress.trim(),
        destination_tag: destinationTag.trim() || null,
      });

      // Fallback if custom columns not added yet
      if (withdrawErr && (withdrawErr.message.includes("column") || withdrawErr.code === "PGRST204")) {
        const retryRes = await supabase.from("withdrawals").insert(standardPayload);
        withdrawErr = retryRes.error;
      }

      if (withdrawErr) {
        setError(withdrawErr.message);
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
            <ArrowUpRight className="w-5 h-5 text-[#3AAFB9]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#001011]">Withdraw Crypto Asset</h3>
            <p className="text-xs text-slate-400">Withdraw directly from your available cryptocurrency account</p>
          </div>
        </div>

        {/* Coin Selector */}
        <div className="mb-5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Select Asset to Withdraw
          </label>
          <div className="grid grid-cols-5 gap-2">
            {assets.map((coin) => {
              const isSelected = coin.symbol === selectedSymbol;
              return (
                <button
                  key={coin.symbol}
                  type="button"
                  onClick={() => {
                    setSelectedSymbol(coin.symbol);
                    setAmount("");
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

        {/* Available Balance Stat */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Available {selectedSymbol} Balance</span>
            <span className="text-lg font-black font-mono text-[#001011]">
              {availableBal.toFixed(4)} {selectedSymbol}
            </span>
          </div>
          <button
            type="button"
            onClick={handleMax}
            className="py-1 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#093A3E] shadow-2xs transition-all cursor-pointer"
          >
            Max All
          </button>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Withdrawal Amount ({selectedSymbol})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.000001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`0.00 ${selectedSymbol}`}
                className="w-full py-2.5 pl-3 pr-20 rounded-xl border border-slate-200 font-mono text-sm font-bold text-[#001011] focus:outline-none focus:border-[#3AAFB9]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {selectedSymbol}
              </div>
            </div>
            {numAmount > 0 && (
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Estimated USD: <span className="font-bold text-[#093A3E] font-mono">≈ ${approxUsd.toFixed(2)}</span>
              </p>
            )}
          </div>

          {/* Destination Address */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Destination {selectedSymbol} Wallet Address
            </label>
            <input
              type="text"
              required
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder={`Enter valid ${currentAsset?.network || selectedSymbol} address`}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-mono text-xs text-[#001011] focus:outline-none focus:border-[#3AAFB9]"
            />
          </div>

          {/* Destination Tag for XRP */}
          {currentAsset?.requiresTag && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  XRP Destination Tag / Memo
                </label>
                <span className="text-[10px] text-slate-400 font-medium">(If required by recipient)</span>
              </div>
              <input
                type="text"
                value={destinationTag}
                onChange={(e) => setDestinationTag(e.target.value)}
                placeholder="e.g. 100492"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 font-mono text-xs text-[#001011] focus:outline-none focus:border-[#3AAFB9]"
              />
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || availableBal <= 0}
            className="w-full py-3 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#3AAFB9]" />
                <span>Processing Request...</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 text-[#3AAFB9]" />
                <span>Confirm Withdrawal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
