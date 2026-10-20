"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, ArrowRight, Menu, X, LayoutDashboard, Loader2, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get current session on mount
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      setUser(data?.session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: t.nav.home,         href: "/" },
    { label: t.nav.about,        href: "/about" },
    { label: t.nav.plans,        href: "/plans" },
    { label: t.nav.howItWorks,   href: "/how-it-works" },
    { label: t.nav.faq,          href: "/faq" },
    { label: t.nav.contact,      href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#d4e7e9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#093A3E] flex items-center justify-center shadow-xs">
            <BarChart2 className="w-4 h-4 text-[#3AAFB9]" />
          </div>
          <span className="text-[16px] font-extrabold tracking-tight text-[#001011]">
            Alpha<span className="text-[#3AAFB9]">@</span>ssets
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-medium transition-colors ${
                pathname === item.href
                  ? "text-zinc-950 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs & Language Selector */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSelector variant="default" />

          {authLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : user ? (
            /* ── Logged In ── */
            <Link
              href="/dashboard"
              className="hm-btn hm-btn-primary text-[13px] px-4 py-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t.nav.myDashboard}
            </Link>
          ) : (
            /* ── Guest ── */
            <>
              <Link href="/login" className="text-[13px] font-medium text-zinc-600 hover:text-zinc-950 transition-colors px-3 py-2">
                {t.nav.signIn}
              </Link>
              <Link
                href="/register"
                className="hm-btn hm-btn-primary text-[13px] px-4 py-2"
              >
                {t.nav.openAccount}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions: Language + Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector variant="compact" />
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-zinc-200/70 px-4 py-4 space-y-1 shadow-lg">
          {pathname !== "/" && (
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 px-3 text-[13px] font-semibold text-zinc-900 bg-zinc-100 rounded-lg mb-2 border border-zinc-200"
            >
              <Home className="w-4 h-4 text-zinc-700" />
              <span>← {t.nav.backToSite}</span>
            </Link>
          )}

          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 px-3 text-[14px] font-medium rounded-lg ${
                pathname === item.href
                  ? "bg-zinc-100 text-zinc-950 font-semibold"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2 border-t border-zinc-100 mt-2">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 hm-btn hm-btn-primary py-2.5 text-[13px] text-center justify-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.nav.myDashboard}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-zinc-200 text-[13px] font-medium text-zinc-800 hover:bg-zinc-50 transition-all">
                  {t.nav.signIn}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="flex-1 hm-btn hm-btn-primary py-2.5 text-[13px] text-center justify-center">
                  {t.nav.openAccount}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
