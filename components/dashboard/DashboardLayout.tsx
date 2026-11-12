"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Wallet, ArrowDownRight, ArrowUpRight,
  History, Users, User, ShieldCheck, Key, ShieldAlert,
  LogOut, TrendingUp, Menu, X, Bell, Globe, Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSelector from "@/components/common/LanguageSelector";
import { getActiveUser, exitImpersonation } from "@/lib/auth/activeUser";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export default function DashboardLayout({ children, userEmail: initialEmail }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState(initialEmail || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const activeUser = await getActiveUser(supabase);
      if (activeUser) {
        setUserEmail(activeUser.email);
        setFullName(activeUser.full_name);
        setAvatarUrl(activeUser.avatar_url || "");
        setIsImpersonating(activeUser.isImpersonating);

        // Check if logged-in user is admin
        const adminUser = activeUser.adminUser;
        const metaRole = adminUser?.user_metadata?.role as string | undefined;
        if (metaRole === "admin") {
          setIsAdmin(true);
        } else {
          const { data: adminProfile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", adminUser.id)
            .single();
          if (adminProfile?.role === "admin") {
            setIsAdmin(true);
          }
        }

        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", activeUser.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (notifs) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
        }
      }
    };
    fetchUserData();
  }, [initialEmail]);

  const handleMarkNotificationsRead = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadCount > 0) {
      setUnreadCount(0);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
      }
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navGroups = [
    {
      group: "Portfolio",
      items: [
        { label: t.dashboard.overview,         href: "/dashboard",              icon: LayoutDashboard },
        { label: t.dashboard.investments,      href: "/dashboard/investments",  icon: TrendingUp },
        { label: t.dashboard.transactions,     href: "/dashboard/transactions", icon: History },
      ],
    },
    {
      group: "Transfers",
      items: [
        { label: t.dashboard.depositFunds,     href: "/dashboard/deposit",      icon: ArrowDownRight },
        { label: t.dashboard.withdrawFunds,    href: "/dashboard/withdraw",     icon: ArrowUpRight },
      ],
    },
    {
      group: "Account & Security",
      items: [
        { label: t.dashboard.accountSettings,  href: "/dashboard/profile",      icon: User },
        { label: t.dashboard.kycVerification,  href: "/dashboard/kyc",          icon: ShieldCheck },
        { label: t.dashboard.twoFactor,        href: "/dashboard/two-factor",   icon: Key },
        { label: t.dashboard.referrals,        href: "/dashboard/referral",     icon: Users },
      ],
    },
  ];

  const userInitial = (fullName || userEmail || "U").charAt(0).toUpperCase();

  return (
    <div className="h-screen overflow-hidden bg-[#fafaf5] text-[#20281f] flex flex-col md:flex-row">

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden bg-[#fafaf5] border-b border-[#e4e7dc] px-4 h-16 flex items-center justify-between flex-shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-[7px] border border-[#20281f20] text-[#60695b] hover:text-[#20281f] hover:bg-[#e4e7dc]/50 flex items-center gap-1 text-[11px] font-medium mr-1 transition-colors no-underline"
          >
            <Globe className="w-3.5 h-3.5 text-[#20281f]" />
            <span>Site</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <span className="grid h-[32px] w-[32px] place-items-center rounded-[8px] bg-[#20281f] text-[#d1f18b]">
              <svg width="18" height="18" viewBox="0 0 32 32">
                <circle cx="16" cy="9" r="4" fill="currentColor" />
                <circle cx="22.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.75" />
                <circle cx="9.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.5" />
              </svg>
            </span>
            <span className="text-[17px] font-bold tracking-tight text-[#20281f]">
              Alpha<span className="font-normal">assets</span><span className="text-[#81ab41]">.</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-[7px] border border-[#20281f20] text-[#20281f] hover:bg-[#e4e7dc]/60 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#fafaf5] border-r border-[#e4e7dc] flex flex-col flex-shrink-0 transition-transform duration-200 md:static md:translate-x-0 md:h-screen
        ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#e4e7dc] flex-shrink-0 bg-[#fafaf5]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group no-underline">
            <span
              className="grid h-[35px] w-[35px] place-items-center rounded-[10px] bg-[#20281f] text-[#d1f18b] shadow-2xs group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 32 32">
                <circle cx="16" cy="9" r="4" fill="currentColor" />
                <circle cx="22.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.75" />
                <circle cx="9.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.5" />
              </svg>
            </span>
            <div>
              <div className="text-[17px] font-bold tracking-[-0.8px] text-[#20281f] leading-none">
                Alpha<span className="font-normal">assets</span><span className="font-black text-[#81ab41]">.</span>
              </div>
              <div className="text-[10px] text-[#60695b] font-medium tracking-wide mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#86a951] inline-block animate-pulse" />
                AI Sovereign Rails
              </div>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-[#60695b] hover:text-[#20281f] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-[#7d8573] uppercase tracking-wider px-3 mb-1.5">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13.5px] font-medium transition-colors no-underline ${
                      isActive
                        ? "bg-[#e3f2c9] text-[#20281f] font-bold shadow-2xs"
                        : "text-[#60695b] hover:bg-[#e4e7dc]/50 hover:text-[#20281f]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#537722]" : "text-[#7d8573]"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#e4e7dc] p-3 space-y-1.5 flex-shrink-0 bg-[#fafaf5]">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-[7px] text-[12px] font-semibold text-[#20281f] bg-white border border-[#e4e7dc] hover:bg-[#f0f2eb] transition-all shadow-2xs no-underline"
          >
            <Globe className="w-3.5 h-3.5 text-[#20281f]" />
            <span>{t.nav.backToSite}</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-[7px] text-[12px] font-bold text-white bg-[#20281f] hover:bg-[#343e32] transition-colors shadow-xs no-underline"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#d1f18b]" />
              <span>{t.dashboard.adminPortal}</span>
            </Link>
          )}

          <div className="px-3 py-1.5">
            <div className="text-[13px] font-bold text-[#20281f] truncate">{fullName || "Investor"}</div>
            <div className="text-[11px] text-[#7d8573] truncate font-mono">{userEmail}</div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[12px] font-medium text-[#60695b] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.dashboard.signOut}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#fafaf5]">

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 h-20 bg-[#fafaf5]/90 backdrop-blur-md border-b border-[#e4e7dc] flex-shrink-0 z-40">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#60695b] hover:text-[#20281f] transition-colors no-underline"
            >
              <Globe className="w-3.5 h-3.5 text-[#20281f]" />
              <span>{t.nav.backToSite}</span>
            </Link>
            <span className="text-[#c7cdbf]">/</span>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#627446] bg-[#f4f7ec] px-3 py-1 rounded-full border border-[#dfe6d2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#86a951] animate-pulse" />
              <span>{t.dashboard.investorWorkspace}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="default" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleMarkNotificationsRead}
                className="relative p-2 rounded-[7px] border border-[#20281f20] text-[#20281f] hover:bg-[#e4e7dc]/50 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#86a951] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#fafaf5]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#e4e7dc] rounded-[10px] shadow-xl p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e4e7dc]">
                    <span className="text-[13px] font-bold text-[#20281f]">Notifications</span>
                    <span className="text-[11px] text-[#537722] hover:underline font-semibold cursor-pointer">Mark all read</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-[13px] text-[#7d8573] py-4 text-center">No notifications yet.</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n.id} className="p-2.5 rounded-[7px] bg-[#fafaf5] border border-[#e4e7dc]">
                          <div className="text-[13px] font-semibold text-[#20281f]">{n.title}</div>
                          <div className="text-[12px] text-[#60695b] mt-0.5 leading-snug">{n.message}</div>
                          <div className="text-[10px] text-[#7d8573] mt-1 text-right font-mono">{new Date(n.created_at).toLocaleTimeString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 pl-3 border-l border-[#e4e7dc] hover:opacity-85 transition-opacity no-underline"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#20281f20]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#20281f] text-[#d1f18b] font-bold text-[12px] flex items-center justify-center shadow-xs">
                  {userInitial}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-[13px] font-bold text-[#20281f] leading-none truncate max-w-[120px]">{fullName || "Investor"}</div>
                <div className="text-[11px] text-[#7d8573] mt-0.5 truncate max-w-[120px] font-mono">{userEmail}</div>
              </div>
            </Link>
          </div>
        </header>

        {isImpersonating && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 flex-shrink-0 z-30">
            <div className="flex items-center gap-2 font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span>
                <strong>Admin Impersonation Mode:</strong> Viewing as <strong>{fullName || "Investor"}</strong> ({userEmail})
              </span>
            </div>
            <button
              type="button"
              onClick={exitImpersonation}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-[7px] text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              Exit to Admin
            </button>
          </div>
        )}

        <main className="flex-1 min-w-0 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
