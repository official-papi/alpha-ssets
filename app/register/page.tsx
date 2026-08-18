"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2, Lock, Mail, User, Share2, ArrowRight, AlertCircle,
  CheckCircle2, Loader2, Eye, EyeOff, TrendingUp, ShieldCheck, Zap
} from "lucide-react";

const inputCls = "hm-input hm-input-with-icon-left";

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
      setSuccess("Account created! Redirecting…");
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
    } else {
      setSuccess("Registration successful! Check your email to verify your account.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-2.5 text-red-600 text-[13px] font-medium">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-emerald-700 text-[13px] font-medium">
          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" /><span>{success}</span>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">Full Name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input id="fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className={inputCls} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="investor@example.com" className={inputCls} />
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input id="password" type={showPw ? "text" : "password"} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              className="hm-input hm-input-with-icon-left hm-input-with-icon-right" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">Confirm</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input id="confirm" type="password" required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Referral */}
      <div>
        <label htmlFor="referralCode" className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-widest">
          Referral Code <span className="text-slate-400 normal-case font-normal text-[11px]">(optional)</span>
        </label>
        <div className="relative">
          <Share2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input id="referralCode" type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="e.g. ALPHA789" className={inputCls} />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="hm-btn hm-btn-primary w-full py-3.5 text-[14px] mt-2 cursor-pointer">
        {loading ? (
          <><Loader2 className="w-4.5 h-4.5 animate-spin" /><span>Creating Account…</span></>
        ) : (
          <><span>Create Investor Account</span><ArrowRight className="w-4.5 h-4.5" /></>
        )}
      </button>

      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-[13px] text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Sign In Here</Link>
        </p>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-[42%] bg-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[20px] font-bold text-white tracking-tight">
            Alpha<span className="text-indigo-200">@</span>ssets
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-snug tracking-tight">
              Start Building<br />Your Yield<br />Portfolio Today.
            </h2>
            <p className="text-indigo-200 text-[15px] mt-4 leading-relaxed">
              Open your account in 60 seconds and start earning automated daily returns.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: TrendingUp,  label: "Up to 5% daily ROI on all plans" },
              { icon: ShieldCheck, label: "Bank-grade security & encryption" },
              { icon: Zap,         label: "Instant payouts to any wallet" },
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

        <div className="relative z-10 pt-8 border-t border-white/20">
          <div className="flex items-center gap-2 text-indigo-200 text-[12px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Regulated platform · 124,500+ active investors</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-[460px]">

          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900">
              Alpha<span className="text-indigo-600">@</span>ssets
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500 text-[14px] mt-1.5">Start building your automated yield portfolio</p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center items-center py-12 text-slate-400">
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
