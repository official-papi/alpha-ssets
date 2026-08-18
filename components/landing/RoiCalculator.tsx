"use client";

import { useState } from "react";
import { Calculator, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

const PLANS = [
  { id: "regular",  name: "Regular Package",  rate: 2.5,  weeks: 8,  min: 500,     max: 2000,     step: 100 },
  { id: "silver",   name: "Silver Package",   rate: 4.0,  weeks: 12, min: 3000,    max: 5000,     step: 250 },
  { id: "gold",     name: "Gold Package",     rate: 6.0,  weeks: 16, min: 10000,   max: 20000,    step: 1000 },
  { id: "vip",      name: "VIP Package",      rate: 10.0, weeks: 24, min: 50000,   max: 200000,   step: 5000 },
  { id: "ultimate", name: "Ultimate Package", rate: 12.0, weeks: 36, min: 500000,  max: 3000000,  step: 50000 },
  { id: "elites",   name: "Elites Package",   rate: 15.5, weeks: 52, min: 5000000, max: 20000000, step: 250000 },
];

export default function RoiCalculator() {
  const [selected, setSelected] = useState(PLANS[0]);
  const [amount, setAmount] = useState<number>(1000);
  const [customWeeks, setCustomWeeks] = useState<number>(8);

  const weeklyProfit = (amount * selected.rate) / 100;
  const netProfit = weeklyProfit * customWeeks;
  const totalReturn = amount + netProfit;

  const changePlan = (id: string) => {
    const p = PLANS.find((item) => item.id === id) ?? PLANS[0];
    setSelected(p);
    setAmount(p.min);
    setCustomWeeks(p.weeks);
  };

  return (
    <section id="calculator" className="py-24 border-b border-white/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2">Calculate Earnings</div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Interactive Profit & Yield Simulator</h2>
          <p className="text-slate-600 text-sm mt-3 font-medium">Select your package and drag the capital and duration sliders to preview your returns.</p>
        </div>

        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-900/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Left — Interactive Sliders & Tiers */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">Select Investment Tier</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLANS.map((p) => (
                      <button key={p.id} type="button" onClick={() => changePlan(p.id)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          selected.id === p.id
                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 font-extrabold shadow-xs"
                            : "border-slate-200/80 bg-white/60 text-slate-600 hover:border-indigo-300 hover:bg-white"
                        }`}>
                        <div className="font-extrabold truncate">{p.name}</div>
                        <div className="flex justify-between items-center mt-1 text-[11px]">
                          <span className="font-mono text-indigo-600 font-bold">{p.rate}%/wk</span>
                          <span className="text-slate-400 font-mono">{p.weeks} Wks</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capital Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Capital Amount</label>
                    <span className="text-sm font-mono font-black text-indigo-600">${amount.toLocaleString()}</span>
                  </div>
                  <input type="range"
                    min={selected.min} max={selected.max} step={selected.step}
                    value={amount} onChange={e => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200/80 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                    <span>Min: ${selected.min.toLocaleString()}</span>
                    <span>Max: ${selected.max.toLocaleString()}</span>
                  </div>
                </div>

                {/* Duration Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Holding Period (Weeks)</label>
                    <span className="text-sm font-mono font-black text-indigo-600">{customWeeks} Weeks</span>
                  </div>
                  <input type="range"
                    min={1} max={52} step={1}
                    value={customWeeks} onChange={e => setCustomWeeks(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200/80 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Right — Glass SVG Curve & Summary Card */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl p-6 space-y-5 shadow-lg">
                
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Projected Yield Summary</h4>
                    <p className="text-xs text-slate-500 font-medium">{customWeeks}-Week Automated Compounding</p>
                  </div>
                </div>

                {/* Live SVG Curve Visualizer */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <span>Yield Curve Trajectory</span>
                    <span className="text-emerald-600 font-mono">+{((netProfit / amount) * 100).toFixed(1)}% ROI</span>
                  </div>

                  <div className="h-16 w-full flex items-end pt-2">
                    <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="yieldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,45 Q 60,35 100,20 T 200,5"
                        fill="none"
                        stroke="url(#yieldGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="200" cy="5" r="4" fill="#10b981" className="animate-ping" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Weekly Interest Yield:</span>
                    <span className="font-mono font-extrabold text-emerald-600">+${weeklyProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Net Profit ({customWeeks} Weeks):</span>
                    <span className="font-mono font-extrabold text-indigo-600">+${netProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200/80 text-sm">
                    <span className="font-extrabold text-slate-800">Total Return + Principal:</span>
                    <span className="font-mono font-black text-slate-900">${totalReturn.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/register"
                  className="minimal-btn-primary w-full py-3.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer">
                  <span>Subscribe & Invest ${amount.toLocaleString()} Now</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
