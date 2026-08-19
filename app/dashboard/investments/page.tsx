"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InvestmentsTable from "@/components/dashboard/InvestmentsTable";
import NewInvestmentModal from "@/components/dashboard/NewInvestmentModal";
import { Plus, Calculator, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_PLANS = [
  { id: "plan-1", name: "Regular Package", min_amount: 500, max_amount: 2000, interest_rate: 2.5, return_type: "weekly", repeat_time: 8 },
  { id: "plan-2", name: "Silver Package", min_amount: 3000, max_amount: 5000, interest_rate: 4.0, return_type: "weekly", repeat_time: 12 },
  { id: "plan-3", name: "Gold Package", min_amount: 10000, max_amount: 20000, interest_rate: 6.0, return_type: "weekly", repeat_time: 16 },
  { id: "plan-4", name: "VIP Package", min_amount: 50000, max_amount: 200000, interest_rate: 10.0, return_type: "weekly", repeat_time: 24 },
  { id: "plan-5", name: "Ultimate Package", min_amount: 500000, max_amount: 3000000, interest_rate: 12.0, return_type: "weekly", repeat_time: 36 },
  { id: "plan-6", name: "Elites Package", min_amount: 5000000, max_amount: 20000000, interest_rate: 15.5, return_type: "weekly", repeat_time: 52 },
];

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [depositWallet, setDepositWallet] = useState(0);
  const [interestWallet, setInterestWallet] = useState(0);
  const [isInvestOpen, setIsInvestOpen] = useState(false);

  // ROI Simulator States
  const [simAmount, setSimAmount] = useState<number>(1000);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-2");

  const [dbPlans, setDbPlans] = useState<any[]>(DEFAULT_PLANS);

  const fetchInvestments = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      const { data: profile } = await supabase.from("profiles").select("deposit_wallet, interest_wallet").eq("id", user.id).single();
      if (profile) {
        setDepositWallet(Number(profile.deposit_wallet || 0));
        setInterestWallet(Number(profile.interest_wallet || 0));
      }

      const { data: invs } = await supabase
        .from("user_investments")
        .select("*, investment_plans(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (invs) {
        const formattedInvs = invs.map((inv: any) => ({
          id: inv.id,
          planName: inv.investment_plans?.name || "Active Tier",
          amount: Number(inv.invest_amount || inv.amount || 0),
          dailyReturn: Number(inv.payout_per_period || inv.daily_return || 0),
          totalPayouts: inv.total_payout_periods || inv.total_payouts || 30,
          completedPayouts: inv.paid_periods || inv.payouts_completed || 0,
          nextPayout: inv.next_payout_at
            ? new Date(inv.next_payout_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Active",
          status: inv.status,
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

  useEffect(() => {
    fetchInvestments();
  }, []);

  const availablePlans = dbPlans.length > 0 ? dbPlans : DEFAULT_PLANS;
  const activeSimPlan = availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0] || DEFAULT_PLANS[0];
  const simDailyYield = activeSimPlan ? (simAmount * activeSimPlan.interest_rate) / 100 : 0;
  const simTotalNetProfit = activeSimPlan ? simDailyYield * activeSimPlan.repeat_time : 0;
  const simTotalReturn = simAmount + simTotalNetProfit;

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Active Investment Portfolio</h1>
            <p className="text-xs text-slate-500 mt-1">Track your active yield compounding packages and test ROI projections.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsInvestOpen(true)}
            className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/15 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Invest In New Package</span>
          </button>
        </div>

        {/* ROI Profit Simulator Card */}
        <div className="minimal-card p-6 border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Interactive ROI Profit Projection Simulator</span>
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Live Compound Yields
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Select Investment Tier</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {availablePlans.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.interest_rate}% / wk)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Enter Capital Amount ($)</label>
                <input
                  type="number"
                  step="50"
                  min={activeSimPlan?.min_amount || 500}
                  max={activeSimPlan?.max_amount || 20000000}
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-600 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Estimated Daily Yield</div>
                <div className="text-xl font-mono font-extrabold text-emerald-600 mt-1">+${simDailyYield.toFixed(2)}</div>
                <div className="text-[9px] text-slate-400 mt-1">{activeSimPlan.interest_rate}% Daily ROI</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Net Profit</div>
                <div className="text-xl font-mono font-extrabold text-indigo-600 mt-1">+${simTotalNetProfit.toFixed(2)}</div>
                <div className="text-[9px] text-slate-400 mt-1">Over {activeSimPlan.repeat_time} Days</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Return (Principal + Profit)</div>
                <div className="text-xl font-mono font-extrabold text-slate-900 mt-1">${simTotalReturn.toFixed(2)}</div>
                <div className="text-[9px] text-slate-400 mt-1">Full Liquidity Unlocked</div>
              </div>
            </div>
          </div>
        </div>

        <InvestmentsTable investments={investments} onOpenInvest={() => setIsInvestOpen(true)} />

        <NewInvestmentModal
          isOpen={isInvestOpen}
          onClose={() => setIsInvestOpen(false)}
          depositBalance={depositWallet}
          interestBalance={interestWallet}
          plans={availablePlans}
          onSuccess={fetchInvestments}
        />

      </div>
    </DashboardLayout>
  );
}
