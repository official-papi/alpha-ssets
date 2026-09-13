"use client";

import { useState } from "react";
import { X, TrendingUp, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

interface InvestmentPlan {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  return_type: string;
  repeat_time: number;
}

interface NewInvestmentModalProps {
  isOpen: boolean;
  depositBalance: number;
  interestBalance?: number;
  plans: InvestmentPlan[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewInvestmentModal({
  isOpen,
  depositBalance,
  interestBalance = 0,
  plans,
  onClose,
  onSuccess,
}: NewInvestmentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(plans[0] || null);
  const [walletType, setWalletType] = useState<"deposit_wallet" | "interest_wallet">("deposit_wallet");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBalance = walletType === "deposit_wallet" ? depositBalance : interestBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) { setError("Please select an investment plan."); return; }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < selectedPlan.min_amount || numAmount > selectedPlan.max_amount) {
      setError(`Amount must be between $${selectedPlan.min_amount.toLocaleString()} and $${selectedPlan.max_amount.toLocaleString()} for the ${selectedPlan.name} plan.`);
      return;
    }
    if (numAmount > currentBalance) {
      setError(`Insufficient balance. Available: $${currentBalance.toLocaleString()}`);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (!activeUser) { setError("Session expired. Please log in again."); setLoading(false); return; }

    const { data: rpcResult, error: rpcError } = await supabase.rpc("process_investment_rpc", {
      p_user_id: activeUser.id,
      p_plan_id: selectedPlan.id,
      p_amount: numAmount,
      p_wallet_type: walletType,
    });

    if (rpcError || (rpcResult && !rpcResult.success)) {
      setError(rpcError?.message || rpcResult?.message || "Failed to process investment.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  const dailyRoi = selectedPlan && amount && !isNaN(parseFloat(amount))
    ? (parseFloat(amount) * selectedPlan.interest_rate) / 100
    : null;

  return (
    <div className="hm-modal-overlay">
      <div className="hm-modal max-w-xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-slate-900">Invest in Plan</h3>
            <p className="text-[12px] text-slate-400 mt-0.5">Subscribe to automated yield generation</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-red-600 text-[13px] font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Plan Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Select Investment Tier ({plans.length})
              </label>
              {selectedPlan && (
                <span className="text-[11px] font-medium text-indigo-600">
                  {selectedPlan.name} selected
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/60">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPlan?.id === p.id
                      ? "border-indigo-500 bg-white ring-2 ring-indigo-500/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <p className="text-[13px] font-bold text-slate-900 truncate">{p.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[14px] font-extrabold text-indigo-600 font-mono">{p.interest_rate}%</span>
                    <span className="text-[10px] font-medium text-slate-400">/ week</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>{p.repeat_time} wks</span>
                    <span className="font-semibold text-slate-700">${p.min_amount.toLocaleString()}–${p.max_amount.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Pay From
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWalletType("deposit_wallet")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  walletType === "deposit_wallet"
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] font-medium text-slate-500">Deposit Wallet</p>
                <p className="text-[18px] font-bold text-slate-900 mt-1 font-mono">${depositBalance.toLocaleString()}</p>
              </button>
              <button
                type="button"
                onClick={() => setWalletType("interest_wallet")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  walletType === "interest_wallet"
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] font-medium text-slate-500">Interest Wallet</p>
                <p className="text-[18px] font-bold text-emerald-600 mt-1 font-mono">${interestBalance.toLocaleString()}</p>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Investment Amount (USD)
              </label>
              {selectedPlan && (
                <span className="text-[11px] text-slate-400">
                  ${selectedPlan.min_amount.toLocaleString()} – ${selectedPlan.max_amount.toLocaleString()}
                </span>
              )}
            </div>
            <input
              type="number"
              min={selectedPlan?.min_amount || 500}
              max={selectedPlan?.max_amount || 20000000}
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="hm-input"
            />
          </div>

          {/* ROI Preview */}
          {selectedPlan && dailyRoi !== null && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-700 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Projected Returns
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Weekly ROI:</span>
                <span className="font-semibold text-indigo-700">${dailyRoi.toFixed(2)} / week</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Total Return ({selectedPlan.repeat_time} weeks):</span>
                <span className="font-bold text-slate-900">${(dailyRoi * selectedPlan.repeat_time).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="hm-btn hm-btn-secondary text-[13px] cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="hm-btn hm-btn-primary text-[13px] cursor-pointer">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Subscribing…</span></>
              ) : (
                <span>Confirm Investment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
