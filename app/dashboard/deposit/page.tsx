"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CryptoDepositModal from "@/components/dashboard/CryptoDepositModal";
import { CryptoCoinIcon } from "@/components/crypto/CryptoIcons";
import { CryptoAssetItem } from "@/components/dashboard/CryptoAssetCards";
import { ArrowDownRight, History, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

const DEFAULT_SUPPORTED_CRYPTO: CryptoAssetItem[] = [
  { symbol: "ATFC", name: "American Trust Fund", network: "Sovereign Trust Escrow", balance: 0, priceUsd: 1.0, change24h: 0.0, requiresTag: false, walletAddress: "0x892aF75dE163B8d6263B2dD6C9eA75d5032F5e71" },
  { symbol: "XRP", name: "Ripple", network: "XRPL", balance: 0, priceUsd: 0.584, change24h: 3.42, requiresTag: true, tagValue: "583921", walletAddress: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin Network", balance: 0, priceUsd: 67850, change24h: 1.85, requiresTag: false, walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  { symbol: "ETH", name: "Ethereum", network: "ERC-20", balance: 0, priceUsd: 3480, change24h: 2.15, requiresTag: false, walletAddress: "0x71C83d3b7da5F23e098a5F38A88950d81745Fe1e" },
  { symbol: "USDT", name: "Tether USD", network: "TRC-20", balance: 0, priceUsd: 1.0, change24h: 0.01, requiresTag: false, walletAddress: "T9yD14Nj9j7x8kL2m1n0PqRsTuVwXyZ3aB" },
  { symbol: "SOL", name: "Solana", network: "Solana Mainnet", balance: 0, priceUsd: 154.5, change24h: 4.65, requiresTag: false, walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
];

export default function DepositPage() {
  const [userEmail, setUserEmail] = useState("");
  const [depositLogs, setDepositLogs] = useState<any[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAssetItem[]>(DEFAULT_SUPPORTED_CRYPTO);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("XRP");

  const fetchDepositData = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setUserEmail(activeUser.email);
      const [logsRes, balancesRes] = await Promise.all([
        supabase.from("deposits").select("*").eq("user_id", activeUser.id).order("created_at", { ascending: false }),
        supabase.from("user_crypto_balances").select("*").eq("user_id", activeUser.id),
      ]);

      if (logsRes.data) setDepositLogs(logsRes.data);

      if (balancesRes.data && balancesRes.data.length > 0) {
        const balMap = new Map<string, number>();
        balancesRes.data.forEach((b: any) => balMap.set(b.symbol.toUpperCase(), Number(b.balance || 0)));
        setCryptoAssets((prev) =>
          prev.map((c) => ({
            ...c,
            balance: balMap.get(c.symbol) ?? c.balance,
          }))
        );
      }
    }
  };

  useEffect(() => {
    fetchDepositData();
  }, []);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#001011]">Deposit Cryptocurrency</h1>
            <p className="text-xs text-slate-500 mt-1">
              Transfer XRP, Bitcoin, Ethereum, USDT, or Solana directly into your dedicated asset accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedSymbol("XRP");
              setIsDepositOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#3AAFB9]" />
            <span>Make New Deposit</span>
          </button>
        </div>

        {/* Quick Deposit Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {cryptoAssets.map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => {
                setSelectedSymbol(asset.symbol);
                setIsDepositOpen(true);
              }}
              className="bg-white border border-[#d4e7e9] hover:border-[#3AAFB9] rounded-2xl p-4 cursor-pointer transition-all hover:shadow-sm group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
                  <CryptoCoinIcon symbol={asset.symbol} className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xs text-[#001011]">{asset.symbol}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{asset.network}</p>
              <p className="text-sm font-black font-mono text-[#093A3E] mt-1">
                {asset.balance.toFixed(2)} <span className="text-[10px] text-slate-400">{asset.symbol}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Deposit Logs Table */}
        <div className="bg-white border border-[#d4e7e9] rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-extrabold text-[#001011] mb-4 flex items-center space-x-2">
            <History className="w-4 h-4 text-[#093A3E]" />
            <span>Cryptocurrency Deposit Ledger</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Asset / Gateway</th>
                  <th className="pb-3">Crypto Amount</th>
                  <th className="pb-3">Valuation (USD)</th>
                  <th className="pb-3">Tx Hash / Ref</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depositLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                      No deposit records found. Click &quot;Make New Deposit&quot; to transfer crypto.
                    </td>
                  </tr>
                ) : (
                  depositLogs.map((log) => {
                    const sym = log.crypto_symbol || log.gateway_name?.split(" ")[0] || "USD";
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-2">
                            <CryptoCoinIcon symbol={sym} className="w-4 h-4" />
                            <span className="font-extrabold text-[#001011] uppercase">{log.gateway_name || sym}</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono font-extrabold text-[#093A3E]">
                          {log.crypto_amount ? `${Number(log.crypto_amount).toFixed(4)} ${sym}` : "-"}
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-600">
                          ${Number(log.final_amount || log.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 font-mono text-slate-500 text-[11px] truncate max-w-[150px]">
                          {log.tx_hash || log.trx_id || "-"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              log.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : log.status === "rejected"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px]">{new Date(log.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Crypto Deposit Modal */}
        <CryptoDepositModal
          isOpen={isDepositOpen}
          assets={cryptoAssets}
          preSelectedSymbol={selectedSymbol}
          onClose={() => setIsDepositOpen(false)}
          onSuccess={fetchDepositData}
        />

      </div>
    </DashboardLayout>
  );
}
