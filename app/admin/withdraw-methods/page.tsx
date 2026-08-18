"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ArrowUpRight, Plus, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminWithdrawMethodsPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [minLimit, setMinLimit] = useState("10");
  const [maxLimit, setMaxLimit] = useState("5000");
  const [fixedCharge, setFixedCharge] = useState("1");
  const [percentCharge, setPercentCharge] = useState("0.5");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("withdraw_methods")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMethods(data);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase.from("withdraw_methods").update({ status: !currentStatus }).eq("id", id);
    fetchMethods();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setMinLimit("10");
    setMaxLimit("5000");
    setFixedCharge("1");
    setPercentCharge("0.5");
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditingId(m.id);
    setName(m.name);
    setCode(m.code);
    setMinLimit(String(m.min_limit || 10));
    setMaxLimit(String(m.max_limit || 5000));
    setFixedCharge(String(m.fixed_charge || 0));
    setPercentCharge(String(m.percent_charge || 0));
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const payload = {
      name,
      code: code.toLowerCase().replace(/\s+/g, "_"),
      min_limit: Number(minLimit),
      max_limit: Number(maxLimit),
      fixed_charge: Number(fixedCharge),
      percent_charge: Number(percentCharge),
      status: true,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("withdraw_methods").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("withdraw_methods").insert(payload);
      error = res.error;
    }

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: `Withdrawal method ${editingId ? "updated" : "created"} successfully!`, type: "success" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchMethods();
      }, 1000);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Withdrawal Methods Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">Configure payout processing channels, min/max withdrawal limits, and payout fees.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/15"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payout Method</span>
        </button>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((m) => (
          <div key={m.id} className="minimal-card p-6 border-slate-200 flex flex-col justify-between space-y-4 relative">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase font-mono">
                  {m.code}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(m)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(m.id, m.status)}
                    className="flex items-center space-x-1 text-xs cursor-pointer"
                  >
                    {m.status ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 mt-3">{m.name}</h3>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Min - Max Payout:</span>
                  <span className="font-mono font-extrabold text-slate-900">${m.min_limit} - ${m.max_limit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Processing Charge:</span>
                  <span className="font-bold text-indigo-600">${m.fixed_charge} + {m.percent_charge}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">{editingId ? "Edit Withdrawal Method" : "Add Withdrawal Method"}</h3>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Method Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. USDT TRC20 Payout"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Method Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. usdt_trc20_w"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Min Limit ($)</label>
                  <input
                    type="number"
                    required
                    value={minLimit}
                    onChange={(e) => setMinLimit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Max Limit ($)</label>
                  <input
                    type="number"
                    required
                    value={maxLimit}
                    onChange={(e) => setMaxLimit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Fixed Charge ($)</label>
                  <input
                    type="number"
                    value={fixedCharge}
                    onChange={(e) => setFixedCharge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Percent Charge (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={percentCharge}
                    onChange={(e) => setPercentCharge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full minimal-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {submitting ? "Saving..." : editingId ? "Save Payout Method" : "Create Withdrawal Method"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
