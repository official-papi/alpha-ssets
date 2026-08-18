"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { TrendingUp, Plus, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X, Edit2, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [badge, setBadge] = useState("Popular");
  const [description, setDescription] = useState("");
  const [minAmount, setMinAmount] = useState("500");
  const [maxAmount, setMaxAmount] = useState("2000");
  const [roiPercentage, setRoiPercentage] = useState("2.5");
  const [intervalHours, setIntervalHours] = useState("168");
  const [totalPeriods, setTotalPeriods] = useState("8");
  const [capitalBack, setCapitalBack] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // First try API route
      const res = await fetch("/api/admin/plans");
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setPlans(json.data);
      } else {
        // Fallback to direct client
        const supabase = createClient();
        const { data } = await supabase
          .from("investment_plans")
          .select("*")
          .order("min_amount", { ascending: true });
        if (data) setPlans(data);
      }
    } catch (e) {
      const supabase = createClient();
      const { data } = await supabase
        .from("investment_plans")
        .select("*")
        .order("min_amount", { ascending: true });
      if (data) setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setName("");
    setBadge("Growth Tier");
    setDescription("");
    setMinAmount("500");
    setMaxAmount("2000");
    setRoiPercentage("2.5");
    setIntervalHours("168");
    setTotalPeriods("8");
    setCapitalBack(true);
    setIsActive(true);
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setName(plan.name || "");
    setBadge(plan.badge || "Standard");
    setDescription(plan.description || "");
    setMinAmount(String(plan.min_amount || 500));
    setMaxAmount(String(plan.max_amount || 2000));
    setRoiPercentage(String(plan.roi_percentage || 2.5));
    setIntervalHours(String(plan.payout_interval_hours || 168));
    setTotalPeriods(String(plan.total_payout_periods || 8));
    setCapitalBack(plan.capital_back ?? true);
    setIsActive(plan.is_active ?? true);
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (plan: any) => {
    const newStatus = !plan.is_active;
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plan.id, is_active: newStatus }),
      });
      const json = await res.json();
      if (!json?.success) {
        // Fallback to direct client
        const supabase = createClient();
        await supabase
          .from("investment_plans")
          .update({ is_active: newStatus })
          .eq("id", plan.id);
      }
      fetchPlans();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const payload: any = {
      name,
      badge,
      description,
      min_amount: Number(minAmount),
      max_amount: Number(maxAmount),
      roi_percentage: Number(roiPercentage),
      payout_interval_hours: Number(intervalHours),
      total_payout_periods: Number(totalPeriods),
      capital_back: capitalBack,
      is_active: isActive,
    };

    if (editingPlan) {
      payload.id = editingPlan.id;
    }

    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json?.success) {
        setMsg({ text: json.message || "Plan saved successfully!", type: "success" });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchPlans();
        }, 800);
      } else {
        // Direct Supabase fallback
        const supabase = createClient();
        let error;
        if (editingPlan) {
          const { error: err } = await supabase
            .from("investment_plans")
            .update(payload)
            .eq("id", editingPlan.id);
          error = err;
        } else {
          const { error: err } = await supabase
            .from("investment_plans")
            .insert(payload);
          error = err;
        }

        if (error) {
          setMsg({ text: error.message, type: "error" });
        } else {
          setMsg({ text: "Investment plan saved successfully!", type: "success" });
          setTimeout(() => {
            setIsModalOpen(false);
            fetchPlans();
          }, 800);
        }
      }
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to save plan.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan: any) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${plan.name}"?\n\nIf this plan has existing investor investments, it will be safely disabled instead.`
    );
    if (!confirm) return;

    setDeletingId(plan.id);
    try {
      const res = await fetch(`/api/admin/plans?id=${plan.id}`, { method: "DELETE" });
      const json = await res.json();

      if (json?.success) {
        alert(json.message || "Plan deleted successfully.");
        fetchPlans();
      } else {
        // Direct Supabase fallback
        const supabase = createClient();
        const { error } = await supabase
          .from("investment_plans")
          .delete()
          .eq("id", plan.id);

        if (error) {
          // If foreign key prevents delete, offer to disable
          const disable = window.confirm(
            `Could not permanently delete because users have active investments in this plan (${error.message}).\n\nWould you like to deactivate/disable this plan instead?`
          );
          if (disable) {
            await supabase.from("investment_plans").update({ is_active: false }).eq("id", plan.id);
            fetchPlans();
          }
        } else {
          alert("Plan deleted successfully.");
          fetchPlans();
        }
      }
    } catch (err: any) {
      alert(`Error deleting plan: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Investment Packages Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">Manage return rates, deposit bounds, compounding intervals, and plan visibility.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/15 font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-600" />
          <span className="text-xs font-semibold">Loading investment plans...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <TrendingUp className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Investment Plans Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Create your first investment tier to allow investors to allocate funds.</p>
          <button
            onClick={handleOpenCreate}
            className="minimal-btn-primary px-4 py-2 rounded-xl text-xs font-bold"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`minimal-card p-6 border-slate-200 flex flex-col justify-between space-y-4 relative transition-all ${
                !plan.is_active ? "opacity-60 bg-slate-50/70 border-dashed" : "bg-white hover:border-indigo-200"
              }`}
            >
              <div>
                {/* Header Badge & Active Switch */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase">
                    {plan.badge || "Standard"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    className="flex items-center space-x-1 text-xs cursor-pointer hover:opacity-80"
                    title={plan.is_active ? "Click to Disable" : "Click to Enable"}
                  >
                    {plan.is_active ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                    <span className={`text-[10px] font-bold ${plan.is_active ? "text-emerald-700" : "text-slate-400"}`}>
                      {plan.is_active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </button>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mt-3">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description || "Structured yield investment package."}</p>

                {/* Metrics Table */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Return Rate:</span>
                    <span className="font-extrabold text-indigo-600 font-mono">
                      {plan.roi_percentage}% {plan.payout_interval_hours === 168 ? "/ week" : plan.payout_interval_hours === 24 ? "/ day" : `/ ${plan.payout_interval_hours}h`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interval Frequency:</span>
                    <span className="font-bold text-slate-900">
                      {plan.payout_interval_hours === 168 ? "Every Week (168h)" : plan.payout_interval_hours === 24 ? "Every Day (24h)" : `${plan.payout_interval_hours} Hours`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Duration:</span>
                    <span className="font-bold text-slate-900">{plan.total_payout_periods} Periods</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min - Max Deposit:</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      ${Number(plan.min_amount).toLocaleString()} - ${Number(plan.max_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capital Return:</span>
                    <span className={`font-bold ${plan.capital_back ? "text-emerald-600" : "text-slate-400"}`}>
                      {plan.capital_back ? "Yes (Principal Returned)" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(plan)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Package</span>
                </button>

                <button
                  type="button"
                  disabled={deletingId === plan.id}
                  onClick={() => handleDeletePlan(plan)}
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer disabled:opacity-50"
                  title="Delete Package"
                >
                  {deletingId === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-xl space-y-4 shadow-2xl relative text-slate-800 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingPlan ? `Edit Package: ${editingPlan.name}` : "Create New Investment Package"}
                </h3>
                <p className="text-[11px] text-slate-400">Configure yields, deposit boundaries, and duration intervals.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
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

            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gold Package"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Most Popular, Exclusive"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Minimum Deposit ($)</label>
                  <input
                    type="number"
                    required
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Maximum Deposit ($)</label>
                  <input
                    type="number"
                    required
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Return Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={roiPercentage}
                    onChange={(e) => setRoiPercentage(e.target.value)}
                    placeholder="e.g. 6.0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Interval (Hours)</label>
                  <input
                    type="number"
                    required
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    placeholder="168 for Weekly, 24 for Daily"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">168 = 1 Week | 24 = 1 Day</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Payout Periods</label>
                  <input
                    type="number"
                    required
                    value={totalPeriods}
                    onChange={(e) => setTotalPeriods(e.target.value)}
                    placeholder="e.g. 16 periods"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-2">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={capitalBack}
                      onChange={(e) => setCapitalBack(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                    />
                    <span>Capital Return at Completion</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                    />
                    <span>Active for New Investors</span>
                  </label>
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Special Features</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 6.0% weekly return. Includes 🏠 Company House Loan Eligibility..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="minimal-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Package...</span>
                    </>
                  ) : (
                    <span>{editingPlan ? "Save Changes" : "Publish Package"}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
