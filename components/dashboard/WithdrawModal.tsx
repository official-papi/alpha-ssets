"use client";

import { useEffect, useState } from "react";
import { X, ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("withdraw_methods").select("*").eq("status", true);
      if (data && data.length > 0) {
        setMethods(data);
        setSelectedMethod(data[0]);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBalance = walletType === "interest_wallet" ? interestBalance : depositBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setError("Please enter a valid withdrawal amount."); return; }
    if (numAmount > currentBalance) { setError(`Insufficient balance. Available: $${currentBalance.toLocaleString()}`); return; }
    if (!accountDetails.trim()) { setError("Please provide your destination wallet address or bank account info."); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (!activeUser) { setError("Session expired."); setLoading(false); return; }

    const { data: rpcResult, error: rpcError } = await supabase.rpc("request_withdrawal_rpc", {
      p_user_id: activeUser.id,
      p_wallet_type: walletType,
      p_amount: numAmount,
      p_method_name: selectedMethod.name,
      p_account_details: { details: accountDetails },
    });

    if (rpcError || (rpcResult && !rpcResult.success)) {
      const fixedCharge = Number(selectedMethod.fixed_charge || 0);
      const percentCharge = (numAmount * Number(selectedMethod.percent_charge || 0)) / 100;
      const totalCharge = fixedCharge + percentCharge;
      const netAmount = numAmount - totalCharge;
      const { error: insertError } = await supabase.from("withdrawals").insert({
        user_id: activeUser.id, amount: numAmount, charge: totalCharge, net_amount: netAmount,
        method_name: selectedMethod.name, account_details: { details: accountDetails }, status: "pending",
      });
      if (insertError) { setError(insertError.message || rpcResult?.message || "Failed to submit request."); setLoading(false); return; }
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="hm-modal-overlay">
      <div className="hm-modal max-w-lg">
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

          {/* Destination */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Destination Address / Account Info
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="hm-btn hm-btn-secondary text-[13px] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="py-2.5 px-5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-[13px] font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all">
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
