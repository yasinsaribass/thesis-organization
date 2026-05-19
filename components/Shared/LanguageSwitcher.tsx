"use client";

import { useLanguage, Language } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "light" | "dark";
}

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-3">
      <Globe className={`w-3.5 h-3.5 ${isLight ? "text-white/40" : "text-slate-400"}`} />
      <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest">
        <button
          onClick={() => setLanguage("LV")}
          className={`px-1 transition-all ${
            language === "LV"
              ? isLight ? "text-white scale-110" : "text-[#00595d] scale-110"
              : isLight ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          LV
        </button>
        <span className={`opacity-20 text-[8px] ${isLight ? "text-white" : "text-slate-900"}`}>|</span>
        <button
          onClick={() => setLanguage("EN")}
          className={`px-1 transition-all ${
            language === "EN"
              ? isLight ? "text-white scale-110" : "text-[#00595d] scale-110"
              : isLight ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
