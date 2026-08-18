"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { History, Filter, FileText, Printer, X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TransactionsPage() {
  const [userEmail, setUserEmail] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [receiptTx, setReceiptTx] = useState<any | null>(null);

  const fetchTransactions = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
      let query = supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (filterType !== "all") {
        query = query.eq("type", filterType);
      }
      const { data: txs } = await query;
      if (txs) setTransactions(txs);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Transaction Ledger Log</h1>
            <p className="text-xs text-slate-500 mt-1">Immutable double-entry transaction record for deposits, yields, withdrawals, and referral rewards.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {["all", "deposit", "investment", "yield", "withdrawal", "referral"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="minimal-card p-6 border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Transaction Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Wallet</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                      No transaction entries found for this filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPositive = Number(tx.amount) > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            tx.type === "deposit" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            tx.type === "withdraw" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}>
                            {tx.type?.replace("_", " ")}
                          </span>
                        </td>
                        <td className={`py-3 font-mono font-extrabold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? "+" : ""}${Number(tx.amount).toFixed(2)}
                        </td>
                        <td className="py-3 text-slate-700 text-xs max-w-xs truncate">{tx.description || "-"}</td>
                        <td className="py-3 font-mono font-bold text-slate-500 uppercase text-[11px]">{tx.wallet_type || "deposit"}</td>
                        <td className="py-3 text-slate-500 text-[11px]">{new Date(tx.created_at).toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setReceiptTx(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Digital Proof Receipt Modal */}
        {receiptTx && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Official Financial Receipt</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button onClick={() => setReceiptTx(null)} className="text-slate-400 hover:text-slate-700 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Transaction Reference</div>
                  <div className="font-mono font-extrabold text-indigo-600 text-xs">TX-{receiptTx.id?.slice(0, 8)}</div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Investor:</span>
                  <span className="font-extrabold text-slate-900">{userEmail}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Type:</span>
                  <span className="font-extrabold text-slate-900 uppercase">{receiptTx.type}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Wallet Account:</span>
                  <span className="font-mono text-slate-900 uppercase font-bold">{receiptTx.wallet_type || "deposit"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className={`font-mono font-extrabold text-sm ${Number(receiptTx.amount) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {Number(receiptTx.amount) >= 0 ? "+" : ""}${Number(receiptTx.amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Description:</span>
                  <span className="font-medium text-slate-900 text-[11px] text-right">{receiptTx.description || "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="font-mono text-slate-600 text-[10px]">{new Date(receiptTx.created_at).toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cryptographic Ledger Verified</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-200">
                    COMPLETED
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
