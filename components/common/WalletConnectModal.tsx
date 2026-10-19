"use client";

import React, { useState } from "react";
import { useWallet } from "@/lib/wallet/WalletContext";
import {
  X,
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Power,
  Copy,
  Check,
  QrCode,
  ArrowLeft,
  Smartphone,
  Globe,
} from "lucide-react";
import Link from "next/link";

const NETWORKS = [
  { id: "eth", name: "Ethereum Mainnet", icon: "💎", badge: "Primary" },
  { id: "bnb", name: "BNB Smart Chain",  icon: "⚡", badge: "Low Gas" },
  { id: "arb", name: "Arbitrum One",     icon: "🚀", badge: "L2 Speed" },
  { id: "poly", name: "Polygon PoS",     icon: "🟣", badge: "Fast" },
];

const PROVIDERS = [
  {
    id: "metamask" as const,
    name: "MetaMask",
    desc: "Connect using browser extension or mobile app",
    badge: "Popular",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 318.6 318.6" fill="none">
        <path d="M274.1 35.5l-99.5 73.9L194 65.4l80.1-29.9z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M44.5 35.5l99.1 74.4-19-44.5L44.5 35.5zM276.8 234.8l-40.4 34.1 49.3 14 14.7-47.5-23.6-.6zM41.8 234.8l23.6-.6 14.7 47.5 49.3-14-40.4-34.1-.7.6-46.5.6z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M128.8 268.9l-49.3 14 36.1 24.8 33.3-17.5-20.1-21.3zm61 0l-20.1 21.3 33.3 17.5 36.1-24.8-49.3-14z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M85.3 176.7l-22.3-32.9L22 176.7h63.3zm148 0h63.3l-41-32.9-22.3 32.9z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M159.3 227.4l34.7-22.3-27.4-23.4-32.8 1.4-26.7 22 34.4 22.3 8.9 5.8 8.9-5.8z" fill="#CC621B" stroke="#CC621B" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "walletconnect" as const,
    name: "WalletConnect",
    desc: "Scan QR code with Trust, Rainbow, or mobile wallet",
    badge: "QR Scan",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#3B99FC">
        <path d="M5.5 8.5a9.19 9.19 0 0 1 13 0l.43.43a.62.62 0 0 1 0 .87l-1.47 1.47a.31.31 0 0 1-.44 0l-.65-.65a6.57 6.57 0 0 0-9.28 0l-.69.69a.31.31 0 0 1-.44 0L4.4 9.84a.62.62 0 0 1 0-.87l1.1-1.1zm15.7 2.7l1.3 1.3a.62.62 0 0 1 0 .87l-5.87 5.87a.62.62 0 0 1-.87 0l-4.14-4.14a.15.15 0 0 0-.22 0l-4.14 4.14a.62.62 0 0 1-.87 0L.43 13.37a.62.62 0 0 1 0-.87l1.3-1.3a.62.62 0 0 1 .87 0l4.36 4.36a.15.15 0 0 0 .22 0l4.14-4.14a.62.62 0 0 1 .87 0l4.14 4.14a.15.15 0 0 0 .22 0l4.36-4.36a.62.62 0 0 1 .87 0z"/>
      </svg>
    ),
  },
  {
    id: "coinbase" as const,
    name: "Coinbase Wallet",
    desc: "Connect your Coinbase self-custody wallet",
    badge: "Institutional",
    icon: (
      <div className="w-6 h-6 rounded-full bg-[#0052FF] flex items-center justify-center text-white font-black text-[11px]">
        C
      </div>
    ),
  },
  {
    id: "trust" as const,
    name: "Trust Wallet",
    desc: "Multi-chain decentralized mobile & desktop wallet",
    badge: "Zero-Gas Ready",
    icon: (
      <div className="w-6 h-6 rounded-lg bg-[#0500FF] flex items-center justify-center text-white">
        <ShieldCheck className="w-4 h-4 text-white" />
      </div>
    ),
  },
];

