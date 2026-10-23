"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CryptoPortfolioOverview from "@/components/dashboard/CryptoPortfolioOverview";
import CryptoAssetCards, { CryptoAssetItem } from "@/components/dashboard/CryptoAssetCards";
import CryptoHoldingsTable from "@/components/dashboard/CryptoHoldingsTable";
import CryptoDepositModal from "@/components/dashboard/CryptoDepositModal";
import CryptoWithdrawModal from "@/components/dashboard/CryptoWithdrawModal";
import DashboardLiquidityMatrix from "@/components/dashboard/DashboardLiquidityMatrix";
import FundCryptoModal from "@/components/dashboard/FundCryptoModal";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  deposit_wallet: number;
  interest_wallet: number;
  referral_code: string;
  role?: string;
}

const DEFAULT_SUPPORTED_CRYPTO: CryptoAssetItem[] = [
  {
    symbol: "ATFC",
    name: "American Trust Fund",
    network: "Sovereign Trust Escrow",
    balance: 0,
    priceUsd: 1.0,
    change24h: 0.0,
    requiresTag: false,
    walletAddress: "0x892aF75dE163B8d6263B2dD6C9eA75d5032F5e71",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    network: "XRPL (Ripple Ledger)",
    balance: 0,
    priceUsd: 0.584,
    change24h: 3.42,
    requiresTag: true,
    walletAddress: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
    tagValue: "583921",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin Network",
    balance: 0,
    priceUsd: 67850.0,
    change24h: 1.85,
    requiresTag: false,
    walletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "ERC-20",
    balance: 0,
    priceUsd: 3480.0,
    change24h: 2.15,
    requiresTag: false,
    walletAddress: "0x71C83d3b7da5F23e098a5F38A88950d81745Fe1e",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    network: "TRC-20",
    balance: 0,
    priceUsd: 1.0,
    change24h: 0.01,
    requiresTag: false,
    walletAddress: "T9yD14Nj9j7x8kL2m1n0PqRsTuVwXyZ3aB",
  },
  {
    symbol: "SOL",
    name: "Solana",
    network: "Solana Mainnet",
    balance: 0,
    priceUsd: 154.5,
    change24h: 4.65,
    requiresTag: false,
    walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAssetItem[]>(DEFAULT_SUPPORTED_CRYPTO);
  const [totalWithdrawnSum, setTotalWithdrawnSum] = useState(0);
  const [copiedRef, setCopiedRef] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [modalPreselectedSymbol, setModalPreselectedSymbol] = useState<string>("ATFC");
  const [modalPreselectedFundSymbol, setModalPreselectedFundSymbol] = useState<string>("ATFC");

  const fetchDashboardData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const impersonatedId = typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_id") : null;
    const targetUserId = impersonatedId || user.id;

    // Fetch user profile, withdrawals, gateways, and deposits in parallel
    const [profileRes, withdrawRes, balancesRes, currenciesRes, gatewaysRes, depositsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", targetUserId).single(),
      supabase.from("withdrawals").select("net_amount, method_name, account_details, status").eq("user_id", targetUserId),
      supabase.from("user_crypto_balances").select("*").eq("user_id", targetUserId),
      supabase.from("crypto_currencies").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("gateways").select("*").eq("status", true),
      supabase.from("deposits").select("*").eq("user_id", targetUserId).eq("status", "approved"),
    ]);

    // Fetch live prices from our API route
    let livePrices: Record<string, { usd: number; change24h: number }> = {};
    try {
      const priceRes = await fetch("/api/crypto/prices");
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        if (priceData.prices) livePrices = priceData.prices;
      }
    } catch (err) {
      console.warn("Could not fetch live crypto prices:", err);
    }

    // Set Profile
    if (profileRes.data) {
      setProfile({
        id: profileRes.data.id,
        email: profileRes.data.email || (typeof window !== "undefined" ? sessionStorage.getItem("impersonate_user_email") : "") || user.email,
        full_name: profileRes.data.full_name || (impersonatedId ? "Investor" : user.user_metadata?.full_name) || "Investor",
        deposit_wallet: Number(profileRes.data.deposit_wallet || 0),
        interest_wallet: Number(profileRes.data.interest_wallet || 0),
        referral_code: profileRes.data.referral_code || "REF-789",
        role: profileRes.data.role || "user",
      });
    }

    // Set Withdrawn sum
    if (withdrawRes.data) {
      const sum = withdrawRes.data
        .filter((w: any) => w.status === "approved")
        .reduce((acc: number, curr: any) => acc + Number(curr.net_amount || 0), 0);
      setTotalWithdrawnSum(sum);
    }

    // Map real addresses from gateways configured in database
    const gatewayAddressMap = new Map<string, string>();
    if (gatewaysRes.data) {
      gatewaysRes.data.forEach((g: any) => {
        const code = String(g.code || "").toLowerCase();
        const name = String(g.name || "").toLowerCase();
        if (code.includes("atfc") || name.includes("american trust")) gatewayAddressMap.set("ATFC", g.wallet_address);
        if (code.includes("xrp") || name.includes("xrp")) gatewayAddressMap.set("XRP", g.wallet_address);
        if (code.includes("bitcoin") || code.includes("btc") || name.includes("bitcoin")) gatewayAddressMap.set("BTC", g.wallet_address);
        if (code.includes("ethereum") || code.includes("eth") || name.includes("ethereum")) gatewayAddressMap.set("ETH", g.wallet_address);
        if (code.includes("usdt") || name.includes("usdt")) gatewayAddressMap.set("USDT", g.wallet_address);
        if (code.includes("solana") || code.includes("sol") || name.includes("solana")) gatewayAddressMap.set("SOL", g.wallet_address);
      });
    }

    // Dynamic balance aggregation from approved deposits & user_crypto_balances
    const userBalancesMap = new Map<string, number>();
    
    // 1. From user_crypto_balances table if present
    if (balancesRes.data && balancesRes.data.length > 0) {
      balancesRes.data.forEach((b: any) => {
        userBalancesMap.set(b.symbol.toUpperCase(), Number(b.balance || 0));
      });
    }

    // 2. Aggregate from approved deposits by coin
    if (depositsRes.data && depositsRes.data.length > 0) {
      depositsRes.data.forEach((dep: any) => {
        const gName = String(dep.gateway_name || "").toUpperCase();
        let sym = "";
        if (gName.includes("ATFC") || gName.includes("AMERICAN TRUST")) sym = "ATFC";
        else if (gName.includes("XRP") || gName.includes("RIPPLE")) sym = "XRP";
        else if (gName.includes("BTC") || gName.includes("BITCOIN")) sym = "BTC";
        else if (gName.includes("ETH") || gName.includes("ETHEREUM")) sym = "ETH";
        else if (gName.includes("SOL") || gName.includes("SOLANA")) sym = "SOL";
        else if (gName.includes("USDT") || gName.includes("TETHER")) sym = "USDT";

        if (sym && sym !== "USDT") {
          const coinPrice = livePrices[sym]?.usd || (sym === "BTC" ? 67850 : sym === "ETH" ? 3480 : sym === "XRP" ? 0.584 : 1.0);
          const current = userBalancesMap.get(sym) || 0;
          const cryptoAmt = dep.crypto_amount ? Number(dep.crypto_amount) : Number(dep.final_amount || dep.amount || 0) / coinPrice;
          userBalancesMap.set(sym, current + cryptoAmt);
        }
      });
    }

    // 3. User's liquid cash in deposit_wallet + interest_wallet is mapped to USDT (1 USDT = $1 USD)
    const liquidCash = Number(profileRes.data?.deposit_wallet || 0) + Number(profileRes.data?.interest_wallet || 0);
    const existingUsdt = userBalancesMap.get("USDT") || 0;
    userBalancesMap.set("USDT", Math.max(existingUsdt, liquidCash));

    // Merge currencies, user balances, and live prices
    let dbCurrencies = currenciesRes.data && currenciesRes.data.length > 0 ? [...currenciesRes.data] : null;

    // Ensure ATFC is guaranteed present in dbCurrencies
    if (dbCurrencies && !dbCurrencies.some((c: any) => c.symbol.toUpperCase() === "ATFC")) {
      dbCurrencies.unshift({
        symbol: "ATFC",
        name: "American Trust Fund",
        network: "Sovereign Trust Escrow",
        wallet_address: "0x892aF75dE163B8d6263B2dD6C9eA75d5032F5e71",
        requires_tag: false,
      });
    }

    const baseList = dbCurrencies
      ? dbCurrencies.map((c: any) => ({
          symbol: c.symbol,
          name: c.name,
          network: c.network,
          balance: userBalancesMap.get(c.symbol.toUpperCase()) || 0,
          priceUsd: livePrices[c.symbol]?.usd || (c.symbol === "ATFC" ? 1.0 : c.symbol === "USDT" ? 1.0 : 0),
          change24h: livePrices[c.symbol]?.change24h || 0,
          requiresTag: c.requires_tag ?? (c.symbol === "XRP"),
          walletAddress: gatewayAddressMap.get(c.symbol) || c.wallet_address || undefined,
          tagValue: c.tag_value || (c.symbol === "XRP" ? "583921" : undefined),
        }))
      : DEFAULT_SUPPORTED_CRYPTO.map((item) => ({
          ...item,
          balance: userBalancesMap.get(item.symbol) || 0,
          walletAddress: gatewayAddressMap.get(item.symbol) || item.walletAddress,
          priceUsd: livePrices[item.symbol]?.usd ?? item.priceUsd,
          change24h: livePrices[item.symbol]?.change24h ?? item.change24h,
        }));

    setCryptoAssets(baseList);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Total Portfolio Net Worth calculation (Crypto + Liquid Wallets)
  const totalUsdValue = useMemo(() => {
    const cryptoTotal = cryptoAssets.reduce((acc, curr) => acc + (curr.balance * (curr.priceUsd || 0)), 0);
    const walletTotal = (profile?.deposit_wallet || 0) + (profile?.interest_wallet || 0);
    return Math.max(cryptoTotal, walletTotal);
  }, [cryptoAssets, profile]);

  // Top asset determination
  const topAsset = useMemo(() => {
    let top = cryptoAssets[0];
    let maxVal = 0;
    cryptoAssets.forEach((a) => {
      const val = a.balance * (a.priceUsd || 0);
      if (val > maxVal) {
        maxVal = val;
        top = a;
      }
    });
    return top;
  }, [cryptoAssets]);

  const handleOpenDeposit = (symbol?: string) => {
    setModalPreselectedSymbol(symbol || "ATFC");
    setIsDepositOpen(true);
  };

  const handleOpenWithdraw = (symbol?: string) => {
    setModalPreselectedSymbol(symbol || "ATFC");
    setIsWithdrawOpen(true);
  };

  const handleOpenFund = (symbol?: string) => {
    setModalPreselectedFundSymbol(symbol || "ATFC");
    setIsFundOpen(true);
  };

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${profile?.referral_code || "ALPHA789"}`
    : `https://alpha-assets.com/register?ref=${profile?.referral_code || "ALPHA789"}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <DashboardLayout userEmail={profile?.email}>
      <div className="space-y-8">
        
        {/* Executive Terminal Banner */}
        <div className="relative group overflow-hidden rounded-2xl border border-[#093A3E] bg-[#001011] p-6 sm:p-8 shadow-xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(58,175,185,0.12),transparent_70%)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#093A3E]/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093A3E]/60 border border-[#3AAFB9]/40 text-[#3AAFB9] text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#3AAFB9]" />
                <span>Crypto Custody Console · Welcome Back, {profile?.full_name || "Investor"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Institutional Crypto Portfolio
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
                Direct blockchain custody accounts. Deposit to your platform wallet or dedicated crypto address, and allocate directly into American Trust Fund, XRP, Bitcoin, Ethereum, USDT, and Solana.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => fetchDashboardData()}
                className="px-4 py-2.5 rounded-xl bg-[#093A3E] hover:bg-[#001011] text-white border border-[#3AAFB9]/40 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition-all hover:border-[#3AAFB9]"
                title="Refresh Balances"
              >
                <RefreshCw className="w-4 h-4 text-[#3AAFB9]" />
                <span>Refresh Rates</span>
              </button>

              <div className="bg-[#093A3E]/40 border border-[#3AAFB9]/30 p-2.5 px-4 rounded-xl flex items-center justify-between gap-3 backdrop-blur-sm">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Referral ID</div>
                  <div className="text-xs font-mono font-extrabold text-[#3AAFB9]">{profile?.referral_code || "ALPHA789"}</div>
                </div>
                <button
                  onClick={copyReferral}
                  className="bg-[#001011] hover:bg-[#093A3E] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#3AAFB9]/40 cursor-pointer transition-colors shadow-2xs"
                  title="Copy Referral Link"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-[#3AAFB9]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Hero Portfolio Overview Card (Total Net Worth, Quick Actions) */}
        <CryptoPortfolioOverview
          totalUsdValue={totalUsdValue}
          totalWithdrawnUsd={totalWithdrawnSum}
          depositWalletBalance={profile?.deposit_wallet || 0}
          interestWalletBalance={profile?.interest_wallet || 0}
          topAssetSymbol={topAsset?.symbol || "ATFC"}
          topAssetAmount={topAsset?.balance || 0}
          activeCurrenciesCount={cryptoAssets.length}
          onOpenDeposit={handleOpenDeposit}
          onOpenWithdraw={handleOpenWithdraw}
          onOpenFund={handleOpenFund}
          onViewHistory={() => router.push("/dashboard/transactions")}
        />

        {/* 2. Space for Liquidity Control Matrix (Featuring American Trust Fund Coin + 7 Core Assets) */}
        <DashboardLiquidityMatrix
          totalInvested={totalUsdValue}
          onOpenInvest={() => handleOpenFund("ATFC")}
        />

        {/* 3. Crypto Accounts Grid: Shows American Trust Fund, XRP, BTC, ETH, USDT, SOL */}
        <CryptoAssetCards
          assets={cryptoAssets}
          onDeposit={handleOpenDeposit}
          onWithdraw={handleOpenWithdraw}
          onFund={handleOpenFund}
        />

        {/* 4. Detailed Crypto Asset Holdings Breakdown Table */}
        <CryptoHoldingsTable
          assets={cryptoAssets}
          totalUsdValue={totalUsdValue}
          onDeposit={handleOpenDeposit}
          onWithdraw={handleOpenWithdraw}
        />

        {/* 5. Fund Crypto from Platform Wallet Modal */}
        <FundCryptoModal
          isOpen={isFundOpen}
          depositBalance={profile?.deposit_wallet || 0}
          assets={cryptoAssets}
          preSelectedSymbol={modalPreselectedFundSymbol}
          onClose={() => setIsFundOpen(false)}
          onSuccess={fetchDashboardData}
          onOpenDeposit={() => handleOpenDeposit()}
        />

        {/* 6. Multi-Crypto Deposit Modal */}
        <CryptoDepositModal
          isOpen={isDepositOpen}
          assets={cryptoAssets}
          preSelectedSymbol={modalPreselectedSymbol}
          onClose={() => setIsDepositOpen(false)}
          onSuccess={fetchDashboardData}
        />

        {/* 7. Crypto Withdrawal Modal */}
        <CryptoWithdrawModal
          isOpen={isWithdrawOpen}
          assets={cryptoAssets}
          preSelectedSymbol={modalPreselectedSymbol}
          onClose={() => setIsWithdrawOpen(false)}
          onSuccess={fetchDashboardData}
        />

      </div>
    </DashboardLayout>
  );
}
