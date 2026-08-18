"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { CreditCard, Plus, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, X, Edit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminGatewaysPage() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [minLimit, setMinLimit] = useState("10");
  const [maxLimit, setMaxLimit] = useState("10000");
  const [fixedCharge, setFixedCharge] = useState("0");
  const [percentCharge, setPercentCharge] = useState("0");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("gateways")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setGateways(data);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase.from("gateways").update({ status: !currentStatus }).eq("id", id);
    fetchGateways();
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setWalletAddress("");
    setInstructions("");
    setQrCodeUrl("");
    setQrCodeFile(null);
    setMinLimit("10");
    setMaxLimit("10000");
    setFixedCharge("0");
    setPercentCharge("0");
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: any) => {
    setEditingId(g.id);
    setName(g.name);
    setCode(g.code);
    setWalletAddress(g.wallet_address || "");
    setInstructions(g.instructions || "");
    setQrCodeUrl(g.qr_code_url || "");
    setQrCodeFile(null);
    setMinLimit(String(g.min_limit || 10));
    setMaxLimit(String(g.max_limit || 10000));
    setFixedCharge(String(g.fixed_charge || 0));
    setPercentCharge(String(g.percent_charge || 0));
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    let finalQrUrl = qrCodeUrl;

    if (qrCodeFile) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(qrCodeFile.type)) {
        setMsg({ text: "Invalid QR Code image. Allowed formats: JPG, PNG, WEBP.", type: "error" });
        setSubmitting(false);
        return;
      }
      if (qrCodeFile.size > 5 * 1024 * 1024) {
        setMsg({ text: "QR Code image exceeds 5MB limit.", type: "error" });
        setSubmitting(false);
        return;
      }

      const fileExt = qrCodeFile.name.split(".").pop();
      const fileName = `gateways/qr_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("deposit-proofs")
        .upload(fileName, qrCodeFile, { upsert: true });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabase.storage.from("deposit-proofs").getPublicUrl(uploadData.path);
        finalQrUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      name,
      code: code.toLowerCase().replace(/\s+/g, "_"),
      wallet_address: walletAddress,
      instructions,
      qr_code_url: finalQrUrl || null,
      min_limit: Number(minLimit),
      max_limit: Number(maxLimit),
      fixed_charge: Number(fixedCharge),
      percent_charge: Number(percentCharge),
      status: true,
    };

    let error;
    if (editingId) {
      const res = await supabase.from("gateways").update(payload).eq("id", editingId);
      error = res.error;
    } else {
      const res = await supabase.from("gateways").insert(payload);
      error = res.error;
    }

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: `Gateway ${editingId ? "updated" : "created"} successfully!`, type: "success" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchGateways();
      }, 1000);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Payment Deposit Gateways</h1>
          <p className="text-xs text-slate-500 mt-1">Configure crypto wallet addresses, bank details, and deposit fees.</p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/15"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Gateway</span>
        </button>
      </div>

      {/* Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateways.map((g) => (
          <div key={g.id} className="minimal-card p-6 border-slate-200 flex flex-col justify-between space-y-4 relative">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase font-mono">
                  {g.code}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(g)}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(g.id, g.status)}
                    className="flex items-center space-x-1 text-xs cursor-pointer"
                  >
                    {g.status ? <ToggleRight className="w-6 h-6 text-indigo-600" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 mt-3">{g.name}</h3>
              <p className="text-xs font-mono text-slate-500 mt-1 truncate">{g.wallet_address || "No address set"}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Min - Max Deposit:</span>
                  <span className="font-mono font-extrabold text-slate-900">${g.min_limit} - ${g.max_limit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deposit Charge:</span>
                  <span className="font-bold text-indigo-600">${g.fixed_charge} + {g.percent_charge}%</span>
                </div>
                {g.instructions && (
                  <div className="pt-2 text-[11px] text-slate-500 line-clamp-2">
                    {g.instructions}
                  </div>
                )}
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
              <h3 className="text-sm font-extrabold text-slate-900">{editingId ? "Edit Gateway" : "Add Payment Gateway"}</h3>
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
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Gateway Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. USDT (TRC20)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Unique Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. usdt_trc20"
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

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Wallet Address / Account Details</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="e.g. T9yD14Nj9j7x8kL2m1n0PqRsTuVwXyZ3aB"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Payment Instructions for User</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions shown to user during deposit..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Gateway QR Code Image (Optional)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => setQrCodeFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <input
                    type="text"
                    value={qrCodeUrl}
                    onChange={(e) => setQrCodeUrl(e.target.value)}
                    placeholder="Or paste QR Code image URL..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                  {qrCodeUrl && (
                    <div className="flex items-center space-x-2 pt-1">
                      <img src={qrCodeUrl} alt="QR Code Preview" className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                      <span className="text-[10px] text-slate-500">QR Code Preview</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full minimal-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {submitting ? "Saving..." : editingId ? "Save Gateway Changes" : "Create Payment Gateway"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
