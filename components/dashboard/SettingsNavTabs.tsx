"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShieldCheck, Key } from "lucide-react";

export default function SettingsNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Account Profile & Payout",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      label: "Identity Verification (KYC)",
      href: "/dashboard/kyc",
      icon: ShieldCheck,
    },
    {
      label: "Two-Factor Security (2FA)",
      href: "/dashboard/two-factor",
      icon: Key,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#093A3E]" : "text-slate-400"}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

