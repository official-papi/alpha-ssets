"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Lock, Mail, User, Share2, ArrowRight, AlertCircle,
  CheckCircle2, Loader2, Eye, EyeOff, TrendingUp, ShieldCheck, Zap
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode,    setReferralCode]    = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }

    const { data, error: signUpError } = await createClient().auth.signUp({
      email, password,
      options: { data: { full_name: fullName, referred_by_code: referralCode || null } },
    });

    if (signUpError) {
      setError(signUpError.message); setLoading(false);
    } else if (data.session) {
      setSuccess("Account created! Redirecting to your dashboard…");
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1200);
    } else {
      setSuccess("Registration successful! Check your email to verify your account.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[8px] p-3.5 flex items-start gap-2.5 text-red-600 text-xs font-normal">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[8px] p-3.5 flex items-start gap-2.5 text-emerald-800 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-[11px] font-bold text-[#20281f] uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8573] pointer-events-none" />
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-[#e4e7dc] bg-white text-[#20281f] text-sm placeholder:text-[#9ea697] focus:outline-hidden focus:border-[#20281f] focus:ring-1 focus:ring-[#20281f] transition-colors"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-[11px] font-bold text-[#20281f] uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8573] pointer-events-none" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="investor@example.com"
            className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-[#e4e7dc] bg-white text-[#20281f] text-sm placeholder:text-[#9ea697] focus:outline-hidden focus:border-[#20281f] focus:ring-1 focus:ring-[#20281f] transition-colors"
          />
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="block text-[11px] font-bold text-[#20281f] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8573] pointer-events-none" />
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full h-11 pl-10 pr-9 rounded-[8px] border border-[#e4e7dc] bg-white text-[#20281f] text-sm placeholder:text-[#9ea697] focus:outline-hidden focus:border-[#20281f] focus:ring-1 focus:ring-[#20281f] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8573] hover:text-[#20281f] cursor-pointer"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-[11px] font-bold text-[#20281f] uppercase tracking-wider mb-1.5">
            Confirm
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8573] pointer-events-none" />
            <input
              id="confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-[#e4e7dc] bg-white text-[#20281f] text-sm placeholder:text-[#9ea697] focus:outline-hidden focus:border-[#20281f] focus:ring-1 focus:ring-[#20281f] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Referral */}
      <div>
        <label htmlFor="referralCode" className="block text-[11px] font-bold text-[#20281f] uppercase tracking-wider mb-1.5">
          Referral Code <span className="text-[#7d8573] normal-case font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Share2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8573] pointer-events-none" />
          <input
            id="referralCode"
            type="text"
            value={referralCode}
            onChange={e => setReferralCode(e.target.value)}
            placeholder="e.g. ALPHA789"
            className="w-full h-11 pl-10 pr-3.5 rounded-[8px] border border-[#e4e7dc] bg-white text-[#20281f] text-sm placeholder:text-[#9ea697] focus:outline-hidden focus:border-[#20281f] focus:ring-1 focus:ring-[#20281f] transition-colors font-mono"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#d1f18b]" />
            <span>Creating Account…</span>
          </>
        ) : (
          <>
            <span>Create Investor Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Sign in redirect */}
      <div className="pt-6 border-t border-[#e4e7dc] text-center">
        <p className="text-sm text-[#60695b] font-normal">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#20281f] hover:underline transition-colors no-underline">
            Sign in here <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>

    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-[#fafaf5] text-[#20281f]">

      {/* ── Left Brand Showcase Panel (Stelsuite Dark Band) ── */}
      <div className="hidden lg:flex w-[44%] bg-[#20281f] text-white flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Subtle radial glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#d1f18b]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#86a951]/10 blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 text-white no-underline group">
            <span
              className="grid h-[36px] w-[36px] place-items-center rounded-[10px] bg-[#fafaf5] text-[#20281f] shadow-xs group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <svg width="21" height="21" viewBox="0 0 32 32">
                <circle cx="16" cy="9" r="4" fill="currentColor" />
                <circle cx="22.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.75" />
                <circle cx="9.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.5" />
              </svg>
            </span>
            <span className="whitespace-nowrap text-[23px] font-bold tracking-[-1.1px]">
              Alpha<span className="font-normal opacity-90">assets</span><span className="font-black text-[#d1f18b]">.</span>
            </span>
          </Link>
        </div>

        {/* Center Pitch */}
        <div className="relative z-10 space-y-8 my-auto py-12">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#d1f18b] mb-4">
              <span>✳</span>
              <span>Open Self-Custodial Vault</span>
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-[1.08] tracking-[-0.03em]">
              Start building<br />
              your yield portfolio<br />
              in 60 seconds.
            </h2>
            <p className="text-[#a4aca0] text-sm mt-4 leading-relaxed font-normal max-w-md">
              Create an account to unlock collateralized loans, Plan A & B automated yields, and the American Trust Fund (ATFC) sovereign escrow.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { icon: TrendingUp,  label: "Plan A (5.0%) & Plan B (8.5%) return tiers" },
              { icon: ShieldCheck, label: "AI crash shield & 24/7 liquidity protection" },
              { icon: Zap,         label: "3-tier affiliate earnings (5% · 3% · 1%)" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-[7px] bg-white/10 flex items-center justify-center flex-shrink-0 text-[#d1f18b]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-[#d8ded4]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#a4aca0]">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#86a951] animate-pulse" />
            124,500+ Active Investor Vaults
          </span>
          <span className="font-mono text-[11px] opacity-75">Cold Storage</span>
        </div>
      </div>

      {/* ── Right Form Container ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Mobile brand header */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden no-underline">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#20281f] text-[#d1f18b]">
              <svg width="20" height="20" viewBox="0 0 32 32">
                <circle cx="16" cy="9" r="4" fill="currentColor" />
                <circle cx="22.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.75" />
                <circle cx="9.5" cy="20.5" r="4" fill="currentColor" fillOpacity="0.5" />
              </svg>
            </span>
            <span className="text-[20px] font-bold tracking-tight text-[#20281f]">
              Alpha<span className="font-normal">assets</span><span className="text-[#81ab41]">.</span>
            </span>
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#20281f] tracking-tight">
              Create investor account
            </h1>
            <p className="text-[#60695b] text-sm mt-1.5 font-normal">
              Join thousands of investors earning automated daily yields
            </p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center items-center py-12 text-[#60695b]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
            </div>
          }>
            <RegisterForm />
          </Suspense>

        </div>
      </div>

    </div>
  );
}
