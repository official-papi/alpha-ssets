/**
 * Calculates accurate cryptocurrency balances for a user based on
 * explicit crypto balance records, approved deposits, and profile wallet funds.
 * Guarantees no double-counting between profile deposit_wallet and coin records.
 */

export interface BalanceResolutionParams {
  profileDepositWallet: number;
  cryptoBalances?: Array<{ symbol: string; balance: number | string }> | null;
  approvedDeposits?: Array<{
    gateway_name?: string | null;
    crypto_symbol?: string | null;
    crypto_amount?: number | string | null;
    amount?: number | string | null;
    final_amount?: number | string | null;
    status?: string | null;
  }> | null;
  livePrices?: Record<string, { usd: number; change24h?: number }>;
}

export function resolveUserCryptoBalances({
  profileDepositWallet = 0,
  cryptoBalances,
  approvedDeposits,
  livePrices = {},
}: BalanceResolutionParams): Map<string, number> {
  const userBalancesMap = new Map<string, number>();

  // 1. If explicit user_crypto_balances exist with positive balances, use them
  let hasExplicit = false;
  if (cryptoBalances && cryptoBalances.length > 0) {
    cryptoBalances.forEach((b) => {
      const bal = Number(b.balance || 0);
      if (bal > 0) hasExplicit = true;
      userBalancesMap.set(b.symbol.toUpperCase(), bal);
    });
  }

  if (hasExplicit) {
    return userBalancesMap;
  }

  // 2. Otherwise compute from approved deposits & profile.deposit_wallet
  const depositsByCoin = new Map<string, number>();
  let totalApprovedDepositsUsd = 0;

  if (approvedDeposits && approvedDeposits.length > 0) {
    approvedDeposits.forEach((dep) => {
      if (dep.status !== "approved") return;

      const gName = String(dep.gateway_name || "").toUpperCase();
      let sym = "";
      if (dep.crypto_symbol) {
        sym = String(dep.crypto_symbol).toUpperCase();
      } else if (gName.includes("ATFC") || gName.includes("AMERICAN TRUST")) {
        sym = "ATFC";
      } else if (gName.includes("XRP") || gName.includes("RIPPLE")) {
        sym = "XRP";
      } else if (gName.includes("BTC") || gName.includes("BITCOIN")) {
        sym = "BTC";
      } else if (gName.includes("ETH") || gName.includes("ETHEREUM")) {
        sym = "ETH";
      } else if (gName.includes("SOL") || gName.includes("SOLANA")) {
        sym = "SOL";
      } else if (gName.includes("USDT") || gName.includes("TETHER")) {
        sym = "USDT";
      } else {
        sym = "ATFC";
      }

      const depUsd = dep.crypto_amount
        ? Number(dep.crypto_amount) * (livePrices[sym]?.usd || (sym === "BTC" ? 67850 : sym === "ETH" ? 3480 : sym === "XRP" ? 0.584 : 1.0))
        : Number(dep.final_amount || dep.amount || 0);

      depositsByCoin.set(sym, (depositsByCoin.get(sym) || 0) + depUsd);
      totalApprovedDepositsUsd += depUsd;
    });
  }

  const walletTotal = Number(profileDepositWallet || 0);

  if (walletTotal > 0) {
    if (totalApprovedDepositsUsd > 0) {
      // Allocate proportional to deposits if wallet was spent, or 1:1 if unchanged
      const scale = walletTotal < totalApprovedDepositsUsd
        ? walletTotal / totalApprovedDepositsUsd
        : 1.0;

      depositsByCoin.forEach((depUsd, sym) => {
        const coinPrice = livePrices[sym]?.usd || (sym === "BTC" ? 67850 : sym === "ETH" ? 3480 : sym === "XRP" ? 0.584 : 1.0);
        const activeUsd = depUsd * scale;
        const coinQty = coinPrice > 0 ? activeUsd / coinPrice : activeUsd;
        userBalancesMap.set(sym, coinQty);
      });

      // Any excess cash beyond tracked deposits (e.g. manual admin credit) goes to default ATFC
      if (walletTotal > totalApprovedDepositsUsd) {
        const excess = walletTotal - totalApprovedDepositsUsd;
        const currentAtfc = userBalancesMap.get("ATFC") || 0;
        userBalancesMap.set("ATFC", currentAtfc + excess);
      }
    } else {
      // Direct admin credit / unallocated balance -> 100% in ATFC
      userBalancesMap.set("ATFC", walletTotal);
    }
  }

  return userBalancesMap;
}

