"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, ShieldCheck, Mail, Phone, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSelector from "@/components/common/LanguageSelector";

export default function Footer() {
  const { t } = useLanguage();
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
    <footer className="bg-[#001011] border-t border-[#093A3E] py-16 text-[13px] text-[#b5dfe3] relative overflow-hidden">
      
      {/* Ambient background glow in Dark Teal */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#093A3E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#3AAFB9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#093A3E] border border-[#3AAFB9]/40 flex items-center justify-center shadow-xs">
                <BarChart2 className="w-4 h-4 text-[#3AAFB9]" />
              </div>
              <span className="text-[17px] font-extrabold tracking-tight text-white">
                Alpha<span className="text-[#3AAFB9]">@</span>ssets
              </span>
            </Link>
            
            <p className="text-[#86cbd1] leading-relaxed text-[13px] font-normal">
              {t.footer.description}
            </p>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#093A3E]/80 border border-[#3AAFB9]/40 text-[#3AAFB9] text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3AAFB9]" />
              <span>{t.hero.securityAudited}</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-[11px] font-bold text-[#3AAFB9] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <span>{t.footer.quickLinks}</span>
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t.nav.home,         href: "/" },
                { label: t.nav.about,        href: "/about" },
                { label: t.nav.plans,        href: "/plans" },
                { label: t.nav.howItWorks,   href: "/how-it-works" },
                { label: t.nav.faq,          href: "/faq" },
                { label: t.nav.contact,      href: "/contact" },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#d9eef0]/80 hover:text-white transition-colors font-medium flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 text-[#3AAFB9] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-[11px] font-bold text-[#3AAFB9] uppercase tracking-widest mb-4">
              {t.footer.support}
            </h4>
            <ul className="space-y-3 text-[#d9eef0]/80 text-[13px]">
              <li className="flex items-center gap-2 font-normal hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#3AAFB9] shrink-0" />
                <span>{cms.support_email}</span>
              </li>
              <li className="flex items-center gap-2 font-normal hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#3AAFB9] shrink-0" />
                <span>{cms.support_phone}</span>
              </li>
              <li className="flex items-start gap-2 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-[#3AAFB9] shrink-0 mt-0.5" />
                <span>{cms.support_address}</span>
              </li>
            </ul>
          </div>

          {/* Language & Regulatory Disclaimer Column */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#3AAFB9] uppercase tracking-widest mb-2">
              {t.footer.selectLanguage}
            </h4>
            <LanguageSelector variant="footer" dropDirection="up" />
            <p className="text-[#5cb4be]/70 leading-relaxed text-[12px] pt-2 font-normal">
              {t.footer.disclaimerText}
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#093A3E]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#5cb4be]/80">
          <span>© {new Date().getFullYear()} Alpha@ssets Inc. {t.footer.allRightsReserved}</span>
          <div className="flex gap-6 font-medium">
            <Link href="/faq" className="hover:text-[#3AAFB9] transition-colors">{t.footer.privacyPolicy}</Link>
            <Link href="/faq" className="hover:text-[#3AAFB9] transition-colors">{t.footer.termsOfService}</Link>
            <Link href="/contact" className="hover:text-[#3AAFB9] transition-colors">{t.footer.support}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
