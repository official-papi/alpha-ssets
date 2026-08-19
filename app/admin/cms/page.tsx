"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Layout, Save, CheckCircle2, AlertCircle, Plus, Trash2, Edit2, Globe, HelpCircle, MessageSquare, Shield, PhoneCall, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "how_it_works" | "features" | "testimonials" | "faq" | "contact" | "legal">("hero");

  // CMS Content States
  const [cmsData, setCmsData] = useState<any>({
    hero_badge: "NEXT-GEN QUANTUM YIELD",
    hero_title: "Automated AI Crypto & Institutional Asset Platform",
    hero_subtitle: "Experience institutional-grade automated AI trading strategies, transparent weekly compound yields, and instant liquidity withdrawals.",
    hero_cta: "Explore Yield Plans",
    
    about_title: "Engineered for Institutional Growth",
    about_text: "Alpha Assets leverages AI multi-exchange arbitrage, automated liquidity farming, and high-frequency quantitative models to generate weekly risk-managed returns.",
    about_metric1: "$256M+ Assets Managed",
    about_metric2: "99.98% Payout Accuracy",

    how_it_works: [
      { step: 1, title: "Create Investor Account", desc: "Sign up in under 60 seconds with instant email activation." },
      { step: 2, title: "Select Yield Package", desc: "Choose your preferred weekly return plan and fund your wallet." },
      { step: 3, title: "Earn & Withdraw Yields", desc: "Collect automated weekly ROI interest payouts directly to your wallet." },
    ],

    features: [
      { id: 1, title: "Cold Storage Security", desc: "Multi-signature hardware vaults protecting investor funds." },
      { id: 2, title: "Automated Liquidity", desc: "Instant crypto & fiat withdrawal processing channels." },
      { id: 3, title: "Multi-Tier Referrals", desc: "Earn up to 5% downline commissions across 3 network tiers." },
    ],

    testimonials: [
      { id: 1, name: "Marcus Vance", role: "Crypto Asset Manager", review: "Alpha Assets has consistently delivered reliable weekly yields. The automated payout execution is flawless.", rating: 5 },
      { id: 2, name: "Elena Rostova", role: "Private Investor", review: "The platform transparency and instant withdrawal processing give me complete confidence.", rating: 5 },
    ],

    faqs: [
      { id: 1, question: "What is the minimum deposit amount?", answer: "The minimum deposit to start investing is $500 via USDT, Bitcoin, or Bank Wire." },
      { id: 2, question: "How often are interest yields credited?", answer: "Interest returns are credited automatically based on your selected plan interval (weekly)." },
      { id: 3, question: "Are withdrawals processed instantly?", answer: "Yes, approved withdrawal requests are dispatched instantly via automated payment gateways." },
    ],

    support_email: "support@alpha-assets.com",
    support_phone: "+1 (800) 555-ALPHA",
    support_address: "75 Wall Street, Financial District, New York, NY 10005",
    telegram_handle: "@alphaassets_official",
    twitter_handle: "@alphaassets_io",
    discord_link: "https://discord.gg/alphaassets",

    privacy_policy: "Alpha Assets is committed to preserving strict data confidentiality and multi-layer encryption for all investor information...",
    terms_of_service: "By accessing and registering an investor account on Alpha Assets, you agree to comply with all platform terms...",
  });

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchCmsContent();
  }, []);

  const fetchCmsContent = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("system_settings").select("*").single();
    if (data?.meta) {
      setCmsData((prev: any) => ({
        ...prev,
        ...data.meta,
      }));
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    const supabase = createClient();
    const { data: existing } = await supabase.from("system_settings").select("*").single();

    const updatedMeta = {
      ...(existing?.meta || {}),
      ...cmsData,
    };

    const { error } = await supabase
      .from("system_settings")
      .update({ meta: updatedMeta, updated_at: new Date().toISOString() })
      .eq("id", existing?.id || 1);

    if (error) {
      setMsg({ text: error.message, type: "error" });
    } else {
      setMsg({ text: "Platform CMS content published and updated across all public pages!", type: "success" });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Full Platform Content Manager (CMS)</h1>
          <p className="text-xs text-slate-500 mt-1">Dynamically manage hero banners, landing sections, testimonials, FAQs, and legal policies.</p>
        </div>

        <button
          type="button"
          onClick={handleSaveCms}
          disabled={submitting}
          className="minimal-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md shadow-indigo-600/15 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Publishing Changes..." : "Publish CMS Content"}</span>
        </button>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 font-semibold ${
          msg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* CMS Navigation Tabs */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { id: "hero", label: "Hero Banner", icon: Sparkles },
          { id: "about", label: "About Platform", icon: Globe },
          { id: "how_it_works", label: "How It Works", icon: Layout },
          { id: "features", label: "Features Cards", icon: Shield },
          { id: "testimonials", label: "Testimonials", icon: MessageSquare },
          { id: "faq", label: "FAQ Manager", icon: HelpCircle },
          { id: "contact", label: "Support & Social", icon: PhoneCall },
          { id: "legal", label: "Legal Terms", icon: Shield },
        ].map((tab: any) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap cursor-pointer ${
                active ? "bg-indigo-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CMS Tab Editor Panels */}
      <form onSubmit={handleSaveCms} className="space-y-6">

        {/* Tab 1: Hero Banner */}
        {activeTab === "hero" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Homepage Hero Banner Section</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Hero Pill Badge</label>
                <input
                  type="text"
                  value={cmsData.hero_badge}
                  onChange={(e) => setCmsData({ ...cmsData, hero_badge: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Hero Headline Title</label>
                <input
                  type="text"
                  value={cmsData.hero_title}
                  onChange={(e) => setCmsData({ ...cmsData, hero_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Hero Subtitle Paragraph</label>
                <textarea
                  rows={3}
                  value={cmsData.hero_subtitle}
                  onChange={(e) => setCmsData({ ...cmsData, hero_subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Primary CTA Button Text</label>
                <input
                  type="text"
                  value={cmsData.hero_cta}
                  onChange={(e) => setCmsData({ ...cmsData, hero_cta: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: About Platform */}
        {activeTab === "about" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">About Us Platform Story & Metrics</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">About Section Title</label>
                <input
                  type="text"
                  value={cmsData.about_title}
                  onChange={(e) => setCmsData({ ...cmsData, about_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Platform Story Body Text</label>
                <textarea
                  rows={4}
                  value={cmsData.about_text}
                  onChange={(e) => setCmsData({ ...cmsData, about_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Key Metric 1</label>
                  <input
                    type="text"
                    value={cmsData.about_metric1}
                    onChange={(e) => setCmsData({ ...cmsData, about_metric1: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Key Metric 2</label>
                  <input
                    type="text"
                    value={cmsData.about_metric2}
                    onChange={(e) => setCmsData({ ...cmsData, about_metric2: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: How It Works */}
        {activeTab === "how_it_works" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">How It Works Onboarding Flow Steps</h3>

            <div className="space-y-4">
              {cmsData.how_it_works?.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-extrabold text-indigo-600">
                    <span>Step {item.step}</span>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...cmsData.how_it_works];
                      updated[idx].title = e.target.value;
                      setCmsData({ ...cmsData, how_it_works: updated });
                    }}
                    placeholder="Step Title"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => {
                      const updated = [...cmsData.how_it_works];
                      updated[idx].desc = e.target.value;
                      setCmsData({ ...cmsData, how_it_works: updated });
                    }}
                    placeholder="Step Description"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Features */}
        {activeTab === "features" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Platform Feature Cards</h3>

            <div className="space-y-4">
              {cmsData.features?.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...cmsData.features];
                      updated[idx].title = e.target.value;
                      setCmsData({ ...cmsData, features: updated });
                    }}
                    placeholder="Feature Card Title"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    value={item.desc}
                    onChange={(e) => {
                      const updated = [...cmsData.features];
                      updated[idx].desc = e.target.value;
                      setCmsData({ ...cmsData, features: updated });
                    }}
                    placeholder="Feature Description"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Testimonials */}
        {activeTab === "testimonials" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Client Reviews & Testimonials</h3>

            <div className="space-y-4">
              {cmsData.testimonials?.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...cmsData.testimonials];
                        updated[idx].name = e.target.value;
                        setCmsData({ ...cmsData, testimonials: updated });
                      }}
                      placeholder="Investor Name"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold"
                    />
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => {
                        const updated = [...cmsData.testimonials];
                        updated[idx].role = e.target.value;
                        setCmsData({ ...cmsData, testimonials: updated });
                      }}
                      placeholder="Designation / Role"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={item.review}
                    onChange={(e) => {
                      const updated = [...cmsData.testimonials];
                      updated[idx].review = e.target.value;
                      setCmsData({ ...cmsData, testimonials: updated });
                    }}
                    placeholder="Review Text"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: FAQ Manager */}
        {activeTab === "faq" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">FAQ Accordion Entries</h3>

            <div className="space-y-4">
              {cmsData.faqs?.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const updated = [...cmsData.faqs];
                      updated[idx].question = e.target.value;
                      setCmsData({ ...cmsData, faqs: updated });
                    }}
                    placeholder="Question Title"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold"
                  />
                  <textarea
                    rows={2}
                    value={item.answer}
                    onChange={(e) => {
                      const updated = [...cmsData.faqs];
                      updated[idx].answer = e.target.value;
                      setCmsData({ ...cmsData, faqs: updated });
                    }}
                    placeholder="Detailed Answer"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Support & Social */}
        {activeTab === "contact" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Support Contact & Social Community Links</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Support Email</label>
                <input
                  type="text"
                  value={cmsData.support_email}
                  onChange={(e) => setCmsData({ ...cmsData, support_email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Support Phone</label>
                <input
                  type="text"
                  value={cmsData.support_phone}
                  onChange={(e) => setCmsData({ ...cmsData, support_phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Telegram Community</label>
                <input
                  type="text"
                  value={cmsData.telegram_handle}
                  onChange={(e) => setCmsData({ ...cmsData, telegram_handle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Twitter / X Handle</label>
                <input
                  type="text"
                  value={cmsData.twitter_handle}
                  onChange={(e) => setCmsData({ ...cmsData, twitter_handle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Legal Terms */}
        {activeTab === "legal" && (
          <div className="minimal-card p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Privacy Policy & Terms of Service Statements</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Privacy Policy Document</label>
                <textarea
                  rows={6}
                  value={cmsData.privacy_policy}
                  onChange={(e) => setCmsData({ ...cmsData, privacy_policy: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Terms of Service Document</label>
                <textarea
                  rows={6}
                  value={cmsData.terms_of_service}
                  onChange={(e) => setCmsData({ ...cmsData, terms_of_service: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="minimal-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/15 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Publishing Changes..." : "Publish CMS Content"}</span>
        </button>

      </form>

    </div>
  );
}
