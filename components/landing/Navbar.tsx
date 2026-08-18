"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, ArrowRight, Menu, X, LayoutDashboard, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
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
    { label: "Home",         href: "/" },
    { label: "About",        href: "/about" },
    { label: "Plans",        href: "/plans" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQ",          href: "/faq" },
    { label: "Contact",      href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">
            Alpha<span className="text-indigo-600">@</span>ssets
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
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {authLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : user ? (
            /* ── Logged In ── */
            <Link
              href="/dashboard"
              className="hm-btn hm-btn-primary text-[13px] px-4 py-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Dashboard
            </Link>
          ) : (
            /* ── Guest ── */
            <>
              <Link href="/login" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link
                href="/register"
                className="hm-btn hm-btn-primary text-[13px] px-4 py-2"
              >
                Open Account
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 px-3 text-[14px] font-medium rounded-lg ${
                pathname === item.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2 border-t border-slate-100 mt-2">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex-1 hm-btn hm-btn-primary py-2.5 text-[13px] text-center justify-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-all">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="flex-1 hm-btn hm-btn-primary py-2.5 text-[13px] text-center justify-center">
                  Open Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
