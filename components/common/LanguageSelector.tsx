"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SUPPORTED_LANGUAGES, LanguageOption } from "@/lib/i18n/translations";
import { Globe, ChevronDown, Check } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "default" | "compact" | "minimal" | "footer";
  className?: string;
  dropDirection?: "up" | "down";
}

export default function LanguageSelector({
  variant = "default",
  className = "",
  dropDirection = "down",
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang: LanguageOption) => {
    setLanguage(lang.code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === "compact" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Select Language"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] bg-[#fafaf5] hover:bg-[#e4e7dc]/70 text-[#20281f] font-semibold text-xs transition-all border border-[#20281f20] cursor-pointer shadow-2xs"
        >
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span className="uppercase text-[11px] font-bold text-[#20281f]">{currentLang.code}</span>
          <ChevronDown className={`w-3 h-3 text-[#60695b] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {variant === "minimal" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Select Language"
          className="flex items-center justify-center w-8 h-8 rounded-[7px] bg-[#fafaf5] hover:bg-[#e4e7dc]/70 text-[#20281f] border border-[#20281f20] transition-all cursor-pointer"
        >
          <span className="text-base leading-none">{currentLang.flag}</span>
        </button>
      )}

      {variant === "footer" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Select Language"
          className="flex items-center gap-2 px-3 py-2 rounded-[7px] bg-[#2a3429] hover:bg-[#343e32] border border-[#ffffff1f] text-[#f0f2eb] font-medium text-xs transition-all cursor-pointer shadow-xs"
        >
          <Globe className="w-3.5 h-3.5 text-[#d1f18b]" />
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
          <ChevronDown className={`w-3 h-3 text-[#d1f18b] ml-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {variant === "default" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Select Language"
          className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#fafaf5] hover:bg-[#e4e7dc]/70 border border-[#20281f20] text-[#20281f] font-semibold text-xs transition-all shadow-2xs cursor-pointer group"
        >
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <span className="text-[12px] text-[#20281f] font-medium">{currentLang.nativeName}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#60695b] group-hover:text-[#20281f] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-48 rounded-[10px] bg-[#fafaf5] p-1.5 shadow-xl ring-1 ring-black/5 border border-[#e4e7dc] transition-all animate-in fade-in-50 zoom-in-95 ${
            dropDirection === "up" ? "bottom-full mb-2 left-0" : "top-full mt-2 right-0 md:right-0 left-auto"
          }`}
        >
          <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#60695b] border-b border-[#e4e7dc] mb-1">
            Language / Idioma
          </div>
          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[7px] text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#e3f2c9] text-[#20281f] font-bold"
                      : "text-[#475043] hover:bg-[#e4e7dc]/60 hover:text-[#20281f]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <span className="block text-[13px] leading-tight font-medium">
                        {lang.nativeName}
                      </span>
                      <span className="block text-[10px] text-[#717a6c]">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#537722] font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
