"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Users, Search, PlusCircle, MinusCircle, CheckCircle2, AlertCircle, X, ShieldOff, ShieldCheck, FileText, Printer } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Balance modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetWallet, setTargetWallet] = useState<"deposit_wallet" | "interest_wallet">("deposit_wallet");
  const [action, setAction] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Financial Statement Modal states
  const [statementUser, setStatementUser] = useState<any | null>(null);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingStatement, setLoadingStatement] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setUsers(data);
  };

  const handleOpenBalanceModal = (user: any) => {
    setSelectedUser(user);
    setAmount("");
    setRemark("");
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleToggleFreezeUser = async (userId: string, currentBanned: boolean) => {
    const supabase = createClient();
    await supabase.from("profiles").update({ is_banned: !currentBanned }).eq("id", userId);
    fetchUsers();
  };

  const handleOpenStatement = async (user: any) => {
    setStatementUser(user);
    setLoadingStatement(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setUserTransactions(data || []);
    setLoadingStatement(false);
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("admin_adjust_balance_rpc", {
      p_user_id: selectedUser.id,
      p_target_wallet: targetWallet,
      p_action: action,
      p_amount: Number(amount),
      p_remark: remark || `Admin balance adjustment (${action})`,
    });

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else if (data && !data.success) {
      setMsg({ text: data.message, type: "error" });
    } else {
      setMsg({ text: "User balance updated successfully!", type: "success" });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchUsers();
      }, 1200);
    }

    setSubmitting(false);
  };

  const filteredUsers = users.filter((u) =>
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage investor accounts, freeze/unfreeze wallets, and inspect statements.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search user, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="minimal-card p-6 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3">User Details</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Deposit Wallet</th>
                <th className="pb-3">Interest Wallet</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No users matching search query found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3">
                      <div className="font-extrabold text-slate-900">{user.full_name || user.username || "User"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        user.role === "admin" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        user.is_banned ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {user.is_banned ? "FROZEN" : "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">${Number(user.deposit_wallet || 0).toFixed(2)}</td>
                    <td className="py-3 font-mono font-bold text-indigo-600">${Number(user.interest_wallet || 0).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-[260px]">
                        <button
                          type="button"
                          onClick={() => handleOpenStatement(user)}
                          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                          title="View Financial Audit Statement"
                        >
                          Statement
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFreezeUser(user.id, user.is_banned)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                            user.is_banned ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {user.is_banned ? "Unfreeze" : "Freeze"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sessionStorage.setItem("impersonate_user_id", user.id);
                            sessionStorage.setItem("impersonate_user_email", user.email || "");
                            window.location.href = "/dashboard";
                          }}
                          className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                          title="Impersonate & view dashboard as this user"
                        >
                          Login as User
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenBalanceModal(user)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-[11px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Adjust User Balance</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Target User: <strong className="text-slate-900">{selectedUser.email}</strong>
            </div>

            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
                msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
              }`}>
                {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Target Wallet</label>
                <select
                  value={targetWallet}
                  onChange={(e: any) => setTargetWallet(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="deposit_wallet">Deposit Wallet (${Number(selectedUser.deposit_wallet || 0).toFixed(2)})</option>
                  <option value="interest_wallet">Interest Wallet (${Number(selectedUser.interest_wallet || 0).toFixed(2)})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAction("add")}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer border transition-all ${
                      action === "add" ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Funds</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction("subtract")}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer border transition-all ${
                      action === "subtract" ? "bg-rose-50 text-rose-700 border-rose-300 font-bold" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Subtract Funds</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Admin Remark / Note</label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full minimal-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {submitting ? "Processing..." : "Confirm Adjustment"}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Financial Statement Modal */}
      {statementUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl relative text-slate-800 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Financial Audit Statement</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button onClick={() => setStatementUser(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs flex-shrink-0">
              <div>
                <div className="font-extrabold text-slate-900">{statementUser.full_name || "Investor"}</div>
                <div className="text-slate-500 font-mono">{statementUser.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Balances</div>
                <div className="font-mono font-extrabold text-indigo-600 text-sm">
                  ${(Number(statementUser.deposit_wallet || 0) + Number(statementUser.interest_wallet || 0)).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Wallet</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingStatement ? (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-400">Loading ledger data...</td></tr>
                  ) : userTransactions.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-400">No transaction logs recorded for this investor.</td></tr>
                  ) : (
                    userTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold uppercase text-[10px] text-indigo-600">{tx.type}</td>
                        <td className="py-2.5 font-mono text-slate-500 text-[11px]">{tx.wallet_type || "deposit"}</td>
                        <td className={`py-2.5 font-mono font-bold ${Number(tx.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {Number(tx.amount) >= 0 ? "+" : ""}${Number(tx.amount).toFixed(2)}
                        </td>
                        <td className="py-2.5 text-slate-600 text-[11px] truncate max-w-xs">{tx.description || "-"}</td>
                        <td className="py-2.5 text-right text-slate-500 text-[10px]">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
