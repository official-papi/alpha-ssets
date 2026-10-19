"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { HelpCircle, Search, ChevronDown, CheckCircle2, MessageSquare, Clock } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    category: "AI Trading & Wallet Connect",
    q: "How does Wallet Connect and automated trading work?",
    a: "You can connect your Web3 wallet (MetaMask, WalletConnect, Coinbase, or Trust Wallet) directly. By connecting, you authorize the company's automated trading desk to trade on your behalf using advanced AI algorithms that make smarter, high-conviction decisions on exactly when to buy and sell.",
  },
  {
    category: "Security & Escrow",
    q: "How are my deposited funds and wallet assets protected?",
    a: "We utilize an institutional smart-contract Escrow System. Your principal remains locked in multi-signature escrow segregated vaults throughout the investment cycle. The company can only execute trades; funds can never be withdrawn without your private key.",
  },
  {
    category: "AI Intelligence",
    q: "How does the AI determine when to buy and sell?",
    a: "Our neural deep-learning model continuously scans order books, cross-exchange liquidity, volatility indices, and momentum oscillators across 40+ premier exchanges to mathematically identify high-probability entry (buy) and exit (sell) points with dynamic stop-losses.",
  },
  {
    category: "Investment Plans",
    q: "What investment plans are available?",
    a: "The platform offers two structured tiers: the Basic Plan ($200 to $4,999 with 3.5% weekly yield for 8 weeks) and the Premium Plan ($5,000 to $1,000,000 with 7.0% weekly yield for 16 weeks). Both return 100% of your principal upon maturity.",
  },
  {
    category: "Deposits & Payouts",
    q: "What deposit and payout options are supported?",
    a: "We support USDT (TRC20 & ERC20), Bitcoin (BTC), Ethereum (ETH), direct Web3 connected wallet settlements, and Bank Wire Transfers.",
  },
  {
    category: "Affiliate Network",
    q: "How does the multi-tier referral program work?",
    a: "You earn 5% on direct Level 1 referrals, 3% on Level 2 referrals, and 1% on Level 3 referrals whenever they fund an investment plan.",
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-600 flex flex-col font-sans relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10 pb-20">
        
        {/* Architectural 2-Column Hero */}
        <PageHero
          badge="Platform Knowledge Base"
          title="Frequently Asked Questions &"
          titleHighlight="Instant Answers"
          subtitle="Find instant answers to common questions about deposits, payouts, investment compounding schedules, and affiliate rewards."
          icon={HelpCircle}
          breadcrumb="FAQ"
          stats={[
            { label: "Articles", value: "50+ Topics" },
            { label: "Resolution SLA", value: "< 5 Mins" },
            { label: "Search Index", value: "Instant" },
          ]}
          hudContent={
            <div className="space-y-3 py-1 text-xs font-medium">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <span className="text-slate-500">Knowledge Index</span>
                <span className="font-mono font-extrabold text-[#093A3E]">Updated Daily</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
                <span className="text-emerald-900">Support Desk Status</span>
                <span className="font-extrabold text-emerald-600 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online 24/7</span>
                </span>
              </div>
            </div>
          }
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          
          {/* Glass Search Bar */}
          <div className="relative max-w-xl mx-auto mb-10 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#093A3E]/15 to-[#3AAFB9]/15 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-4" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400 bg-transparent"
              />
            </div>
          </div>

          {/* Glass FAQ Accordions */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#093A3E]/10 to-[#3AAFB9]/10 rounded-3xl blur-md opacity-40 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-6 shadow-xl shadow-slate-900/5 transition-all">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenIndex(openIndex === idx ? null : idx)}>
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#093A3E]/8 border border-[#093A3E]/15 text-[#093A3E] text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                        <span>{faq.q}</span>
                      </h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === idx ? "rotate-180 text-[#093A3E]" : ""}`} />
                  </div>
                  {(openIndex === idx || query.length > 0) && (
                    <p className="text-xs text-slate-600 font-medium pt-3 border-t border-slate-200/80 mt-3 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
