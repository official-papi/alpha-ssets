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
      <div className="space-y-6 text-[#20281f]">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20281f]">Multi-Tier Referral Network</h1>
          <p className="text-xs sm:text-sm text-[#60695b] mt-1">Earn 5% Level 1, 3% Level 2, and 1% Level 3 downline commissions automatically.</p>
        </div>

        {/* Copy Referral Link Box */}
        <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-6 max-w-3xl shadow-2xs">
          <label className="block text-xs font-bold text-[#20281f] uppercase tracking-wider mb-2">
            Your Unique Referral Partner Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="bg-[#fafaf5] border border-[#e4e7dc] rounded-[8px] flex-1 px-4 py-2.5 text-xs font-mono font-bold text-[#20281f] select-all focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[42px] px-5 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            >
              {copied ? <Check className="w-4 h-4 text-[#d1f18b]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy URL"}</span>
            </button>
          </div>
        </div>

        {/* Commission Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-5 shadow-2xs">
            <div className="text-[11px] font-bold text-[#476b1b] uppercase">Level 1 Commission</div>
            <div className="text-2xl font-bold font-mono text-[#20281f] mt-1">5.0%</div>
            <div className="text-[10px] text-[#7d8573] mt-1">Direct Introduced Investors</div>
          </div>
          <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-5 shadow-2xs">
            <div className="text-[11px] font-bold text-[#60695b] uppercase">Level 2 Commission</div>
            <div className="text-2xl font-bold font-mono text-[#20281f] mt-1">3.0%</div>
            <div className="text-[10px] text-[#7d8573] mt-1">Secondary Downline</div>
          </div>
          <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-5 shadow-2xs">
            <div className="text-[11px] font-bold text-[#60695b] uppercase">Level 3 Commission</div>
            <div className="text-2xl font-bold font-mono text-[#20281f] mt-1">1.0%</div>
            <div className="text-[10px] text-[#7d8573] mt-1">Tertiary Downline</div>
          </div>
        </div>

        {/* Downline Tree Table */}
        <div className="bg-white border border-[#e4e7dc] rounded-[10px] p-6 max-w-3xl shadow-2xs">
          <h3 className="text-sm font-bold text-[#20281f] mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#86a951]" />
            <span>Direct Downline Partners ({referralTree.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e4e7dc] text-[#7d8573] uppercase text-[10px] font-mono tracking-wider">
                  <th className="pb-3">Investor Name</th>
                  <th className="pb-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2eb]">
                {referralTree.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-[#7d8573] text-xs font-medium">
                      No referred investors found yet. Share your partner link to start building your network.
                    </td>
                  </tr>
                ) : (
                  referralTree.map((ref) => (
                    <tr key={ref.id} className="hover:bg-[#fafaf5] transition-colors">
                      <td className="py-3 font-bold text-[#20281f]">{ref.full_name || "Investor Partner"}</td>
                      <td className="py-3 text-[#7d8573] text-[11px] font-mono">{new Date(ref.created_at).toLocaleDateString()}</td>
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
