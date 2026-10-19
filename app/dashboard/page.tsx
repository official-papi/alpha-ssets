"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OverviewCards from "@/components/dashboard/OverviewCards";
import InvestmentsTable from "@/components/dashboard/InvestmentsTable";
import DepositModal from "@/components/dashboard/DepositModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import NewInvestmentModal from "@/components/dashboard/NewInvestmentModal";
import InvestmentDetailsModal from "@/components/dashboard/InvestmentDetailsModal";
import { Copy, Check, Sparkles, RefreshCw, X, CheckCircle2, AlertCircle, Wallet, ShieldCheck, Cpu, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useWallet } from "@/lib/wallet/WalletContext";

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  deposit_wallet: number;
  interest_wallet: number;
  referral_code: string;
  role?: string;
}

const DEFAULT_PLANS = [
  { id: "plan-1", name: "Basic Plan", min_amount: 200, max_amount: 4999, interest_rate: 3.5, return_type: "weekly", repeat_time: 8 },
  { id: "plan-2", name: "Premium Plan", min_amount: 5000, max_amount: 1000000, interest_rate: 7.0, return_type: "weekly", repeat_time: 16 },
];

export default function DashboardPage() {
  const { isConnected, shortAddress, balanceUsdt, isTradingDelegated, escrowLocked, openModal, toggleTradingDelegation } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [investments, setInvestments] = useState<any[]>([]);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [totalWithdrawnSum, setTotalWithdrawnSum] = useState(0);
  const [copiedRef, setCopiedRef] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [isReinvestOpen, setIsReinvestOpen] = useState(false);
  const [selectedInvForDetails, setSelectedInvForDetails] = useState<any | null>(null);

  // Reinvest Form state
  const [reinvestAmount, setReinvestAmount] = useState("");
  const [reinvesting, setReinvesting] = useState(false);
  const [reinvestMsg, setReinvestMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [isImpersonating, setIsImpersonating] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Process any due investment payouts in the background
    try {
      await fetch("/api/cron/payouts", { method: "POST" });
    } catch {}

    const impersonatedId = typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_id") : null;
    const targetUserId = impersonatedId || user.id;
    if (impersonatedId) setIsImpersonating(true);

    const [profileRes, investRes, withdrawRes, plansRes, gatewaysRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", targetUserId).single(),
      supabase.from("user_investments").select("*, investment_plans(name, badge, capital_back)").eq("user_id", targetUserId),
      supabase.from("withdrawals").select("net_amount").eq("user_id", targetUserId).eq("status", "approved"),
      supabase.from("investment_plans").select("*").eq("is_active", true),
      supabase.from("gateways").select("*").eq("status", true),
    ]);

    if (gatewaysRes.data && gatewaysRes.data.length > 0) {
      setGateways(gatewaysRes.data);
    }

    const validPlans = (plansRes.data || []).filter((p: any) => {
      const n = (p.name || "").toLowerCase();
      return n.includes("basic") || n.includes("premium");
    });

    if (validPlans.length > 0) {
      setDbPlans(
        validPlans.map((p: any) => ({
          id: p.id,
          name: p.name,
          min_amount: Number(p.min_amount),
          max_amount: Number(p.max_amount),
          interest_rate: Number(p.roi_percentage),
          return_type: "weekly",
          repeat_time: p.total_payout_periods,
        }))
      );
    } else {
      setDbPlans(DEFAULT_PLANS);
    }

    if (profileRes.data) {
      setProfile({
        id: profileRes.data.id,
        email: profileRes.data.email || (typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_email") : "") || user.email,
        full_name: profileRes.data.full_name || (impersonatedId ? "Investor" : user.user_metadata?.full_name) || "Investor",
        deposit_wallet: Number(profileRes.data.deposit_wallet || 0),
        interest_wallet: Number(profileRes.data.interest_wallet || 0),
        referral_code: profileRes.data.referral_code || "REF-789",
        role: profileRes.data.role || "user",
      });
    }

    if (investRes.data && investRes.data.length > 0) {
      setInvestments(
        investRes.data.map((inv: any) => ({
          id: inv.id,
          planName: inv.investment_plans?.name || "Active Tier",
          badge: inv.investment_plans?.badge || "Active Package",
          capital_back: inv.investment_plans?.capital_back ?? true,
          amount: Number(inv.invest_amount || inv.amount || 0),
          dailyReturn: Number(inv.payout_per_period || inv.daily_return || 0),
          totalPayouts: inv.total_payout_periods || inv.total_payouts || 30,
          completedPayouts: inv.paid_periods || inv.payouts_completed || 0,
          total_profit_earned: Number(inv.total_profit_earned || 0),
          next_payout_at: inv.next_payout_at,
          nextPayout: inv.next_payout_at ? new Date(inv.next_payout_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Active",
          status: inv.status,
          created_at: inv.created_at,
        }))
      );
    } else {
      setInvestments([]);
    }

    if (withdrawRes.data) {
      const sum = withdrawRes.data.reduce((acc: number, curr: any) => acc + Number(curr.net_amount || 0), 0);
      setTotalWithdrawnSum(sum);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTransferEarnings = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(reinvestAmount);
    if (!amt || amt <= 0) return;

    if (!profile || profile.interest_wallet < amt) {
      setReinvestMsg({ text: "Insufficient Interest Wallet balance for transfer.", type: "error" });
      return;
    }

    setReinvesting(true);
    setReinvestMsg(null);

    const supabase = createClient();
    const newInterest = profile.interest_wallet - amt;
    const newDeposit = profile.deposit_wallet + amt;

    await supabase.from("profiles").update({
      interest_wallet: newInterest,
      deposit_wallet: newDeposit,
    }).eq("id", profile.id);

    await supabase.from("wallet_transactions").insert({
      user_id: profile.id,
      type: "reinvest",
      amount: amt,
      wallet_type: "deposit_wallet",
      description: `Transferred $${amt.toFixed(2)} from Interest Earnings to Deposit Wallet for compounding`,
    });

    setReinvestMsg({ text: "Earnings transferred to Deposit Wallet successfully!", type: "success" });
    setTimeout(() => {
      setIsReinvestOpen(false);
      setReinvestAmount("");
      setReinvestMsg(null);
      fetchDashboardData();
    }, 1200);

    setReinvesting(false);
  };

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${profile?.referral_code || "ALPHA789"}`
    : `https://alpha-assets.com/register?ref=${profile?.referral_code || "ALPHA789"}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const totalInvested = investments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <DashboardLayout userEmail={profile?.email}>
      <div className="space-y-8">
        {/* Institutional Command Terminal Banner */}
        <div className="relative group overflow-hidden rounded-2xl border border-[#093A3E] bg-[#001011] p-6 sm:p-8 shadow-xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(58,175,185,0.12),transparent_70%)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#093A3E]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093A3E]/60 border border-[#3AAFB9]/40 text-[#3AAFB9] text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#3AAFB9]" />
                <span>Executive Terminal · Welcome Back, {profile?.full_name || "Investor"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Institutional Wealth Console
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
                Algorithmic yield tracking, verified ledger execution, and instant wallet compounding at tier-1 security standards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setIsReinvestOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white border border-[#3AAFB9]/40 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition-all hover:border-[#3AAFB9]"
              >
                <RefreshCw className="w-4 h-4 text-[#3AAFB9]" />
                <span>Reinvest Earnings</span>
              </button>

              <div className="bg-[#093A3E]/40 border border-[#3AAFB9]/30 p-2.5 px-4 rounded-xl flex items-center justify-between gap-3 backdrop-blur-sm">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Referral ID</div>
                  <div className="text-xs font-mono font-extrabold text-[#3AAFB9]">{profile?.referral_code || "ALPHA789"}</div>
                </div>
                <button
                  onClick={copyReferral}
                  className="bg-[#001011] hover:bg-[#093A3E] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#3AAFB9]/40 cursor-pointer transition-colors shadow-2xs"
                  title="Copy Referral Link"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-[#3AAFB9]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Web3 AI Trading Vault & Escrow Status Console */}
        <div className="bg-[#001011] border border-[#093A3E] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-[#3AAFB9] uppercase tracking-wider">
                  Escrow System: 100% Protected
                </span>
                <span className="text-[#093A3E]">|</span>
                <span className="text-[11px] text-[#86cbd1] font-mono">Neural Model: Live</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#3AAFB9]" />
                <span>Company AI Automated Trade Execution</span>
              </h2>
              <p className="text-xs text-[#86cbd1] leading-relaxed">
                Connect your Web3 wallet to authorize automated algorithmic trades executed on your behalf. Our AI algorithms analyze global liquidity to make smarter decisions on <strong>when to buy and sell</strong>. All funds remain protected by multi-signature smart escrow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-3 bg-[#041819] border border-[#3AAFB9]/30 px-4 py-2.5 rounded-xl">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Connected Web3 Wallet</div>
                    <div className="text-xs font-mono font-extrabold text-[#3AAFB9]">{shortAddress}</div>
                  </div>
                  <button
                    type="button"
                    onClick={openModal}
                    className="text-xs font-bold bg-[#093A3E] hover:bg-[#3AAFB9] text-white hover:text-[#001011] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Manage Vault
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openModal}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#3AAFB9] to-[#278e98] hover:from-[#5cb4be] hover:to-[#3AAFB9] text-[#001011] text-xs font-black shadow-lg shadow-[#3AAFB9]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Wallet className="w-4 h-4 text-[#001011]" />
                  <span>Connect Wallet to Trade</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Balances Grid */}
        <OverviewCards
          depositBalance={profile?.deposit_wallet || 0}
          interestBalance={profile?.interest_wallet || 0}
          totalInvested={totalInvested}
          totalWithdrawn={totalWithdrawnSum}
          onOpenDeposit={() => setIsDepositOpen(true)}
          onOpenWithdraw={() => setIsWithdrawOpen(true)}
          onOpenInvest={() => setIsInvestOpen(true)}
        />

        {/* Active Investments Tracker */}
        <InvestmentsTable
          investments={investments}
          onOpenInvest={() => setIsInvestOpen(true)}
          onSelectInvestment={(inv) => setSelectedInvForDetails(inv)}
        />

        {/* Reinvest / Internal Transfer Modal */}
        {isReinvestOpen && profile && (
          <div className="hm-modal-overlay">
            <div className="hm-modal max-w-md space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#093A3E]/10 border border-[#093A3E]/20 flex items-center justify-center text-[#093A3E]">
                    <RefreshCw className="w-4 h-4 text-[#093A3E]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Reinvest Interest Earnings</h3>
                    <p className="text-[11px] text-slate-400">Zero-fee internal wallet transfer</p>
                  </div>
                </div>
                <button onClick={() => setIsReinvestOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#f0f8f9] border border-[#3AAFB9]/30 rounded-xl p-3.5 text-xs text-[#093A3E] font-medium leading-relaxed">
                Transfer earnings from your <strong className="font-mono text-[#001011]">${profile.interest_wallet.toFixed(2)}</strong> Interest Wallet to your Deposit Wallet to immediately compound into higher-tier investment plans.
              </div>

              {reinvestMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                  reinvestMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}>
                  {reinvestMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <span>{reinvestMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleTransferEarnings} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Transfer Amount ($)</label>
                    <span className="text-[11px] text-slate-400 font-mono">Max: ${profile.interest_wallet.toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={profile.interest_wallet}
                    required
                    value={reinvestAmount}
                    onChange={(e) => setReinvestAmount(e.target.value)}
                    placeholder="100.00"
                    className="hm-input font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reinvesting}
                  className="w-full py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#3AAFB9] ${reinvesting ? "animate-spin" : ""}`} />
                  <span>{reinvesting ? "Transferring Funds..." : "Transfer to Deposit Wallet"}</span>
                </button>
              </form>

            </div>
          </div>
        )}

        {/* Modals */}
        <DepositModal
          isOpen={isDepositOpen}
          gateways={gateways}
          onClose={() => setIsDepositOpen(false)}
          onSuccess={fetchDashboardData}
        />

        <WithdrawModal
          isOpen={isWithdrawOpen}
          interestBalance={profile?.interest_wallet || 0}
          depositBalance={profile?.deposit_wallet || 0}
          onClose={() => setIsWithdrawOpen(false)}
          onSuccess={fetchDashboardData}
        />

        <NewInvestmentModal
          isOpen={isInvestOpen}
          depositBalance={profile?.deposit_wallet || 0}
          interestBalance={profile?.interest_wallet || 0}
          plans={dbPlans.length > 0 ? dbPlans : DEFAULT_PLANS}
          onClose={() => setIsInvestOpen(false)}
          onSuccess={fetchDashboardData}
        />

        <InvestmentDetailsModal
          isOpen={!!selectedInvForDetails}
          investment={selectedInvForDetails}
          onClose={() => setSelectedInvForDetails(null)}
        />
      </div>
    </DashboardLayout>
  );
}
