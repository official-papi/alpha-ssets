"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { ShieldCheck, UserPlus, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminStaffPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (data) setAdmins(data);
  };

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { data: user, error: findError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", newEmail.trim())
      .single();

    if (findError || !user) {
      setMsg({ text: "No user found with that email address.", type: "error" });
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (updateError) {
      setMsg({ text: updateError.message, type: "error" });
    } else {
      setMsg({ text: `${user.email} promoted to Admin role successfully!`, type: "success" });
      setNewEmail("");
      fetchAdmins();
    }
    setSubmitting(false);
  };

  const handleDemoteAdmin = async (userId: string) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ role: "user" }).eq("id", userId);
    fetchAdmins();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Staff & Roles Management</h1>
        <p className="text-xs text-slate-500 mt-1">Promote team members to Admin privileges and manage backend access.</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
          msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add Staff Form */}
      <div className="minimal-card p-6 border-slate-200 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-indigo-600" />
          <span>Promote User to Admin Staff</span>
        </h3>

        <form onSubmit={handlePromoteAdmin} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">User Email Address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. staff@hyipmax.io"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto self-end minimal-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
          >
            {submitting ? "Promoting..." : "Promote to Admin"}
          </button>
        </form>
      </div>

      {/* Active Admins List */}
      <div className="minimal-card p-6 border-slate-200 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Active Super Admin & Staff Accounts</span>
        </h3>

        <div className="space-y-3">
          {admins.map((adm) => (
            <div key={adm.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <div className="font-extrabold text-slate-900">{adm.full_name || "Admin Staff"}</div>
                <div className="text-[11px] text-slate-500 font-mono">{adm.email}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase">
                  ADMIN ROLE
                </span>

                <button
                  type="button"
                  onClick={() => handleDemoteAdmin(adm.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Demote to Regular User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
