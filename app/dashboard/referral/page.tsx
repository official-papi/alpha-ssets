"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Users, Copy, Check, Share2, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActiveUser } from "@/lib/auth/activeUser";

export default function ReferralPage() {
  const [userEmail, setUserEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referralTree, setReferralTree] = useState<any[]>([]);

  const fetchReferralData = async () => {
    const supabase = createClient();
    const activeUser = await getActiveUser(supabase);
    if (activeUser) {
      setUserEmail(activeUser.email);
      const { data: profile } = await supabase.from("profiles").select("referral_code").eq("id", activeUser.id).single();
      if (profile) setRefCode(profile.referral_code || "");

      // Query level 1 referrals
      const { data: refs } = await supabase.from("profiles").select("id, full_name, created_at").eq("referred_by", activeUser.id);
      if (refs) setReferralTree(refs);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${refCode}` : `?ref=${refCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-6">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Multi-Tier Referral Network</h1>
          <p className="text-xs text-slate-500 mt-1">Earn 5% Level 1, 3% Level 2, and 1% Level 3 downline commissions.</p>
        </div>

        {/* Copy Referral Link Box */}
        <div className="minimal-card p-6 border-slate-200 max-w-3xl">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Your Unique Referral Partner Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="bg-slate-50 border border-slate-200 rounded-xl flex-1 px-4 py-2.5 text-xs font-mono font-bold text-indigo-600 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="minimal-btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/15"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy URL"}</span>
            </button>
          </div>
        </div>

        {/* Commission Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <div className="minimal-card p-5 border-slate-200">
            <div className="text-[11px] font-bold text-indigo-600 uppercase">Level 1 Commission</div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">5%</div>
            <div className="text-[10px] text-slate-500 mt-1">Direct Introduced Investors</div>
          </div>
          <div className="minimal-card p-5 border-slate-200">
            <div className="text-[11px] font-bold text-indigo-600 uppercase">Level 2 Commission</div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">3%</div>
            <div className="text-[10px] text-slate-500 mt-1">Secondary Downline</div>
          </div>
          <div className="minimal-card p-5 border-slate-200">
            <div className="text-[11px] font-bold text-indigo-600 uppercase">Level 3 Commission</div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">1%</div>
            <div className="text-[10px] text-slate-500 mt-1">Tertiary Downline</div>
          </div>
        </div>

        {/* Downline Tree Table */}
        <div className="minimal-card p-6 border-slate-200 max-w-3xl">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Direct Downline Partners ({referralTree.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Investor Name</th>
                  <th className="pb-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referralTree.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-slate-400 text-xs font-medium">
                      No referred investors found yet. Share your partner link to start building your network.
                    </td>
                  </tr>
                ) : (
                  referralTree.map((ref) => (
                    <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-extrabold text-slate-900">{ref.full_name || "Investor Partner"}</td>
                      <td className="py-3 text-slate-500 text-[11px]">{new Date(ref.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
