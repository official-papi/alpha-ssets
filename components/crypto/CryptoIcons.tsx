import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export function XrpIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
    >
      <path d="M19.049 3h2.366l-5.69 5.626 3.652 4.966h-2.392l-2.456-3.342-2.457 3.342H9.68l3.652-4.966L7.642 3H10.01l2.457 2.428L14.924 3h2.366l-3.652 3.593L19.049 3zM4.951 21H2.585l5.69-5.626-3.652-4.966h2.392l2.456 3.342 2.457-3.342h2.392l-3.652 4.966L16.358 21H13.99l-2.457-2.428L9.076 21H6.71l3.652-3.593L4.951 21z" />
    </svg>
  );
}

export function BtcIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
    >
      <path d="M15.7 10.3c.4-.7.6-1.5.4-2.4-.4-1.8-2-2.7-4.1-2.7V3h-1.5v2.1h-1.2V3H7.8v2.2H5.5v1.6h1.2c.4 0 .7.3.7.7v8.8c0 .4-.3.7-.7.7H5.5v1.6h2.3V21h1.5v-2.1h1.2V21h1.5v-2.2c2.7-.2 4.6-1.5 4.8-3.9.1-1.3-.4-2.4-1.1-2.9v-.1c.7-.4 1.2-1 1.4-1.6zm-5.4-3.4c1.3 0 2.4.5 2.5 1.7.1 1.2-.9 1.8-2.3 1.8h-1.6V6.9h1.4zm.5 10.3h-1.9v-3.8h1.9c1.5 0 2.5.6 2.5 1.9 0 1.3-1.1 1.9-2.5 1.9z" />
    </svg>
  );
}

export function EthIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
    >
      <path d="M11.944 17.97L4.582 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
    </svg>
  );
}

export function UsdtIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
    >
      <path d="M13.25 10.58c-.14.01-.73.05-1.25.05-.6 0-1.1-.04-1.25-.05V9.45h2.5v1.13zm-1.25 8.42c-4.28 0-7.75-.9-7.75-2.02v-2.61c1.23.63 3.4 1.07 5.92 1.18v2.79c.56.02 1.15.02 1.66 0v-2.79c2.51-.11 4.69-.55 5.92-1.18v2.61c0 1.12-3.47 2.02-7.75 2.02zm8.5-5.32c-.37.33-1 .61-1.83.85-.98.28-2.26.47-3.7.54l1.32 3.63c2.72-.6 4.67-1.74 4.67-3.05 0-.74-.63-1.42-1.73-1.97h.27zm-14.75 0c-.04.02-.08.03-.11.05-1.07.54-1.69 1.21-1.69 1.92 0 1.31 1.95 2.45 4.67 3.05l1.32-3.63c-1.44-.07-2.72-.26-3.7-.54-.83-.24-1.46-.52-1.83-.85h1.34zm6.25-9.68H5.5V2h13v2h-5.25v2.87c3.9.21 6.88 1.23 6.88 2.46s-2.98 2.25-6.88 2.46v4.61c-.53.02-1.08.02-1.62 0V11.8C7.72 11.58 4.75 10.56 4.75 9.33s2.97-2.25 6.88-2.46V4h.37z" />
    </svg>
  );
}

export function SolIcon({ className = "w-6 h-6", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      width={size}
      height={size}
    >
      <path d="M4.5 17.5h12.8c.4 0 .7.2.9.5l2 2.5c.3.4 0 1-.5 1H6.9c-.4 0-.7-.2-.9-.5l-2-2.5c-.3-.4 0-1 .5-1zm0-7.3h12.8c.4 0 .7.2.9.5l2 2.5c.3.4 0 1-.5 1H6.9c-.4 0-.7-.2-.9-.5l-2-2.5c-.3-.4 0-1 .5-1zm15-4.7H6.7c-.4 0-.7-.2-.9-.5l-2-2.5C3.5 2.1 3.8 1.5 4.3 1.5h12.8c.4 0 .7.2.9.5l2 2.5c.3.4 0 1-.5 1z" />
    </svg>
  );
}

export function CryptoCoinIcon({ symbol, className = "w-6 h-6" }: { symbol: string; className?: string }) {
  switch (symbol.toUpperCase()) {
    case "XRP":
      return <XrpIcon className={className} />;
    case "BTC":
      return <BtcIcon className={className} />;
    case "ETH":
      return <EthIcon className={className} />;
    case "USDT":
      return <UsdtIcon className={className} />;
    case "SOL":
      return <SolIcon className={className} />;
    default:
      return <span className="font-extrabold text-xs">{symbol}</span>;
  }
}
