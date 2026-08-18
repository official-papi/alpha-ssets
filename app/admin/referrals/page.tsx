"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Share2, Plus, Save, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminReferralsPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [newLevelNum, setNewLevelNum] = useState("");
  const [newPercent, setNewPercent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchReferralLevels();
  }, []);

  const fetchReferralLevels = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("referral_levels")
      .select("*")
      .order("level", { ascending: true });

    if (data) setLevels(data);
  };

  const handleUpdateLevel = async (id: string, commissionPercent: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("referral_levels")
      .update({ commission_percent: commissionPercent })
      .eq("id", id);

    if (!error) {
      setMsg({ text: "Referral level percentage updated!", type: "success" });
      fetchReferralLevels();
    }
  };

  const handleDeleteLevel = async (id: string) => {
    const supabase = createClient();
    await supabase.from("referral_levels").delete().eq("id", id);
    fetchReferralLevels();
  };

  const handleAddLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { error } = await supabase.from("referral_levels").insert({
      level: Number(newLevelNum),
      commission_percent: Number(newPercent),
      type: "deposit",
      is_active: true,
    });

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: `Level ${newLevelNum} created successfully!`, type: "success" });
      setNewLevelNum("");
      setNewPercent("");
      fetchReferralLevels();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Multi-Tier Referral Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure level-by-level referral commission percentages for downline investors.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
          msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Existing Referral Levels Card */}
      <div className="minimal-card p-6 border-slate-200 space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>Active Commission Hierarchy</span>
        </h3>

        <div className="space-y-3">
          {levels.map((lvl) => (
            <div key={lvl.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center font-extrabold font-mono text-indigo-700">
                  L{lvl.level}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">Level {lvl.level} Referrer</div>
                  <div className="text-[10px] text-slate-500">Applies on user deposit</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={lvl.commission_percent}
                    onBlur={(e) => handleUpdateLevel(lvl.id, Number(e.target.value))}
                    className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-extrabold text-indigo-600 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <span className="font-bold text-slate-500">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteLevel(lvl.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Referral Level Form */}
      <div className="minimal-card p-6 border-slate-200 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Add New Commission Tier</span>
        </h3>

        <form onSubmit={handleAddLevel} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-1/3">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Level Number</label>
            <input
              type="number"
              required
              value={newLevelNum}
              onChange={(e) => setNewLevelNum(e.target.value)}
              placeholder="e.g. 4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="w-full sm:w-1/3">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Commission Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              required
              value={newPercent}
              onChange={(e) => setNewPercent(e.target.value)}
              placeholder="e.g. 0.5"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto self-end minimal-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
          >
            {submitting ? "Adding..." : "Add Referral Level"}
          </button>
        </form>
      </div>

    </div>
  );
}
