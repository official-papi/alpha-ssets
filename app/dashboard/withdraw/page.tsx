"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WithdrawModal from "@/components/dashboard/WithdrawModal";
import { ArrowUpRight, History, Plus, QrCode, Eye, CheckCircle2, X, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";
import Link from "next/link";

export default function WithdrawPage() {
  const [userEmail, setUserEmail] = useState("");
  const [depositWallet, setDepositWallet] = useState(0);
  const [interestWallet, setInterestWallet] = useState(0);
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutQrCodeUrl, setPayoutQrCodeUrl] = useState<string | null>(null);
  
  const [withdrawLogs, setWithdrawLogs] = useState<any[]>([]);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [viewingLogQr, setViewingLogQr] = useState<any | null>(null);

  const fetchWithdrawData = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setUserEmail(activeUser.email);
      const { data: profile } = await supabase
        .from("profiles")
        .select("deposit_wallet, interest_wallet, payout_method, payout_address, payout_qr_code_url")
        .eq("id", activeUser.id)
        .single();
        
      if (profile) {
        setDepositWallet(Number(profile.deposit_wallet || 0));
        setInterestWallet(Number(profile.interest_wallet || 0));
        setPayoutMethod(profile.payout_method || "");
        setPayoutAddress(profile.payout_address || "");
        setPayoutQrCodeUrl(profile.payout_qr_code_url || null);
      }

      const { data: logs } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", activeUser.id)
        .order("created_at", { ascending: false });
        
      if (logs) setWithdrawLogs(logs);
    }
  };

  useEffect(() => {
    fetchWithdrawData();
  }, []);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-6 text-[#20281f]">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20281f]">Withdraw Funds</h1>
            <p className="text-xs sm:text-sm text-[#60695b] mt-1">Request payout from your Interest Wallet or Deposit Wallet.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="min-h-[42px] px-5 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-all self-start sm:self-auto hover:-translate-y-0.5 active:translate-y-0.5"
          >
            <Plus className="w-4 h-4 text-[#d1f18b]" />
            <span>Request Withdrawal</span>
          </button>
        </div>

        {/* Balance & Payout Destination Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-6 shadow-2xs relative overflow-hidden">
            <div className="text-xs text-[#7d8573] font-bold uppercase tracking-wider">Interest Wallet (Earnings)</div>
            <div className="text-3xl font-bold font-mono text-[#476b1b] mt-1">${interestWallet.toFixed(2)}</div>
            <p className="text-[11px] text-[#7d8573] mt-1">Settled yields ready for withdrawal</p>
          </div>

          <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-6 shadow-2xs relative overflow-hidden">
            <div className="text-xs text-[#7d8573] font-bold uppercase tracking-wider">Deposit Wallet</div>
            <div className="text-3xl font-bold font-mono text-[#20281f] mt-1">${depositWallet.toFixed(2)}</div>
            <p className="text-[11px] text-[#7d8573] mt-1">Available principal capital</p>
          </div>

          <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-5 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#7d8573] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#20281f]" />
                <span>My Payout Destination</span>
              </div>
              <Link
                href="/dashboard/profile"
                className="text-[11px] text-[#20281f] hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Edit</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {payoutQrCodeUrl ? (
              <div className="flex items-center gap-3 my-2 bg-[#fafaf5] p-2.5 rounded-[8px] border border-[#e4e7dc]">
                <img
                  src={payoutQrCodeUrl}
                  alt="Saved QR"
                  className="w-12 h-12 object-contain rounded-[6px] bg-white border border-[#e4e7dc] flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[#20281f] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#476b1b] flex-shrink-0" />
                    <span className="truncate">{payoutMethod || "Custom Wallet"}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#7d8573] truncate mt-0.5 max-w-[170px]">
                    {payoutAddress || "QR Code on file"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-2 bg-amber-500/10 border border-amber-500/20 rounded-[8px] p-2.5 text-center">
                <p className="text-[11px] text-amber-800 font-medium">
                  No QR code uploaded yet.
                </p>
                <Link
                  href="/dashboard/profile"
                  className="text-[11px] font-bold text-[#20281f] underline mt-0.5 inline-block"
                >
                  Upload QR in Profile
                </Link>
              </div>
            )}

            <div className="text-[10px] text-[#7d8573]">
              Expedites withdrawal processing & scanning
            </div>
          </div>
        </div>

        {/* Withdraw Logs Table */}
        <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-[#20281f] mb-4 flex items-center space-x-2">
            <History className="w-4 h-4 text-[#86a951]" />
            <span>Withdrawal History Ledger</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e4e7dc] text-[#7d8573] uppercase text-[10px] font-mono tracking-wider">
                  <th className="pb-3">Wallet Source</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Payout Destination</th>
                  <th className="pb-3 text-center">Payout QR</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2eb]">
                {withdrawLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#7d8573] text-xs font-medium">
                      No withdrawal requests found.
                    </td>
                  </tr>
                ) : (
                  withdrawLogs.map((log) => {
                    const qrUrl = log.qr_code_url || log.account_details?.qr_code_url;
                    const destinationText =
                      typeof log.account_details === "object"
                        ? log.account_details?.details || log.payout_details || "-"
                        : log.payout_details || log.account_details || "-";

                    return (
                      <tr key={log.id} className="hover:bg-[#fafaf5] transition-colors">
                        <td className="py-3 font-bold text-[#20281f] uppercase">{log.wallet_type}</td>
                        <td className="py-3 font-semibold text-[#60695b]">{log.method_name || "Crypto"}</td>
                        <td className="py-3 font-mono font-bold text-[#20281f]">-${Number(log.amount).toFixed(2)}</td>
                        <td className="py-3 font-mono text-[#7d8573] text-[11px] truncate max-w-[180px]">
                          {destinationText}
                        </td>
                        <td className="py-3 text-center">
                          {qrUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingLogQr(log)}
                              className="px-2.5 py-1 rounded-[6px] bg-[#fafaf5] hover:bg-[#e4e7dc] text-[#20281f] border border-[#20281f20] text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View QR</span>
                            </button>
                          ) : (
                            <span className="text-[#a4aca0] text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase ${
                            log.status === "approved" ? "bg-[#e3f2c9] text-[#476b1b] border border-[#c4ee70]" :
                            log.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 text-[#7d8573] text-[11px] font-mono">{new Date(log.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Modal */}
        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          interestBalance={interestWallet}
          depositBalance={depositWallet}
          onSuccess={fetchWithdrawData}
        />

        {/* View Withdrawal Record QR Modal */}
        {viewingLogQr && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#093A3E]" />
                  <span className="text-sm font-extrabold text-slate-900">Withdrawal Payout QR</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingLogQr(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                <img
                  src={viewingLogQr.qr_code_url || viewingLogQr.account_details?.qr_code_url}
                  alt="Withdrawal Payout QR"
                  className="max-h-72 w-auto object-contain rounded-lg shadow-xs"
                />
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span className="font-bold">{viewingLogQr.method_name || "Crypto"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount Requested:</span>
                  <span className="font-mono font-bold text-[#093A3E]">${Number(viewingLogQr.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="uppercase font-bold text-[10px]">{viewingLogQr.status}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Destination:</div>
                  <div className="font-mono text-[11px] text-slate-800 break-all bg-slate-100 p-2 rounded-lg">
                    {typeof viewingLogQr.account_details === "object"
                      ? viewingLogQr.account_details?.details || viewingLogQr.payout_details || "-"
                      : viewingLogQr.account_details || viewingLogQr.payout_details || "-"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingLogQr(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
