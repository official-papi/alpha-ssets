"use client";

import { useEffect, useState, useMemo } from "react";
import { Calculator, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface InvestmentTier {
  id: string;
  name: string;
  rate: number; // weekly %
  weeks: number;
  min: number;
  max: number;
  step: number;
  badge?: string;
  interval?: string;
  capitalBack?: boolean;
}

const DEFAULT_PLANS: InvestmentTier[] = [
  { id: "regular",  name: "Regular",   rate: 2.5,  weeks: 8,  min: 500,     max: 2000,     step: 100,    badge: "Starter",    interval: "Weekly", capitalBack: true },
  { id: "silver",   name: "Silver",    rate: 4.0,  weeks: 12, min: 3000,    max: 5000,     step: 250,    badge: "Growth",     interval: "Weekly", capitalBack: true },
  { id: "gold",     name: "Gold",      rate: 6.0,  weeks: 16, min: 10000,   max: 20000,    step: 1000,   badge: "Popular",    interval: "Weekly", capitalBack: true },
  { id: "vip",      name: "VIP",       rate: 10.0, weeks: 24, min: 50000,   max: 200000,   step: 5000,   badge: "High Yield", interval: "Weekly", capitalBack: true },
  { id: "ultimate", name: "Ultimate",  rate: 12.0, weeks: 36, min: 500000,  max: 3000000,  step: 50000,  badge: "Executive",  interval: "Weekly", capitalBack: true },
  { id: "elites",   name: "Elites",    rate: 15.5, weeks: 52, min: 5000000, max: 20000000, step: 250000, badge: "Exclusive",  interval: "Weekly", capitalBack: true },
];

export default function RoiCalculator() {
  const [plansList, setPlansList] = useState<InvestmentTier[]>(DEFAULT_PLANS);
  const [selected, setSelected] = useState<InvestmentTier>(DEFAULT_PLANS[0]);
  const [amount, setAmount] = useState<number>(1000);
  const [customWeeks, setCustomWeeks] = useState<number>(8);
  const [inputVal, setInputVal] = useState<string>("1000");

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("investment_plans")
          .select("*")
          .eq("is_active", true)
          .order("min_amount", { ascending: true });

        if (data && data.length > 0) {
          const formatted: InvestmentTier[] = data.map((p: any) => {
            const isWeekly = Number(p.payout_interval_hours) === 168 || (p.description || "").toLowerCase().includes("week");
            const rate = Number(p.roi_percentage || 0);
            const weeks = isWeekly ? Number(p.total_payout_periods || 8) : Math.max(1, Math.round(Number(p.total_payout_periods || 30) / 7));
            const min = Number(p.min_amount || 100);
            const max = Number(p.max_amount || 10000);
            const step = Math.max(50, Math.round((max - min) / 20));
            const isElite = (p.name || "").toLowerCase().includes("elite");
            const badge = p.badge || (isElite ? "Exclusive" : rate >= 10 ? "High Yield" : rate >= 6 ? "Popular" : "Standard");
            return {
              id: p.id,
              name: p.name.replace(/ Package$/i, ""),
              rate,
              weeks,
              min,
              max,
              step,
              badge,
              interval: isWeekly ? "Weekly" : "Daily",
              capitalBack: p.capital_back ?? true,
            };
          });
          setPlansList(formatted);
          setSelected(formatted[0]);
          setAmount(formatted[0].min);
          setInputVal(formatted[0].min.toString());
          setCustomWeeks(formatted[0].weeks);
        }
      } catch {
        // Fallback silently
      }
    })();
  }, []);

  const changePlan = (tier: InvestmentTier) => {
    setSelected(tier);
    let newAmount = amount;
    if (newAmount < tier.min) newAmount = tier.min;
    if (newAmount > tier.max) newAmount = tier.max;
    setAmount(newAmount);
    setInputVal(newAmount.toString());
    setCustomWeeks(tier.weeks);
  };

  const addAmount = (delta: number) => {
    const next = Math.min(selected.max, Math.max(selected.min, amount + delta));
    setAmount(next);
    setInputVal(next.toString());
  };

  const setExplicitAmount = (val: number) => {
    const next = Math.min(selected.max, Math.max(selected.min, val));
    setAmount(next);
    setInputVal(next.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "");
    setInputVal(clean);
    const parsed = Number(clean);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleInputBlur = () => {
    let parsed = Number(inputVal) || selected.min;
    if (parsed < selected.min) parsed = selected.min;
    if (parsed > selected.max) parsed = selected.max;
    setAmount(parsed);
    setInputVal(parsed.toString());
  };

  // Calculations
  const weeklyProfit = useMemo(() => (amount * selected.rate) / 100, [amount, selected.rate]);
  const netProfit = useMemo(() => weeklyProfit * customWeeks, [weeklyProfit, customWeeks]);
  const totalReturn = useMemo(() => amount + netProfit, [amount, netProfit]);
  const roiPercentage = useMemo(() => (amount > 0 ? (netProfit / amount) * 100 : 0), [amount, netProfit]);
  const sliderPercentage = Math.min(100, Math.max(0, ((amount - selected.min) / (selected.max - selected.min || 1)) * 100));

  const durationOptions = [
    { label: "4 Wks", weeks: 4 },
    { label: "8 Wks", weeks: 8 },
    { label: `${selected.weeks}w (Std)`, weeks: selected.weeks },
    { label: "24 Wks", weeks: 24 },
    { label: "52 Wks", weeks: 52 },
  ];

  return (
    <section id="calculator" className="py-14 border-b border-[#d4e7e9] relative bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Streamlined Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#c8e2e5] bg-[#f0f8f9] text-[#093A3E] mb-2 shadow-2xs">
              <Calculator className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>Yield Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001011] tracking-tight">
              Simulate Your Returns
            </h2>
            <p className="text-[#2f494c] text-xs sm:text-sm mt-1 font-normal">
              Select a tier and adjust your capital to preview real-time automated weekly returns.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-[#093A3E] bg-[#f0f8f9] border border-[#c8e2e5] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3AAFB9]" />
            <span>100% Principal Returned at End</span>
          </div>
        </div>

        {/* Compact Integrated Console Container */}
        <div className="bg-white border border-[#d4e7e9] rounded-2xl shadow-sm overflow-hidden">
          
          {/* 1. Low-Profile Tier Tabs */}
          <div className="bg-[#f0f8f9] border-b border-[#d4e7e9] p-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max sm:min-w-0 sm:grid sm:grid-cols-6">
              {plansList.map((tier) => {
                const isSelected = selected.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => changePlan(tier)}
                    className={`py-2 px-3 rounded-xl text-center transition-all cursor-pointer border text-xs ${
                      isSelected
                        ? "bg-[#093A3E] text-white border-[#093A3E] font-bold shadow-xs"
                        : "bg-white text-[#001011] border-[#d4e7e9] hover:border-[#3AAFB9] hover:bg-[#f8fcfc] font-medium"
                    }`}
                  >
                    <div className="truncate">{tier.name}</div>
                    <div className={`font-mono text-[11px] font-bold ${isSelected ? "text-[#3AAFB9]" : "text-[#093A3E]"}`}>
                      {tier.rate}%/wk
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Levers (Side-by-Side 2 Columns) */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Left Lever: Capital Amount */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold uppercase tracking-wider text-[#001011]">
                  Capital Amount
                </label>
                <span className="text-[11px] text-[#5e7e83] font-mono">
                  ${selected.min.toLocaleString()} – ${selected.max.toLocaleString()}
                </span>
              </div>

              {/* Compact Input + Min/Max */}
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#5e7e83] font-bold text-base select-none">$</span>
                <input
                  type="text"
                  value={Number(inputVal || 0).toLocaleString()}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-full pl-8 pr-28 py-2 bg-[#f8fcfc] border border-[#d4e7e9] rounded-xl text-base font-mono font-bold text-[#001011] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AAFB9]/20 focus:border-[#093A3E] transition-all"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setExplicitAmount(selected.min)}
                    className="text-[10px] uppercase font-bold text-[#093A3E] hover:text-[#001011] bg-white border border-[#d4e7e9] px-2 py-0.5 rounded transition-colors"
                  >
                    Min
                  </button>
                  <button
                    type="button"
                    onClick={() => addAmount(1000)}
                    className="text-[10px] font-bold text-[#093A3E] hover:text-[#001011] bg-white border border-[#d4e7e9] px-2 py-0.5 rounded transition-colors hidden sm:inline"
                  >
                    +1k
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplicitAmount(selected.max)}
                    className="text-[10px] uppercase font-bold text-[#093A3E] hover:text-[#001011] bg-white border border-[#d4e7e9] px-2 py-0.5 rounded transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={selected.min}
                max={selected.max}
                step={selected.step}
                value={amount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAmount(val);
                  setInputVal(val.toString());
                }}
                style={{
                  background: `linear-gradient(to right, #093A3E 0%, #093A3E ${sliderPercentage}%, #d4e7e9 ${sliderPercentage}%, #d4e7e9 100%)`,
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#093A3E]"
              />
            </div>

            {/* Right Lever: Holding Duration */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-bold uppercase tracking-wider text-[#001011]">
                  Holding Duration
                </label>
                <span className="text-xs font-mono font-bold text-[#093A3E]">
                  {customWeeks} Weeks <span className="text-[11px] text-[#5e7e83] font-normal">(~{(customWeeks / 4.333).toFixed(1)} mo)</span>
                </span>
              </div>

              {/* Horizon Quick Pills */}
              <div className="grid grid-cols-5 gap-1">
                {durationOptions.map((opt) => {
                  const isCurrent = customWeeks === opt.weeks;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setCustomWeeks(opt.weeks)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#093A3E] text-white border-[#093A3E]"
                          : "bg-white text-[#2f494c] border-[#d4e7e9] hover:border-[#3AAFB9] hover:bg-[#f0f8f9]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Weeks Slider */}
              <input
                type="range"
                min={1}
                max={52}
                step={1}
                value={customWeeks}
                onChange={(e) => setCustomWeeks(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #093A3E 0%, #093A3E ${(customWeeks / 52) * 100}%, #d4e7e9 ${(customWeeks / 52) * 100}%, #d4e7e9 100%)`,
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#093A3E]"
              />
            </div>

          </div>

          {/* 3. Executive Real-Time Result Strip (Compact Ink Black Bar) */}
          <div className="bg-[#001011] p-4 sm:p-5 border-t border-[#093A3E] flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            
            {/* Metric Pods Cluster */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 items-center">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#b5dfe3] block">
                  Weekly Yield
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-[#3AAFB9]">
                  +${weeklyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-x border-[#093A3E] px-3 sm:px-6">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#b5dfe3] block">
                  Net Profit ({customWeeks}w)
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white">
                  +${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#b5dfe3]">
                    Total Return
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#093A3E] text-[#3AAFB9] font-bold">
                    +{roiPercentage.toFixed(0)}%
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-black font-mono text-white block">
                  ${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-end">
              <Link
                href={`/register?plan=${encodeURIComponent(selected.name)}&amount=${amount}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#3AAFB9] to-[#278e98] hover:from-[#5cb4be] hover:to-[#3AAFB9] text-[#001011] font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-[#3AAFB9]/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>Deploy ${amount.toLocaleString()} in {selected.name}</span>
                <ArrowRight className="w-4 h-4 text-[#001011]" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
