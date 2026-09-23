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
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "BINANCE:SOLUSD", title: "Solana" },
        { proName: "BINANCE:BNBUSD", title: "BNB" },
        { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en"
    });

    containerRef.current.appendChild(script);
  }, []);

  const fallbackCoins = [
    { symbol: "BTC/USD", price: "$96,450.20", change: "+3.4%", up: true },
    { symbol: "ETH/USD", price: "$3,420.80", change: "+2.1%", up: true },
    { symbol: "SOL/USD", price: "$210.50", change: "+5.8%", up: true },
    { symbol: "BNB/USD", price: "$645.10", change: "+1.2%", up: true },
    { symbol: "USDT/USD", price: "$1.000", change: "0.0%", up: true },
    { symbol: "EUR/USD", price: "1.085", change: "-0.2%", up: false },
  ];

  return (
    <div className="w-full bg-[#001011] border-b border-[#093A3E] py-2 shadow-inner relative z-30">
      {useFallback ? (
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto text-xs space-x-6">
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-[#3AAFB9] bg-[#093A3E] px-2.5 py-0.5 rounded-full border border-[#3AAFB9]/40 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3AAFB9] animate-pulse" />
            <span>LIVE MARKETS</span>
          </div>
          {fallbackCoins.map((c) => (
            <div key={c.symbol} className="flex items-center space-x-2 font-mono tabular-nums font-medium shrink-0">
              <span className="text-[#86cbd1] text-[11px]">{c.symbol}</span>
              <span className="text-white text-xs font-bold">{c.price}</span>
              <span className={`flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                c.up ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800" : "bg-rose-950/80 text-rose-400 border border-rose-800"
              }`}>
                {c.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{c.change}</span>
              </span>
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
