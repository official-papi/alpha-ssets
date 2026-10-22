import React from "react";
import Image from "next/image";

interface IconProps {
  className?: string;
  size?: number;
}

const COIN_ICONS: Record<string, string> = {
  XRP: "/images/crypto/xrp.svg",
  BTC: "/images/crypto/btc.svg",
  ETH: "/images/crypto/eth.svg",
  USDT: "/images/crypto/usdt.svg",
  SOL: "/images/crypto/sol.svg",
};

export function CryptoCoinIcon({ symbol, className = "w-6 h-6", size = 24 }: { symbol: string; className?: string; size?: number }) {
  const sym = symbol?.toUpperCase() || "USDT";
  const iconPath = COIN_ICONS[sym];

  if (iconPath) {
    return (
      <img
        src={iconPath}
        alt={`${sym} logo`}
        width={size}
        height={size}
        className={`${className} object-contain flex-shrink-0`}
      />
    );
  }

  return (
    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
      {sym.slice(0, 3)}
    </div>
  );
}

export function XrpIcon({ className = "w-6 h-6", size = 24 }: IconProps) {
  return <CryptoCoinIcon symbol="XRP" className={className} size={size} />;
}

export function BtcIcon({ className = "w-6 h-6", size = 24 }: IconProps) {
  return <CryptoCoinIcon symbol="BTC" className={className} size={size} />;
}

export function EthIcon({ className = "w-6 h-6", size = 24 }: IconProps) {
  return <CryptoCoinIcon symbol="ETH" className={className} size={size} />;
}

export function UsdtIcon({ className = "w-6 h-6", size = 24 }: IconProps) {
  return <CryptoCoinIcon symbol="USDT" className={className} size={size} />;
}

export function SolIcon({ className = "w-6 h-6", size = 24 }: IconProps) {
  return <CryptoCoinIcon symbol="SOL" className={className} size={size} />;
}
