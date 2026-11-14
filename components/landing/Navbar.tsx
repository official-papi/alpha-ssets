"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, LayoutDashboard, Loader2, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import LanguageSelector from "@/components/common/LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Monitor auth state
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      setUser(data?.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor scroll for subtle elevation shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Primary desktop navigation: exactly 4 core offerings matching PromptSip / Stelsuite
  const navItems = [
    { label: "Services",      href: "/#services" },
    { label: "AI Management", href: "/#ai-management" },
    { label: "ATFC Vault",    href: "/#atfc-deposit" },
    { label: "Affiliate",     href: "/#referral" },
  ];

  // Extended links for mobile drawer
  const mobileNavItems = [
    ...navItems,
    { label: t.nav.howItWorks, href: "/how-it-works" },
    { label: t.nav.about,      href: "/about" },
    { label: t.nav.faq,        href: "/faq" },
  ];

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      const targetId = href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-[#fafaf5]/92 backdrop-blur-md border-b border-[#e4e7dc] transition-shadow duration-200 ${
          scrolled ? "shadow-[0_2px_12px_rgba(32,40,31,0.06)]" : ""
        }`}
      >
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">

          {/* ── Brand Logo (Stelsuite 3-node signature constellation) ── */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 text-[#20281f] no-underline group shrink-0"
            aria-label="Alphaassets Home"
          >
            <span
              className="grid h-[35px] w-[35px] place-items-center rounded-[10px] bg-[#20281f] text-[#d1f18b] shadow-2xs group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg width="21" height="21" viewBox="0 0 32 32">
                <circle cx="16" cy="9" r="4" fill="currentColor" />
                <circle cx="22.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.75" />
                <circle cx="9.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.5" />
              </svg>
            </span>
            <span className="whitespace-nowrap text-[23px] sm:text-[24px] font-bold tracking-[-1.1px]">
              Alpha<span className="font-normal">assets</span><span className="font-black text-[#81ab41]">.</span>
            </span>
          </Link>

          {/* ── Desktop Navigation Links (Spacious, uncrowded, single-line) ── */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[15px] font-medium transition-colors no-underline ${
                    isActive
                      ? "text-[#20281f] font-semibold bg-[#e4e7dc]"
                      : "text-[#60695b] hover:text-[#20281f] hover:bg-[#e4e7dc]/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop Right Actions (Sign In & Open Account) ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {authLoading ? (
              <div className="min-h-[38px] px-4 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-[#60695b]" />
              </div>
            ) : user ? (
              /* Signed In User */
              <Link
                href="/dashboard"
                className="min-h-[38px] px-4 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer no-underline"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#d1f18b]" />
                <span>{t.nav.myDashboard}</span>
              </Link>
            ) : (
              /* Guest User: Minimalist Sign In + Solid Ink CTA */
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-[14px] font-semibold text-[#20281f] hover:text-[#60695b] transition-colors px-3 py-1.5 no-underline whitespace-nowrap"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/register"
                  className="min-h-[38px] px-4 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-[13.5px] font-bold inline-flex items-center gap-1.5 transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer no-underline whitespace-nowrap"
                >
                  <span>{t.nav.openAccount}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Toggle Mobile Navigation"
              className="min-h-[36px] px-3.5 rounded-[7px] border border-[#20281f33] text-[13px] font-semibold text-[#20281f] bg-transparent hover:bg-[#f0f1e8] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {open ? <X className="w-4 h-4 text-[#20281f]" /> : <Menu className="w-4 h-4 text-[#20281f]" />}
              <span>{open ? "Close" : "Menu"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── Mobile Drawer & Backdrop ── */}
      {open && (
        <div className="fixed inset-0 top-20 z-40 md:hidden flex flex-col">
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-20 bg-black/25 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <div
            ref={drawerRef}
            id="mobile-nav"
            className="relative z-50 bg-[#fafaf5] border-b border-[#e4e7dc] px-5 py-6 space-y-5 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
          >
            {/* Status Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e4e7dc]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#86a951] animate-pulse" />
                <span className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#60695b]">
                  Alphaassets AI Rails
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#f4f7ec] text-[#627446] border border-[#dfe6d2]">
                <ShieldCheck className="w-3 h-3 text-[#86a951]" />
                Audited
              </span>
            </div>

            {/* Links List */}
            <nav className="flex flex-col space-y-1">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`px-4 py-3 rounded-[8px] text-[15px] font-medium transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-[#e4e7dc] text-[#20281f] font-bold"
                        : "text-[#475043] hover:bg-[#e4e7dc]/60 hover:text-[#20281f]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile CTAs & Auth */}
            <div className="pt-4 border-t border-[#e4e7dc] flex flex-col gap-2.5">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="w-full min-h-[44px] rounded-[7px] bg-[#20281f] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-transform"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#d1f18b]" />
                  <span>{t.nav.myDashboard}</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full min-h-[42px] rounded-[7px] border border-[#20281f33] text-center text-[13.5px] font-semibold text-[#20281f] hover:bg-[#e4e7dc] flex items-center justify-center transition-colors"
                  >
                    {t.nav.signIn}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="w-full min-h-[44px] rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-center text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-transform"
                  >
                    <span>{t.nav.openAccount}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Language Selector */}
            <div className="pt-3 border-t border-[#e4e7dc] flex items-center justify-between">
              <span className="text-xs font-medium text-[#60695b]">Language</span>
              <LanguageSelector variant="default" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
