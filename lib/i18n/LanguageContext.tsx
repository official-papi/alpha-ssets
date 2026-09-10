"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, SUPPORTED_LANGUAGES, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)["en"];
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
  dir: "ltr",
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("alpha_language") as Language | null;
      if (savedLang && SUPPORTED_LANGUAGES.some((l) => l.code === savedLang)) {
        setLanguageState(savedLang);
      } else {
        // Optional: detect browser language
        const browserLang = navigator.language?.slice(0, 2) as Language;
        if (browserLang && SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
          setLanguageState(browserLang);
        }
      }
    } catch (e) {
      console.error("Failed to read language from localStorage", e);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("alpha_language", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

      const target = lang === "en" ? "/en/en" : `/en/${lang}`;
      document.cookie = `googtrans=${target}; path=/;`;
      document.cookie = `googtrans=${target}; path=/; domain=${window.location.hostname};`;

      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
      } else {
        // Smooth reload if changing language and google widget needs a refresh
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language, mounted]);

  const activeTranslations = translations[language] || translations.en;
  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: activeTranslations,
        dir,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
