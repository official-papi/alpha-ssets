"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslateBridge() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Define the initialization function for Google Translate
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,es,fr,de,pt,ar,it,ru,tr,zh-CN,hi,ja",
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE,
            },
            "google_translate_element"
          );
        }
      } catch (err) {
        console.error("Google translate init error:", err);
      }
    };
  }, []);

  // Sync Google Translate when active language changes
  useEffect(() => {
    if (!mounted) return;

    const applyTranslation = () => {
      try {
        const targetLang = language === "en" ? "/en/en" : `/en/${language}`;
        document.cookie = `googtrans=${targetLang}; path=/;`;
        document.cookie = `googtrans=${targetLang}; path=/; domain=${window.location.hostname};`;

        if (window.location.hostname !== "localhost" && !window.location.hostname.includes("127.0.0.1")) {
          const parts = window.location.hostname.split(".");
          if (parts.length >= 2) {
            const rootDomain = parts.slice(-2).join(".");
            document.cookie = `googtrans=${targetLang}; path=/; domain=.${rootDomain};`;
          }
        }

        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
        if (select) {
          select.value = language;
          select.dispatchEvent(new Event("change"));
        }
      } catch (e) {
        console.error("Error setting translation cookie", e);
      }
    };

    applyTranslation();
    const timer = setTimeout(applyTranslation, 600);
    return () => clearTimeout(timer);
  }, [language, mounted]);

  // Don't render third-party DOM-mutating bridge until client has mounted to prevent hydration mismatches
  if (!mounted) {
    return null;
  }

  return (
    <>
      <div
        id="google_translate_element"
        className="hidden"
        style={{ display: "none" }}
        suppressHydrationWarning
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
    </>
  );
}
