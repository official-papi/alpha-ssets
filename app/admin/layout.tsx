"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert, LayoutDashboard, Users, ArrowDownRight,
  ArrowUpRight, TrendingUp, Share2, FileCheck, Settings,
  ArrowLeft, LogOut, Menu, X, CreditCard, Wallet,
  FileText, Newspaper, Layout, Mail, ShieldCheck, Wrench,
  Search, Bell, Sparkles, Command, Globe, User
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSelector from "@/components/common/LanguageSelector";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { t }     = useLanguage();
  const [ready,      setReady]      = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const verified = useRef(false);

  // Spotlight search states
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [spotlightResults, setSpotlightResults] = useState<any[]>([]);

  // Realtime Toast State
  const [realtimeToast, setRealtimeToast] = useState<{ title: string; desc: string } | null>(null);

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { router.replace("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", user.id).maybeSingle();

      // Check user_metadata.role first (JWT, no RLS dependency),
      // then fall back to the profiles table row.
      const metaRole = user.user_metadata?.role as string | undefined;
      const isAdmin =
        metaRole === "admin" || profile?.role === "admin";

      if (!isAdmin) {
        router.replace("/dashboard");
        return;
      }

      setAdminEmail(user.email ?? "");
      setReady(true);

      // Subscribe to Supabase Realtime changes for Live Notifications
      const depositsChannel = supabase
        .channel("admin-realtime-deposits")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "deposits" },
          (payload: any) => {
            setRealtimeToast({
              title: "New Deposit Request!",
              desc: `Amount: $${payload.new.amount} via ${payload.new.gateway}`,
            });
            setTimeout(() => setRealtimeToast(null), 5000);
          }
        )
        .subscribe();

      const withdrawChannel = supabase
        .channel("admin-realtime-withdraws")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "withdrawals" },
          (payload: any) => {
            setRealtimeToast({
              title: "New Withdrawal Request!",
              desc: `Amount: $${payload.new.amount} via ${payload.new.method_name}`,
            });
            setTimeout(() => setRealtimeToast(null), 5000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(depositsChannel);
        supabase.removeChannel(withdrawChannel);
      };
    })();

  }, [router]);

  // Ctrl+K Spotlight Keybind listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSpotlightSearch = async (q: string) => {
    setSpotlightQuery(q);
    if (!q.trim()) { setSpotlightResults([]); return; }

    const supabase = createClient();
    const { data: users } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(5);

    const formatted = (users || []).map((u: any) => ({
      type: "User Profile",
      title: u.full_name || u.email,
      subtitle: u.email,
      href: "/admin/users",
    }));

    setSpotlightResults(formatted);
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { label: t.admin.dashboard,         href: "/admin",                  icon: LayoutDashboard },
    { label: t.admin.userManagement,   href: "/admin/users",            icon: Users },
    { label: t.admin.depositRequests,  href: "/admin/deposits",         icon: ArrowDownRight },
    { label: t.admin.paymentGateways,  href: "/admin/gateways",         icon: CreditCard },
    { label: t.admin.withdrawRequests, href: "/admin/withdrawals",      icon: ArrowUpRight },
    { label: t.admin.withdrawMethods,  href: "/admin/withdraw-methods", icon: Wallet },
    { label: t.admin.investmentPlans,  href: "/admin/plans",            icon: TrendingUp },
    { label: t.admin.referralLevels,   href: "/admin/referrals",        icon: Share2 },
    { label: t.admin.kycDocuments,     href: "/admin/kyc",              icon: FileCheck },
    { label: t.admin.financialReports, href: "/admin/reports",          icon: FileText },
    { label: t.admin.blogNewsCms,   href: "/admin/blogs",            icon: Newspaper },
    { label: t.admin.landingPageCms,  href: "/admin/cms",              icon: Layout },
    { label: t.admin.emailBroadcast,   href: "/admin/email",            icon: Mail },
    { label: t.admin.staffRoles,     href: "/admin/staff",            icon: ShieldCheck },
    { label: t.admin.systemMaintenance,href: "/admin/maintenance",      icon: Wrench },
    { label: t.admin.systemSettings,   href: "/admin/settings",         icon: Settings },
  ];

  const adminInitial = (adminEmail || "A").charAt(0).toUpperCase();

  if (!ready) {
    return (
      <div className="h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] font-medium text-zinc-500">Verifying admin access…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#fafafa] text-zinc-700 flex flex-col md:flex-row relative">

      {/* Realtime Live Toast Alert */}
      {realtimeToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-zinc-200 rounded-xl p-4 shadow-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center">
            <Bell className="w-4 h-4 text-zinc-900" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-zinc-900">{realtimeToast.title}</div>
            <div className="text-[12px] text-zinc-500 font-mono tabular-nums">{realtimeToast.desc}</div>
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="md:hidden bg-white border-b border-zinc-200 px-4 h-14 flex items-center justify-between sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1 text-[11px] font-bold mr-1">
            <Globe className="w-3.5 h-3.5 text-zinc-900" />
            <span>Site</span>
          </Link>
          <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[14px] font-bold text-zinc-900 tracking-tight">
            Alpha<span className="text-zinc-400">@</span>ssets <span className="text-zinc-400 font-normal">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector variant="compact" />
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ADMIN SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-zinc-200
        flex flex-col flex-shrink-0 transition-transform duration-200
        md:static md:translate-x-0 md:h-screen
        ${mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
      `}>
        {/* Logo Header (Visible on Desktop & Mobile Drawer) */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-zinc-950 tracking-tight leading-none">
                Alpha<span className="text-zinc-400">@</span>ssets
              </div>
              <div className="text-[10px] text-zinc-500 font-medium mt-0.5">{t.admin.adminControlPanel}</div>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-1 text-zinc-400 hover:text-zinc-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const cleanHref = href.split(" ")[0];
            const active = pathname === cleanHref;
            return (
              <Link key={cleanHref} href={cleanHref} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all border-l-2 ${
                  active
                    ? "bg-zinc-100 text-zinc-950 font-semibold border-l-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 border-l-transparent"
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-zinc-950" : "text-zinc-400"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-4 pt-3 border-t border-zinc-200 space-y-1 flex-shrink-0">
          <Link href="/" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors">
            <Globe className="w-4 h-4 text-zinc-700" />
            <span>{t.admin.backToSite}</span>
          </Link>

          <Link href="/dashboard" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
            <span>{t.admin.returnToDashboard}</span>
          </Link>

          <div className="px-3 py-2">
            <div className="text-[13px] font-semibold text-zinc-900 truncate">{adminEmail}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-zinc-500 font-medium">{t.admin.administrator}</span>
            </div>
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>{t.dashboard.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main content panel */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">

        {/* Top Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 h-14 bg-white border-b border-zinc-200 flex-shrink-0 z-40">
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hm-btn hm-btn-secondary text-[12px] py-1.5 px-3"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-700" />
              <span>{t.admin.backToSite}</span>
            </Link>
            <button
              onClick={() => setSpotlightOpen(true)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-400 hover:border-zinc-400 text-[13px] transition-all w-72 justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>{t.admin.searchPlaceholder}</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-200 text-zinc-500 rounded text-[10px] font-mono">Ctrl K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector variant="default" />

            <div className="flex items-center gap-1.5 text-[12px] text-zinc-700 font-medium bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t.admin.systemLive}</span>
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200">
              <div className="w-7 h-7 rounded-full bg-zinc-950 text-white font-bold text-[12px] flex items-center justify-center">
                {adminInitial}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[13px] font-semibold text-zinc-900 leading-tight">{t.admin.administrator}</div>
                <div className="text-[11px] text-zinc-400 truncate max-w-[120px]">{adminEmail}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Spotlight Command Modal */}
      {spotlightOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center gap-3">
              <Search className="w-4.5 h-4.5 text-zinc-700" />
              <input
                type="text"
                autoFocus
                value={spotlightQuery}
                onChange={(e) => handleSpotlightSearch(e.target.value)}
                placeholder="Search investor email, name, or page…"
                className="flex-1 text-[14px] text-zinc-900 focus:outline-none placeholder-zinc-400"
              />
              <button onClick={() => setSpotlightOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
              {!spotlightQuery ? (
                <div className="text-[13px] text-zinc-400 text-center py-6">Type to search investors, transactions…</div>
              ) : spotlightResults.length === 0 ? (
                <div className="text-[13px] text-zinc-400 text-center py-6">No results found.</div>
              ) : (
                spotlightResults.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    onClick={() => setSpotlightOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 border border-zinc-100 transition-colors"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-zinc-900">{r.title}</div>
                      <div className="text-[12px] text-zinc-400 font-mono">{r.subtitle}</div>
                    </div>
                    <span className="hm-badge hm-badge-brand text-[10px]">{r.type}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
