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
      colorTheme: "light",
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
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative z-30">
      {useFallback ? (
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto text-xs space-x-6">
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE MARKETS</span>
          </div>
          {fallbackCoins.map((c) => (
            <div key={c.symbol} className="flex items-center space-x-2 font-mono tabular-nums font-medium shrink-0">
              <span className="text-zinc-500 text-[11px]">{c.symbol}</span>
              <span className="text-zinc-950 text-xs font-semibold">{c.price}</span>
              <span className={`flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                c.up ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
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
