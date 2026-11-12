"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, ShieldCheck, Mail, Phone, MapPin, ArrowRight, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSelector from "@/components/common/LanguageSelector";
import SecurityAuditModal from "@/components/landing/SecurityAuditModal";

export default function Footer() {
  const { t } = useLanguage();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [cms, setCms] = useState({
    support_email: "support@alphaassets.io",
    support_phone: "+1 (800) 555-0100",
    support_address: "75 Wall Street, Financial District, New York, NY 10005",
    telegram_handle: "@alphaassets_official",
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("system_settings").select("*").single();
      if (data?.meta) setCms((prev) => ({ ...prev, ...data.meta }));
    })();
  }, []);

  return (
    <>
      {/* ── Stelsuite-Style Lime Callout Band ── */}
      <section className="bg-[#d1f18b] text-[#20281f] border-t border-[#b9d975]">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-20 text-center flex flex-col items-center justify-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#416735] mb-2">
            Non-Custodial · Instant Settlement · Zero Holding Risk
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#20281f] max-w-xl leading-[1.05]">
            Good money moves, with automated AI intelligence.
          </h2>
          <p className="max-w-lg text-base sm:text-lg text-[#3d453b] mt-4 leading-relaxed font-normal">
            Borrow with flexible collateral, compound with Plan A & B, and sleep easy with 24/7 liquidity crash protection.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[48px] px-6 rounded-[7px] bg-[#20281f] hover:bg-[#343e32] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>Launch App & Connect Vault</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="min-h-[48px] px-6 rounded-[7px] border border-[#20281f40] hover:bg-[#c4ee70] text-[#20281f] text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#416735]" />
              <span>Read Security Audit</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Clean Footer ── */}
      <footer className="bg-[#fafaf5] border-t border-[#e4e7dc] py-16 text-[13px] text-[#60695b] relative">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

            {/* Brand Column */}
            <div className="space-y-4 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#20281f] text-[#d1f18b] flex items-center justify-center shadow-xs">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="text-[19px] font-bold tracking-[-0.04em] text-[#20281f]">
                  Alpha<span className="font-normal">assets</span><span className="font-black text-[#81ab41]">.</span>
                </span>
              </Link>
              
              <p className="text-[#60695b] leading-relaxed text-[13px] font-normal">
                {t.footer.description}
              </p>
              
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f7ec] hover:bg-[#e8ede0] border border-[#dfe6d2] text-[#416735] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#416735]" />
                <span>{t.hero.securityAudited}</span>
              </button>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-[11px] font-bold text-[#20281f] uppercase tracking-widest mb-4">
                {t.footer.quickLinks}
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: t.nav.home,         href: "/" },
                  { label: t.nav.plans,        href: "/plans" },
                  { label: t.nav.howItWorks,   href: "/how-it-works" },
                  { label: t.nav.about,        href: "/about" },
                  { label: t.nav.faq,          href: "/faq" },
                  { label: t.nav.contact,      href: "/contact" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[#60695b] hover:text-[#20281f] transition-colors font-medium flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 text-[#416735] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      <span>{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-[11px] font-bold text-[#20281f] uppercase tracking-widest mb-4">
                {t.footer.support}
              </h4>
              <ul className="space-y-3 text-[#60695b] text-[13px]">
                <li className="flex items-center gap-2 font-normal hover:text-[#20281f] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#416735] shrink-0" />
                  <span>{cms.support_email}</span>
                </li>
                <li className="flex items-center gap-2 font-normal hover:text-[#20281f] transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#416735] shrink-0" />
                  <span>{cms.support_phone}</span>
                </li>
                <li className="flex items-start gap-2 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-[#416735] shrink-0 mt-0.5" />
                  <span>{cms.support_address}</span>
                </li>
              </ul>
            </div>

            {/* Language Selector Column */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-[#20281f] uppercase tracking-widest mb-2">
                {t.footer.selectLanguage}
              </h4>
              <LanguageSelector variant="footer" dropDirection="up" />
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#e4e7dc] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#7d8573]">
            <span>© {new Date().getFullYear()} AlphaAssets Inc. {t.footer.allRightsReserved}</span>
            <div className="flex gap-6 font-medium">
              <Link href="/faq" className="hover:text-[#20281f] transition-colors">{t.footer.privacyPolicy}</Link>
              <Link href="/faq" className="hover:text-[#20281f] transition-colors">{t.footer.termsOfService}</Link>
              <Link href="/contact" className="hover:text-[#20281f] transition-colors">{t.footer.support}</Link>
            </div>
          </div>

        </div>

        <SecurityAuditModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />
      </footer>
    </>
  );
}
