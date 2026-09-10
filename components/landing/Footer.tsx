"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, ShieldCheck, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
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
    <footer className="bg-white border-t border-slate-100 py-14 text-[13px] text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-[17px] font-bold tracking-tight text-slate-900">
                Alpha<span className="text-indigo-600">@</span>ssets
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-[13px]">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-1.5 hm-badge hm-badge-success w-fit">
              <ShieldCheck className="w-3 h-3" />
              <span>{t.hero.securityAudited}</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-widest mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t.nav.home,         href: "/" },
                { label: t.nav.about,        href: "/about" },
                { label: t.nav.plans,        href: "/plans" },
                { label: t.nav.howItWorks,   href: "/how-it-works" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 hover:text-indigo-600 transition-colors font-medium flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 opacity-50" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-widest mb-4">
              {t.footer.support}
            </h4>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-2 font-medium">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{cms.support_email}</span>
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>{cms.support_phone}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{cms.support_address}</span>
              </li>
            </ul>
          </div>

          {/* Language & Security */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-widest mb-2">
              {t.footer.selectLanguage}
            </h4>
            <LanguageSelector variant="default" dropDirection="up" />
            <p className="text-slate-400 leading-relaxed text-[12px] pt-2">
              {t.footer.disclaimerText}
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-400">
          <span>© {new Date().getFullYear()} Alpha@ssets Inc. {t.footer.allRightsReserved}</span>
          <div className="flex gap-6 font-medium">
            <Link href="/faq" className="hover:text-slate-600 transition-colors">{t.footer.privacyPolicy}</Link>
            <Link href="/faq" className="hover:text-slate-600 transition-colors">{t.footer.termsOfService}</Link>
            <Link href="/contact" className="hover:text-slate-600 transition-colors">{t.footer.support}</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
