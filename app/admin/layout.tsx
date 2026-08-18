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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
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
    { label: "Dashboard",         href: "/admin",                  icon: LayoutDashboard },
    { label: "User Management",   href: "/admin/users",            icon: Users },
    { label: "Deposit Requests",  href: "/admin/deposits",         icon: ArrowDownRight },
    { label: "Payment Gateways",  href: "/admin/gateways",         icon: CreditCard },
    { label: "Withdraw Requests", href: "/admin/withdrawals",      icon: ArrowUpRight },
    { label: "Withdraw Methods",  href: "/admin/withdraw-methods", icon: Wallet },
    { label: "Investment Plans",  href: "/admin/plans",            icon: TrendingUp },
    { label: "Referral Levels",   href: "/admin/referrals",        icon: Share2 },
    { label: "KYC Documents",     href: "/admin/kyc",              icon: FileCheck },
    { label: "Financial Reports", href: "/admin/reports",          icon: FileText },
    { label: "Blog & News CMS",   href: "/admin/blogs",            icon: Newspaper },
    { label: "Landing Page CMS",  href: "/admin/cms",              icon: Layout },
    { label: "Email Broadcast",   href: "/admin/email",            icon: Mail },
    { label: "Staff & Roles",     href: "/admin/staff",            icon: ShieldCheck },
    { label: "System Maintenance",href: "/admin/maintenance",      icon: Wrench },
    { label: "System Settings",   href: "/admin/settings",         icon: Settings },
  ];

  const adminInitial = (adminEmail || "A").charAt(0).toUpperCase();

  if (!ready) {
    return (
      <div className="h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] font-semibold text-slate-500">Verifying admin access…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] text-slate-700 flex flex-col md:flex-row relative">

      {/* Realtime Live Toast Alert */}
      {realtimeToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 rounded-xl p-4 shadow-xl flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">{realtimeToast.title}</div>
            <div className="text-[12px] text-slate-400 font-mono">{realtimeToast.desc}</div>
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="md:hidden bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">
            Alpha<span className="text-indigo-600">@</span>ssets <span className="text-slate-400 font-medium">Admin</span>
          </span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ADMIN SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100
        flex flex-col flex-shrink-0 transition-transform duration-200
        md:static md:translate-x-0 md:h-screen
        ${mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="hidden md:flex items-center gap-2.5 px-5 h-14 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">
              Alpha<span className="text-indigo-600">@</span>ssets
            </div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Admin Control Panel</div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const cleanHref = href.split(" ")[0];
            const active = pathname === cleanHref;
            return (
              <Link key={cleanHref} href={cleanHref} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all border-l-[3px] ${
                  active
                    ? "bg-indigo-50 text-indigo-700 font-semibold border-l-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent"
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-1 flex-shrink-0">
          <Link href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-indigo-500" />
            <span>Return to User View</span>
          </Link>

          <div className="px-3 py-2">
            <div className="text-[13px] font-semibold text-slate-900 truncate">{adminEmail}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] text-amber-600 font-semibold">Administrator</span>
            </div>
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content panel */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">

        {/* Top Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 h-14 bg-white border-b border-slate-100 flex-shrink-0 z-40">
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hm-btn hm-btn-secondary text-[12px] py-1.5 px-3"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>Back to Site</span>
            </Link>
            <button
              onClick={() => setSpotlightOpen(true)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:border-indigo-500 text-[13px] transition-all w-72 justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Search investors, transactions…</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-mono">Ctrl K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>System Live</span>
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-[12px] flex items-center justify-center">
                {adminInitial}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[13px] font-semibold text-slate-900 leading-tight">Administrator</div>
                <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{adminEmail}</div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-4.5 h-4.5 text-indigo-600" />
              <input
                type="text"
                autoFocus
                value={spotlightQuery}
                onChange={(e) => handleSpotlightSearch(e.target.value)}
                placeholder="Search investor email, name, or page…"
                className="flex-1 text-[14px] text-slate-900 focus:outline-none placeholder-slate-400"
              />
              <button onClick={() => setSpotlightOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
              {!spotlightQuery ? (
                <div className="text-[13px] text-slate-400 text-center py-6">Type to search investors, transactions…</div>
              ) : spotlightResults.length === 0 ? (
                <div className="text-[13px] text-slate-400 text-center py-6">No results found.</div>
              ) : (
                spotlightResults.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    onClick={() => setSpotlightOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{r.title}</div>
                      <div className="text-[12px] text-slate-400 font-mono">{r.subtitle}</div>
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
