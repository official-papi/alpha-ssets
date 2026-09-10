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

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export default function DashboardLayout({ children, userEmail }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, avatar_url")
          .eq("id", user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || user.user_metadata?.full_name || "");
          setAvatarUrl(profile.avatar_url || "");
        }

        // Check JWT metadata first (no RLS dependency), then DB role
        const metaRole = user.user_metadata?.role as string | undefined;
        if (metaRole === "admin" || profile?.role === "admin") {
          setIsAdmin(true);
        }

        const { data: notifs } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (notifs) {
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
        }
      }
    };
    fetchUserData();
  }, []);

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

  const navItems = [
    { label: t.dashboard.overview,         href: "/dashboard",              icon: LayoutDashboard },
    { label: t.dashboard.investments,      href: "/dashboard/investments",  icon: TrendingUp },
    { label: t.dashboard.depositFunds,     href: "/dashboard/deposit",      icon: ArrowDownRight },
    { label: t.dashboard.withdrawFunds,    href: "/dashboard/withdraw",     icon: ArrowUpRight },
    { label: t.dashboard.transactions,     href: "/dashboard/transactions", icon: History },
    { label: t.dashboard.referrals,        href: "/dashboard/referral",     icon: Users },
    { label: t.dashboard.accountSettings,  href: "/dashboard/profile",      icon: User },
    { label: t.dashboard.kycVerification,  href: "/dashboard/kyc",          icon: ShieldCheck },
    { label: t.dashboard.twoFactor,        href: "/dashboard/two-factor",   icon: Key },
  ];

  const userInitial = (fullName || userEmail || "U").charAt(0).toUpperCase();

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex flex-col md:flex-row">

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between flex-shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 text-[11px] font-bold mr-1">
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>Site</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              Alpha<span className="text-indigo-600">@</span>ssets
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 transition-transform duration-200 md:static md:translate-x-0 md:h-screen
        ${mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
      `}>
        {/* Logo Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[15px] font-bold tracking-tight text-slate-900 leading-none">
                Alpha<span className="text-indigo-600">@</span>ssets
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">{t.dashboard.investorWorkspace}</div>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <div className="text-[10px] font-700 text-slate-400 uppercase tracking-widest px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all border-l-[3px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold border-l-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 p-3 space-y-1 flex-shrink-0">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-indigo-700 bg-indigo-50/80 border border-indigo-100 hover:bg-indigo-100 transition-colors"
          >
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>{t.nav.backToSite}</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{t.dashboard.adminPortal}</span>
            </Link>
          )}
          <div className="px-3 py-2">
            <div className="text-[13px] font-semibold text-slate-900 truncate">{fullName || "Investor"}</div>
            <div className="text-[11px] text-slate-400 truncate">{userEmail}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.dashboard.signOut}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 h-14 bg-white border-b border-slate-100 flex-shrink-0 z-40">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.nav.backToSite}</span>
            </Link>
            <span className="text-slate-200">|</span>
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t.dashboard.investorWorkspace}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="default" />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleMarkNotificationsRead}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[13px] font-semibold text-slate-900">Notifications</span>
                    <span className="text-[11px] text-indigo-600 font-medium">Mark all read</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-[13px] text-slate-400 py-4 text-center">No notifications yet.</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="text-[13px] font-semibold text-slate-900">{n.title}</div>
                          <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">{n.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1 text-right">{new Date(n.created_at).toLocaleTimeString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 pl-3 border-l border-slate-100 hover:opacity-80 transition-opacity"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-[12px] flex items-center justify-center">
                  {userInitial}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-[13px] font-semibold text-slate-900 leading-none truncate max-w-[120px]">{fullName || "Investor"}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[120px]">{userEmail}</div>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
