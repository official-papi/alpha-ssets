"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2, Lock, Mail, User, Share2, ArrowRight, AlertCircle,
  CheckCircle2, Loader2, Eye, EyeOff, TrendingUp, ShieldCheck, Zap
} from "lucide-react";
import Image from "next/image";

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
        <label htmlFor="fullName" className="block text-[11px] font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Full Name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input id="fullName" type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className={inputCls} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-[11px] font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="investor@example.com" className={inputCls} />
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="block text-[11px] font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input id="password" type={showPw ? "text" : "password"} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              className="hm-input hm-input-with-icon-left hm-input-with-icon-right" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-[11px] font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">Confirm</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input id="confirm" type="password" required value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Referral */}
      <div>
        <label htmlFor="referralCode" className="block text-[11px] font-semibold text-zinc-700 mb-1.5 uppercase tracking-wider">
          Referral Code <span className="text-zinc-400 normal-case font-normal text-[11px]">(optional)</span>
        </label>
        <div className="relative">
          <Share2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input id="referralCode" type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="e.g. ALPHA789" className={inputCls} />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="hm-btn hm-btn-primary w-full py-3 text-xs mt-2 cursor-pointer font-medium">
        {loading ? (
          <><Loader2 className="w-4.5 h-4.5 animate-spin" /><span>Creating Account…</span></>
        ) : (
          <><span>Create Investor Account</span><ArrowRight className="w-4.5 h-4.5" /></>
        )}
      </button>

      <div className="pt-4 border-t border-zinc-200 text-center">
        <p className="text-xs text-zinc-500 font-normal">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-zinc-950 hover:underline transition-colors">Sign In Here</Link>
        </p>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-[42%] bg-[#001011] flex-col justify-between p-12 relative overflow-hidden border-r border-[#093A3E]/40">
        
        {/* Ambient fintech geometric artwork */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <Image
            src="/images/auth-bg.jpg"
            alt="Fintech telemetry background"
            fill
            priority
            className="object-cover object-center opacity-55 filter contrast-115 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001011] via-[#001011]/80 to-[#001011]/50" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(#093A3E_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/30 flex items-center justify-center text-[#3AAFB9]">
            <BarChart2 className="w-4.5 h-4.5" />
          </div>
          <span className="text-[18px] font-bold text-white tracking-tight">
            Alpha<span className="text-[#3AAFB9]">@</span>ssets
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Start Building<br />Your Yield<br />Portfolio Today.
            </h2>
            <p className="text-zinc-400 text-sm mt-4 leading-relaxed font-normal">
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
                <div className="w-7 h-7 rounded-lg bg-[#093A3E]/30 border border-[#093A3E]/50 flex items-center justify-center flex-shrink-0 text-[#3AAFB9]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-zinc-300 text-xs font-normal">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-zinc-850">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Regulated platform · 124,500+ active investors</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#fafafa] overflow-y-auto">
        <div className="w-full max-w-[420px]">

          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#093A3E] flex items-center justify-center text-[#3AAFB9]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-[16px] font-bold tracking-tight text-zinc-950">
              Alpha<span className="text-[#3AAFB9]">@</span>ssets
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Create your account</h1>
            <p className="text-zinc-500 text-xs mt-1.5 font-normal">Start building your automated yield portfolio</p>
          </div>

          <Suspense fallback={
            <div className="flex justify-center items-center py-12 text-zinc-400">
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
