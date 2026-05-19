"use client";

import Link from "next/link";
import { 
    ChevronRight, 
    BookOpen, 
    Users, 
    ShieldCheck, 
    Loader2 
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/Shared/LanguageSwitcher";

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-[#00595d] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00595d]/10 selection:text-[#00595d]">
            {/* RTU Top Bar - Simplified with global LanguageSwitcher */}
            <div className="bg-[#00595d] h-10 w-full flex items-center justify-end px-12">
                <LanguageSwitcher variant="light" />
            </div>

            {/* Main Header */}
            <nav className="sticky top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-[#00595d]">
                            <span className="text-2xl font-black tracking-tighter leading-none">RTU</span>
                            <span className="text-[10px] font-bold uppercase tracking-tight mt-1 opacity-80 leading-[1.2]">
                                RĪGAS TEHNISKĀ <br/> UNIVERSITĀTE
                            </span>
                        </div>
                        <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block" />
                        <span className="hidden sm:block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {t.nav.thesisManagement}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <Link href="/auth/login" className="hidden lg:block text-xs font-black text-[#00595d] uppercase tracking-widest hover:opacity-70 transition-opacity">
                            {t.nav.login}
                        </Link>
                        <Link href="/auth/login" className="px-6 py-3 bg-[#00595d] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-[#00474a] transition-all shadow-lg shadow-[#00595d]/10">
                            {t.nav.enterPlatform}
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="px-6 py-24 md:py-40 bg-white relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#00595d]/5 to-transparent pointer-events-none" />
                    
                    <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="inline-block px-4 py-1.5 bg-[#00595d]/5 rounded-full text-[#00595d] text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                            {t.home.heroSubtitle}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-[#00595d] leading-[1.1] mb-8 tracking-tighter uppercase italic">
                            {t.home.heroTitleStart} <br/>
                            <span className="text-slate-800 not-italic">{t.home.heroTitleEnd}</span>
                        </h1>
                        
                        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                            {t.home.heroDesc}
                        </p>
                        
                        <Link href="/auth/login" className="inline-flex items-center gap-4 px-10 py-5 bg-[#00595d] text-white rounded-md font-black text-sm uppercase tracking-widest hover:bg-[#00474a] transition-all shadow-2xl shadow-[#00595d]/20 group">
                            {t.home.cta}
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>

                {/* Minimalist Feature Cards */}
                <section className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="text-left animate-in fade-in slide-in-from-left-4 duration-700">
                            <div className="w-12 h-1 bg-[#00595d] mb-6" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{t.home.missionTitle}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                {t.home.missionDesc}
                            </p>
                        </div>
                        
                        <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="w-12 h-1 bg-[#00595d] mb-6" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{t.home.guidanceTitle}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                {t.home.guidanceDesc}
                            </p>
                        </div>
                        
                        <div className="text-left animate-in fade-in slide-in-from-right-4 duration-700">
                            <div className="w-12 h-1 bg-[#00595d] mb-6" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">{t.home.progressTitle}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                {t.home.progressDesc}
                            </p>
                        </div>
                    </div>
                </section>

                <footer className="py-24 bg-slate-50 text-center border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
                        <div className="flex items-center gap-4 mb-8 grayscale opacity-50">
                             <span className="text-xl font-black tracking-tighter text-[#00595d]">RTU</span>
                             <div className="h-6 w-px bg-slate-300" />
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.home.footerTag}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                            {t.home.heroSubtitle} © 2026
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
