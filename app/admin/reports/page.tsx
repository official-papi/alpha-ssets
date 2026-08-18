"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { FileText, Download, Filter, Search, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminReportsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "all" ? true : t.type === filterType;
    const matchesSearch =
      searchTerm === "" ||
      t.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ["ID", "Investor Name", "Investor Email", "Type", "Wallet", "Amount", "Description", "Date"];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.profiles?.full_name || "Investor"}"`,
      `"${t.profiles?.email || ""}"`,
      t.type,
      t.wallet_type,
      t.amount,
      `"${t.description || ""}"`,
      new Date(t.created_at).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Financial Reports & Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Inspect all platform deposits, withdrawals, interest payouts, and referral commissions.</p>
        </div>

        <button
          type="button"
          onClick={exportToCSV}
          className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 cursor-pointer self-start sm:self-auto shadow-md shadow-indigo-600/15"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="minimal-card p-4 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email, name or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["all", "deposit", "withdraw", "interest_payout", "referral_commission", "admin_adjustment"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
                filterType === type ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type.replace("_", " ")}
            </button>
          ))}
        </div>

      </div>

      {/* Reports Table */}
      <div className="minimal-card p-6 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Investor</th>
                <th className="pb-3">Transaction Type</th>
                <th className="pb-3">Wallet</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Loading ledger data...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                    No ledger transactions matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isPositive = Number(t.amount) >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <div className="font-extrabold text-slate-900">{t.profiles?.full_name || "Investor"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{t.profiles?.email}</div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          t.type === "deposit" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          t.type === "withdraw" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          t.type === "interest_payout" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                          "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {t.type?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 font-semibold uppercase text-[11px] text-slate-600">{t.wallet_type || "deposit"}</td>
                      <td className={`py-3 font-mono font-extrabold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isPositive ? "+" : ""}${Number(t.amount).toFixed(2)}
                      </td>
                      <td className="py-3 text-slate-600 max-w-xs truncate">{t.description || "-"}</td>
                      <td className="py-3 text-right text-slate-500 text-[11px]">
                        {new Date(t.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
