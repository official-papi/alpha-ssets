"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2, Lock, Mail, ArrowRight, AlertCircle, Loader2,
  Eye, EyeOff, TrendingUp, ShieldCheck, Zap
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-[45%] bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[20px] font-bold text-white tracking-tight">
            Alpha<span className="text-indigo-200">@</span>ssets
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-snug tracking-tight">
              Invest Smarter.<br />Earn Daily.<br />Withdraw Freely.
            </h2>
            <p className="text-indigo-200 text-[15px] mt-4 leading-relaxed">
              Join 124,500+ investors earning automated daily returns through our structured yield platform.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: TrendingUp,  label: "Up to 5% daily ROI on investments" },
              { icon: ShieldCheck, label: "256-bit SSL encrypted transactions" },
              { icon: Zap,         label: "Instant crypto & bank withdrawals" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-indigo-100 text-[14px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust */}
        <div className="relative z-10 pt-8 border-t border-white/20">
          <div className="flex items-center gap-2 text-indigo-200 text-[12px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regulated platform · Ledger audited · Cold storage custody</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#f8fafc]">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              Alpha<span className="text-indigo-600">@</span>ssets
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-[14px] mt-1.5">Sign in to your investor portal</p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-red-600 text-[13px] font-medium">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="investor@example.com"
                  className="hm-input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-[12px] text-indigo-600 hover:text-indigo-500 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password" type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="hm-input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="hm-btn hm-btn-primary w-full py-3.5 text-[14px] mt-2 cursor-pointer">
              {loading ? (
                <><Loader2 className="w-4.5 h-4.5 animate-spin" /><span>Signing in…</span></>
              ) : (
                <><span>Sign In to Account</span><ArrowRight className="w-4.5 h-4.5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-[13px] text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
