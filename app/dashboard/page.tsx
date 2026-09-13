"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OverviewCards from "@/components/dashboard/OverviewCards";
import InvestmentsTable from "@/components/dashboard/InvestmentsTable";
import DepositModal from "@/components/dashboard/DepositModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import NewInvestmentModal from "@/components/dashboard/NewInvestmentModal";
import InvestmentDetailsModal from "@/components/dashboard/InvestmentDetailsModal";
import { Copy, Check, Sparkles, RefreshCw, X, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  { id: "plan-1", name: "Regular Package", min_amount: 500, max_amount: 2000, interest_rate: 2.5, return_type: "weekly", repeat_time: 8 },
  { id: "plan-2", name: "Silver Package", min_amount: 3000, max_amount: 5000, interest_rate: 4.0, return_type: "weekly", repeat_time: 12 },
  { id: "plan-3", name: "Gold Package", min_amount: 10000, max_amount: 20000, interest_rate: 6.0, return_type: "weekly", repeat_time: 16 },
  { id: "plan-4", name: "VIP Package", min_amount: 50000, max_amount: 200000, interest_rate: 10.0, return_type: "weekly", repeat_time: 24 },
  { id: "plan-5", name: "Ultimate Package", min_amount: 500000, max_amount: 3000000, interest_rate: 12.0, return_type: "weekly", repeat_time: 36 },
  { id: "plan-6", name: "Elites Package", min_amount: 5000000, max_amount: 20000000, interest_rate: 15.5, return_type: "weekly", repeat_time: 52 },
];

export default function DashboardPage() {
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

    if (plansRes.data && plansRes.data.length > 0) {
      setDbPlans(
        plansRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          min_amount: Number(p.min_amount),
          max_amount: Number(p.max_amount),
          interest_rate: Number(p.roi_percentage),
          return_type: "daily",
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
        {/* Glassmorphism Command Banner */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-200/80 text-indigo-700 text-xs font-extrabold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Welcome Back, {profile?.full_name || "Investor"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Investor Command Center
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xl font-medium">
                Automated high-yield investment tracking, real-time ROI returns, and instant wallet compounding.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
              <button
                onClick={() => setIsReinvestOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer backdrop-blur-xs shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>Reinvest Earnings</span>
              </button>

              <div className="bg-slate-50/80 p-2.5 px-4 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 backdrop-blur-xs">
                <div className="text-[10px] uppercase font-extrabold text-slate-400">Referral Code</div>
                <div className="text-xs font-mono font-extrabold text-indigo-600">{profile?.referral_code}</div>
                <button
                  onClick={copyReferral}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
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
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Reinvest Interest Earnings</h3>
                <button onClick={() => setIsReinvestOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3 text-xs text-indigo-900 font-medium">
                Transfer funds from your <strong className="font-mono">$ {profile.interest_wallet.toFixed(2)}</strong> Interest Wallet to your Deposit Wallet for zero-fee compounding.
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
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Transfer Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={profile.interest_wallet}
                    required
                    value={reinvestAmount}
                    onChange={(e) => setReinvestAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reinvesting}
                  className="w-full minimal-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
                >
                  {reinvesting ? "Transferring Funds..." : "Transfer to Deposit Wallet"}
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
