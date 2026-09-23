"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, LogOut, ArrowDownRight, ArrowUpRight, Plus, ShieldAlert, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSelector from "@/components/common/LanguageSelector";

interface DashboardHeaderProps {
  userEmail?: string;
  userName?: string;
  depositBalance?: number;
  interestBalance?: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenInvest: () => void;
}

export default function DashboardHeader({
  userEmail = "investor@example.com",
  userName = "Investor",
  depositBalance = 0,
  interestBalance = 0,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenInvest,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (
          profile?.role === "admin" ||
          user.user_metadata?.role === "admin" ||
          (user.email || "").includes("admin")
        ) {
          setIsAdmin(true);
        }
      }
    };

    checkAdminRole();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "IV";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Brand Logo & Status */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#093A3E] flex items-center justify-center shadow-lg shadow-[#093A3E]/20 group-hover:scale-105 transition-transform text-[#3AAFB9]">
            <TrendingUp className="w-5 h-5 font-bold" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              Alpha<span className="text-[#3AAFB9]">@ssets</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="block text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              {t.dashboard.investorWorkspace}
            </span>
          </div>
        </Link>

        {/* Live Wallet Quick Ticker */}
        <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center space-x-2 pr-3 border-r border-slate-200">
            <Wallet className="w-3.5 h-3.5 text-[#093A3E]" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">{t.dashboard.depositWallet}</span>
              <span className="font-mono font-bold text-slate-900">${depositBalance.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">{t.dashboard.interestWallet}</span>
              <span className="font-mono font-bold text-emerald-600">${interestBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Admin Switcher Button */}
        <div className="flex items-center gap-3">

          {/* Language Selector */}
          <LanguageSelector variant="default" />

          {/* Prominent Admin Switcher Button for Admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-700 font-extrabold text-xs flex items-center space-x-1.5 hover:bg-amber-100 transition-all shadow-sm cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{t.dashboard.adminPortal}</span>
            </Link>
          )}

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenInvest}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#093A3E] hover:bg-[#001011] transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-[#093A3E]/10"
            >
              <Plus className="w-4 h-4 text-[#3AAFB9]" />
              <span>{t.dashboard.investNow}</span>
            </button>

            <button
              onClick={onOpenDeposit}
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center space-x-1 hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{t.dashboard.deposit}</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="px-3.5 py-2 rounded-xl border border-sky-300 bg-sky-50 text-sky-700 font-bold text-xs flex items-center space-x-1 hover:bg-sky-100 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t.dashboard.withdraw}</span>
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#093A3E] to-[#001011] text-[#3AAFB9] flex items-center justify-center font-extrabold text-xs shadow-md border border-[#093A3E]/30">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-none">{userName}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">{userEmail}</div>
            </div>
            <button
              onClick={handleLogout}
              title={t.dashboard.signOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
