import { NextResponse } from "next/server";

interface PriceData {
  usd: number;
  change24h: number;
}

// Fallback prices in case external APIs are rate limited or offline
const FALLBACK_PRICES: Record<string, PriceData> = {
  XRP: { usd: 0.584, change24h: 3.42 },
  BTC: { usd: 67850.0, change24h: 1.85 },
  ETH: { usd: 3480.0, change24h: 2.15 },
  USDT: { usd: 1.0, change24h: 0.01 },
  SOL: { usd: 154.5, change24h: 4.65 },
};

let cachedPrices: { timestamp: number; data: Record<string, PriceData> } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function GET() {
  const now = Date.now();
  if (cachedPrices && now - cachedPrices.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, prices: cachedPrices.data, cached: true });
  }

  try {
    // Fetch live prices from public CoinGecko API (no key required for simple price)
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple,bitcoin,ethereum,tether,solana&vs_currencies=usd&include_24hr_change=true",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const mapped: Record<string, PriceData> = {
        XRP: {
          usd: Number(data.ripple?.usd || FALLBACK_PRICES.XRP.usd),
          change24h: Number(data.ripple?.usd_24h_change || FALLBACK_PRICES.XRP.change24h),
        },
        BTC: {
          usd: Number(data.bitcoin?.usd || FALLBACK_PRICES.BTC.usd),
          change24h: Number(data.bitcoin?.usd_24h_change || FALLBACK_PRICES.BTC.change24h),
        },
        ETH: {
          usd: Number(data.ethereum?.usd || FALLBACK_PRICES.ETH.usd),
          change24h: Number(data.ethereum?.usd_24h_change || FALLBACK_PRICES.ETH.change24h),
        },
        USDT: {
          usd: Number(data.tether?.usd || 1.0),
          change24h: Number(data.tether?.usd_24h_change || 0.0),
        },
        SOL: {
          usd: Number(data.solana?.usd || FALLBACK_PRICES.SOL.usd),
          change24h: Number(data.solana?.usd_24h_change || FALLBACK_PRICES.SOL.change24h),
        },
      };

      cachedPrices = { timestamp: now, data: mapped };
      return NextResponse.json({ success: true, prices: mapped, cached: false });
    }
  } catch (err) {
    console.warn("CoinGecko API fetch failed, serving fallback crypto prices:", err);
  }

  // Fallback to cached or hardcoded fallback
  const prices = cachedPrices ? cachedPrices.data : FALLBACK_PRICES;
  return NextResponse.json({ success: true, prices, fallback: true });
}
