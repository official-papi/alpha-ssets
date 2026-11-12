"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InvestmentsTable from "@/components/dashboard/InvestmentsTable";
import NewInvestmentModal from "@/components/dashboard/NewInvestmentModal";
import InvestmentDetailsModal from "@/components/dashboard/InvestmentDetailsModal";
import { Plus, Calculator, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

const DEFAULT_PLANS = [
  { id: "plan-1", name: "Regular Package", min_amount: 500, max_amount: 20000, interest_rate: 5.0, return_type: "weekly", repeat_time: 8 },
  { id: "plan-2", name: "Premium Package", min_amount: 20000, max_amount: 5000000, interest_rate: 8.5, return_type: "weekly", repeat_time: 16 },
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [depositWallet, setDepositWallet] = useState(0);
  const [interestWallet, setInterestWallet] = useState(0);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [selectedInvForDetails, setSelectedInvForDetails] = useState<any | null>(null);

  // ROI Simulator States
  const [simAmount, setSimAmount] = useState<number>(1000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-1");

  const [dbPlans, setDbPlans] = useState<any[]>(DEFAULT_PLANS);

  const [syncingPayouts, setSyncingPayouts] = useState(false);

  const fetchInvestments = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setUserEmail(activeUser.email);

      // Auto-process matured ROI payouts on DB
      try {
        await supabase.rpc("process_investment_payouts_rpc");
      } catch (err) {
        console.error("Auto payout RPC error:", err);
      }

      const { data: profile } = await supabase.from("profiles").select("deposit_wallet, interest_wallet").eq("id", activeUser.id).single();
      if (profile) {
        setDepositWallet(Number(profile.deposit_wallet || 0));
        setInterestWallet(Number(profile.interest_wallet || 0));
      }

      const { data: invs } = await supabase
        .from("user_investments")
        .select("*, investment_plans(name, badge, capital_back)")
        .eq("user_id", activeUser.id)
        .order("created_at", { ascending: false });

      if (invs) {
        const formattedInvs = invs.map((inv: any) => ({
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
          nextPayout: inv.next_payout_at
            ? new Date(inv.next_payout_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Active",
          status: inv.status,
          created_at: inv.created_at,
        }));
        setInvestments(formattedInvs);
      }

      const { data: livePlans } = await supabase.from("investment_plans").select("*").eq("is_active", true);
      if (livePlans && livePlans.length > 0) {
        const formattedPlans = livePlans.map((p: any) => ({
          id: p.id,
          name: p.name,
          min_amount: Number(p.min_amount),
          max_amount: Number(p.max_amount),
          interest_rate: Number(p.roi_percentage),
          return_type: "weekly",
          repeat_time: p.total_payout_periods,
        }));
        setDbPlans(formattedPlans);
        if (formattedPlans[0]) setSelectedPlanId(formattedPlans[0].id);
      }
    }
  };

  const handleManualSync = async () => {
    setSyncingPayouts(true);
    await fetchInvestments();
    setSyncingPayouts(false);
  };

  useEffect(() => {
    fetchInvestments();
    // 30s background auto-sync for live payouts
    const timer = setInterval(() => {
      fetchInvestments();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const availablePlans = dbPlans.length > 0 ? dbPlans : DEFAULT_PLANS;
  const activeSimPlan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0] || DEFAULT_PLANS[0];
  const simDailyYield = activeSimPlan ? (simAmount * activeSimPlan.interest_rate) / 100 : 0;
  const simTotalNetProfit = activeSimPlan ? simDailyYield * activeSimPlan.repeat_time : 0;
  const simTotalReturn = simAmount + simTotalNetProfit;

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-8 text-[#20281f]">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20281f]">Active Investment Portfolio</h1>
            <p className="text-xs sm:text-sm text-[#60695b] mt-1">Track your active yield compounding packages and test ROI projections.</p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncingPayouts}
              className="px-4 py-2 rounded-[7px] border border-[#e4e7dc] bg-white hover:bg-[#fafaf5] text-[#20281f] text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#86a951] ${syncingPayouts ? "animate-spin" : ""}`} />
              <span>{syncingPayouts ? "Syncing..." : "Sync Due Payouts"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvestOpen(true)}
              className="min-h-[42px] px-5 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-[#d1f18b]" />
              <span>Invest In New Package</span>
            </button>
          </div>
        </div>

        {/* ROI Profit Simulator Card */}
        <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#20281f] flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-[#86a951]" />
              <span>Interactive ROI Profit Projection Simulator</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#627446] bg-[#f4f7ec] px-3 py-1 rounded-full border border-[#dfe6d2] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#86a951] animate-pulse" />
              Live Compound Yields
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="block text-xs font-bold text-[#20281f] uppercase tracking-wider mb-1">Select Investment Tier</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-[#fafaf5] border border-[#e4e7dc] rounded-[8px] px-3 py-2 text-xs font-semibold text-[#20281f] focus:outline-hidden focus:border-[#20281f]"
                >
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.interest_rate}% ROI)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#20281f] uppercase tracking-wider mb-1">Enter Capital Amount ($)</label>
                <input
                  type="number"
                  step="50"
                  min={activeSimPlan?.min_amount || 500}
                  max={activeSimPlan?.max_amount || 20000000}
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full bg-[#fafaf5] border border-[#e4e7dc] rounded-[8px] px-3 py-2 text-xs font-mono font-bold text-[#20281f] focus:outline-hidden focus:border-[#20281f]"
                />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#e3f2c9]/30 border border-[#c4ee70] rounded-[8px] p-4 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-[#476b1b] uppercase">Estimated Yield / Period</div>
                <div className="text-xl font-mono font-bold text-[#476b1b] mt-1">
                  +${simDailyYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] text-[#7d8573] mt-1 font-mono">{activeSimPlan.interest_rate}% ROI / Payout</div>
              </div>

              <div className="bg-[#fafaf5] border border-[#e4e7dc] rounded-[8px] p-4 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-[#7d8573] uppercase">Total Net Profit</div>
                <div className="text-xl font-mono font-bold text-[#20281f] mt-1">
                  +${simTotalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] text-[#7d8573] mt-1 font-mono">Over {activeSimPlan.repeat_time} Payout Periods</div>
              </div>

              <div className="bg-[#fafaf5] border border-[#e4e7dc] rounded-[8px] p-4 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-[#7d8573] uppercase">Total Return (Principal + Profit)</div>
                <div className="text-xl font-mono font-bold text-[#20281f] mt-1">
                  ${simTotalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] text-[#7d8573] mt-1 font-mono">Full Liquidity Unlocked</div>
              </div>
            </div>
          </div>
        </div>

        <InvestmentsTable
          investments={investments}
          onOpenInvest={() => setIsInvestOpen(true)}
          onSelectInvestment={(inv) => setSelectedInvForDetails(inv)}
        />

        <NewInvestmentModal
          isOpen={isInvestOpen}
          onClose={() => setIsInvestOpen(false)}
          depositBalance={depositWallet}
          interestBalance={interestWallet}
          plans={availablePlans}
          onSuccess={fetchInvestments}
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
