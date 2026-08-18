"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { TrendingUp, Plus, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Plan form states
  const [name, setName] = useState("");
  const [badge, setBadge] = useState("Popular");
  const [description, setDescription] = useState("");
  const [minAmount, setMinAmount] = useState("50");
  const [maxAmount, setMaxAmount] = useState("1000");
  const [roiPercentage, setRoiPercentage] = useState("3.5");
  const [intervalHours, setIntervalHours] = useState("24");
  const [totalPeriods, setTotalPeriods] = useState("30");
  const [capitalBack, setCapitalBack] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("investment_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPlans(data);
  };

  const handleToggleActive = async (planId: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from("investment_plans")
      .update({ is_active: !currentStatus })
      .eq("id", planId);

    fetchPlans();
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { error } = await supabase.from("investment_plans").insert({
      name,
      badge,
      description,
      min_amount: Number(minAmount),
      max_amount: Number(maxAmount),
      roi_percentage: Number(roiPercentage),
      payout_interval_hours: Number(intervalHours),
      total_payout_periods: Number(totalPeriods),
      capital_back: capitalBack,
      is_active: true,
    });

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: "Investment plan created successfully!", type: "success" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchPlans();
      }, 1000);
    }

    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Investment Plans Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">Configure interest yield rates, payout frequencies, and capital return rules.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
            setMsg(null);
          }}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/15"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="minimal-card p-6 border-slate-200 flex flex-col justify-between space-y-4 relative">
            
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase">
                  {plan.badge || "Standard"}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(plan.id, plan.is_active)}
                  className="flex items-center space-x-1 text-xs cursor-pointer"
                >
                  {plan.is_active ? (
                    <ToggleRight className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-400" />
                  )}
                  <span className={`text-[10px] font-bold ${plan.is_active ? "text-indigo-600" : "text-slate-400"}`}>
                    {plan.is_active ? "ACTIVE" : "DISABLED"}
                  </span>
                </button>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 mt-3">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description || "High-yield investment plan."}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ROI Rate:</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{plan.roi_percentage}% / period</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Interval:</span>
                  <span className="font-bold text-slate-900">{plan.payout_interval_hours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold text-slate-900">{plan.total_payout_periods} Periods</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Min - Max Deposit:</span>
                  <span className="font-mono font-extrabold text-slate-900">${plan.min_amount} - ${plan.max_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capital Return:</span>
                  <span className={`font-bold ${plan.capital_back ? "text-emerald-600" : "text-slate-400"}`}>
                    {plan.capital_back ? "Yes (Principal Returned)" : "No"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Create New Investment Plan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VIP Quantum Plan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Hot / Popular"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Minimum Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Maximum Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">ROI Yield (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={roiPercentage}
                    onChange={(e) => setRoiPercentage(e.target.value)}
                    placeholder="e.g. 5.5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Interval (Hours)</label>
                  <input
                    type="number"
                    required
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    placeholder="24 for Daily, 1 for Hourly"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Total Payout Periods</label>
                  <input
                    type="number"
                    required
                    value={totalPeriods}
                    onChange={(e) => setTotalPeriods(e.target.value)}
                    placeholder="30 times"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={capitalBack}
                      onChange={(e) => setCapitalBack(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                    />
                    <span>Capital Return at Completion</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this plan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full minimal-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {submitting ? "Creating Plan..." : "Publish Investment Plan"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