export default function WalletConnectModal() {
  const {
    isModalOpen,
    closeModal,
    account,
    shortAddress,
    isConnected,
    isConnecting,
    connectionStep,
    balanceUsdt,
    balanceEth,
    networkName,
    isTradingDelegated,
    escrowLocked,
    escrowContractAddress,
    errorMessage,
    connectWallet,
    disconnectWallet,
    toggleTradingDelegation,
    switchNetwork,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isModalOpen) return null;

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const dummyWcUri = `wc:8a3c9b7e-4d2f-41a9-98e6-7b2c01d9f8a3@2?relay-protocol=irn&symKey=789f41b2cd64a51e892c94`;

  const handleCopyUri = () => {
    navigator.clipboard.writeText(dummyWcUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleSelectProvider = async (provider: "metamask" | "walletconnect" | "coinbase" | "trust") => {
    if (provider === "walletconnect") {
      setShowQr(true);
      return;
    }
    await connectWallet(provider);
  };

  const handleCompleteQr = async () => {
    setShowQr(false);
    await connectWallet("walletconnect");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#001011]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#001011] border border-[#093A3E] text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3AAFB9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#093A3E]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-[#093A3E] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#093A3E] border border-[#3AAFB9]/40 flex items-center justify-center text-[#3AAFB9] shadow-inner">
              <Cpu className="w-5 h-5 text-[#3AAFB9]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{isConnected ? "Connected Web3 Trading Vault" : showQr ? "Scan with Mobile Wallet" : "Connect Web3 Wallet"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-[#86cbd1] font-medium">
                Automated Company AI Trading & Multi-Sig Escrow Custody
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowQr(false); closeModal(); }}
            className="w-8 h-8 rounded-xl bg-[#041819] border border-[#093A3E] text-slate-400 hover:text-white hover:border-[#3AAFB9] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Escrow & AI Safeguard Strip */}
        <div className="bg-[#041819] px-6 py-3 border-b border-[#093A3E] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3AAFB9]" />
            <span className="font-bold text-white text-[11px]">Escrow Protocol:</span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">100% Principal Protected</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#86cbd1]">
            <Cpu className="w-3.5 h-3.5 text-[#3AAFB9]" />
            <span>AI Automated Buy/Sell</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 relative z-10">
          
          {/* QR Code Scan Screen (WalletConnect) */}
          {showQr && (
            <div className="space-y-5 text-center">
              <div className="flex items-center justify-between text-xs pb-1">
                <button
                  type="button"
                  onClick={() => setShowQr(false)}
                  className="flex items-center gap-1 text-[#3AAFB9] hover:underline cursor-pointer font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Providers</span>
                </button>
                <span className="text-slate-400 font-mono text-[11px]">WalletConnect v2</span>
              </div>

              {/* Crisp SVG QR Code */}
              <div className="bg-white p-6 rounded-3xl w-60 h-60 mx-auto flex flex-col items-center justify-center shadow-xl border-4 border-[#3AAFB9]/40 relative">
                <div className="grid grid-cols-6 gap-1 w-44 h-44 bg-zinc-900 p-2 rounded-xl">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? "bg-white"
                          : i % 5 === 0
                          ? "bg-[#3AAFB9]"
                          : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-[#001011] border-2 border-[#3AAFB9] flex items-center justify-center shadow-lg">
                    <Smartphone className="w-5 h-5 text-[#3AAFB9]" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white font-bold">Scan this code with your mobile crypto wallet</p>
                <p className="text-[11px] text-[#86cbd1]">Compatible with MetaMask Mobile, Trust Wallet, Rainbow, and 100+ others.</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyUri}
                  className="px-4 py-2 rounded-xl bg-[#041819] border border-[#093A3E] text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUri ? "URI Copied" : "Copy URI"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCompleteQr}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#3AAFB9] to-[#278e98] text-[#001011] font-black text-xs shadow-md cursor-pointer hover:brightness-110"
                >
                  Simulate Mobile Scan & Connect
                </button>
              </div>
            </div>
          )}

          {/* Connection In Progress Sequence */}
          {isConnecting && !showQr && (
            <div className="bg-[#041819] border border-[#3AAFB9]/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#093A3E] border border-[#3AAFB9] text-[#3AAFB9] mx-auto flex items-center justify-center">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">
                  {connectionStep === "requesting" && "Requesting Wallet Authorization..."}
                  {connectionStep === "handshaking" && "Establishing Cryptographic Handshake..."}
                  {connectionStep === "escrow_lock" && "Allocating Smart Escrow Custody Vault..."}
                </h4>
                <p className="text-[11px] text-[#86cbd1]">
                  Delegating algorithmic trade execution to company neural desk.
                </p>
              </div>
              <div className="w-full bg-[#001011] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#093A3E] via-[#3AAFB9] to-emerald-400 h-full transition-all duration-300"
                  style={{
                    width: connectionStep === "requesting" ? "35%" : connectionStep === "handshaking" ? "70%" : "95%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Connected State */}
          {isConnected && !isConnecting && !showQr && (
            <div className="space-y-5">
              
              {/* Account Address Card */}
              <div className="bg-[#041819] border border-[#3AAFB9]/40 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86cbd1]">Connected Web3 Address</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#093A3E] border border-[#3AAFB9]/40 text-[#3AAFB9] text-[10px] font-mono font-bold">
                    {networkName}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#001011] p-3 rounded-xl border border-[#093A3E]">
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-white truncate max-w-[280px]">
                    {account}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-[#093A3E] text-[#3AAFB9] hover:text-white transition-colors cursor-pointer"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Balances */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#001011] p-3 rounded-xl border border-[#093A3E]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">USDT Balance</div>
                    <div className="text-base font-mono font-black text-emerald-400 mt-0.5">
                      ${balanceUsdt.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#001011] p-3 rounded-xl border border-[#093A3E]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Escrow Custody</div>
                    <div className="text-base font-mono font-black text-[#3AAFB9] mt-0.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{escrowLocked ? "Active & Locked" : "Standby"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Switcher Strip */}
              <div className="bg-[#041819] border border-[#093A3E] rounded-2xl p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Switch Web3 Network</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => switchNetwork(n.name)}
                      className={`p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        networkName === n.name
                          ? "bg-[#093A3E] text-[#3AAFB9] border border-[#3AAFB9]/40"
                          : "bg-[#001011] text-slate-400 border border-[#093A3E] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{n.icon}</span>
                        <span className="truncate">{n.name.split(" ")[0]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Automated Trading Toggle */}
              <div className="bg-[#041819] border border-[#093A3E] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <span>Delegate Company AI Trading</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-[#86cbd1] leading-relaxed">
                      Authorizes our neural trading engine to buy and sell on your behalf with dynamic risk stop-losses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTradingDelegation}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      isTradingDelegated ? "bg-[#3AAFB9] justify-end" : "bg-slate-700 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 bg-[#001011] p-3 rounded-xl border border-[#093A3E] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Escrow Safeguard:</strong> The company only executes trades; all withdrawals require your private key authorization.</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/dashboard/wallet-connect"
                  onClick={closeModal}
                  className="py-3 px-4 rounded-xl bg-[#093A3E] hover:bg-[#001011] border border-[#3AAFB9]/40 text-[#3AAFB9] text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Open Vault Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="py-3 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>

            </div>
          )}

          {/* Disconnected Provider Selection */}
          {!isConnected && !isConnecting && !showQr && (
            <div className="space-y-4">
              <div className="text-xs text-[#b5dfe3] leading-relaxed bg-[#041819] p-4 rounded-2xl border border-[#093A3E] space-y-1.5">
                <div className="font-extrabold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#3AAFB9]" />
                  <span>Delegated Web3 Trading Architecture:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-[#86cbd1] list-disc list-inside">
                  <li><strong>Connect Wallet:</strong> Authorize your Web3 wallet in one click.</li>
                  <li><strong>AI Trading Desk:</strong> The company trades for you with neural algorithms that make smarter buy/sell decisions.</li>
                  <li><strong>Multi-Sig Escrow:</strong> Your principal is ring-fenced inside smart escrow for zero counterparty risk.</li>
                </ul>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2.5">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProvider(p.id)}
                    className="w-full p-4 rounded-2xl bg-[#041819] hover:bg-[#093A3E]/50 border border-[#093A3E] hover:border-[#3AAFB9] text-left transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#001011] border border-[#093A3E] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        {p.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white group-hover:text-[#3AAFB9] transition-colors">
                            {p.name}
                          </span>
                          <span className="px-2 py-0.2 rounded-md bg-[#093A3E] text-[#3AAFB9] text-[9px] font-bold uppercase tracking-wider border border-[#3AAFB9]/30">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#86cbd1] mt-0.5">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#001011] border border-[#093A3E] flex items-center justify-center text-slate-400 group-hover:text-[#3AAFB9] group-hover:border-[#3AAFB9]/50 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#041819] border-t border-[#093A3E] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#3AAFB9]" />
            <span>Escrow Contract: {escrowContractAddress.substring(0, 8)}...</span>
          </div>
          <Link
            href="/dashboard/wallet-connect"
            onClick={closeModal}
            className="text-[#3AAFB9] hover:underline font-bold"
          >
            Full Vault Console →
          </Link>
        </div>

      </div>
    </div>
  );
}
