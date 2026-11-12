"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";

export default function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.onerror = () => setUseFallback(true);
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BITSTAMP:XRPUSD", title: "XRP" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BINANCE:SOLUSD", title: "Solana" },
        { proName: "NASDAQ:NVDA", title: "Nvidia" },
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "light",
      locale: "en"
    });

    containerRef.current.appendChild(script);
  }, []);

  const fallbackCoins = [
    { symbol: "XRP/USD", price: "$2.48", change: "+4.1%", up: true },
    { symbol: "ETH/USD", price: "$3,425.50", change: "+2.1%", up: true },
    { symbol: "BTC/USD", price: "$96,480.00", change: "+3.4%", up: true },
    { symbol: "SOL/USD", price: "$214.80", change: "+5.8%", up: true },
    { symbol: "NVDA", price: "$142.60", change: "+3.9%", up: true },
    { symbol: "AAPL", price: "$234.90", change: "+1.2%", up: true },
    { symbol: "TSLA", price: "$228.40", change: "+4.7%", up: true },
    { symbol: "ATFC/USD", price: "$1.000", change: "0.0%", up: true },
  ];

  return (
    <div className="w-full bg-[#f4f7ec] border-y border-[#dfe6d2] py-2 relative z-30">
      {useFallback ? (
        <div className="max-w-[1160px] mx-auto px-4 flex items-center justify-between overflow-x-auto text-xs space-x-6">
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-[#416735] bg-white px-2.5 py-1 rounded-full border border-[#cbe59d] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#416735] animate-pulse" />
            <span>LIVE MARKETS</span>
          </div>
          {fallbackCoins.map((c) => (
            <div key={c.symbol} className="flex items-center space-x-2 font-mono tabular-nums font-medium shrink-0">
              <span className="text-[#60695b] text-[11px] font-bold">{c.symbol}</span>
              <span className="text-[#20281f] text-xs font-bold">{c.price}</span>
              <span className="text-emerald-700 font-semibold text-[10px]">{c.change}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="tradingview-widget-container" ref={containerRef}>
          <div className="tradingview-widget-container__widget"></div>
        </div>
      )}
    </div>
  );
}
