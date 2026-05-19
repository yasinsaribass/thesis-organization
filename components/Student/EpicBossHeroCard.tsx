"use client";

import { Swords, Skull, Sparkles } from "lucide-react";

interface EpicBossHeroCardProps {
    completedTasks: number;
    totalTasks: number;
}

import { useLanguage } from "@/context/LanguageContext";

export function EpicBossHeroCard({ completedTasks, totalTasks }: EpicBossHeroCardProps) {
    const { t } = useLanguage();
    const bossDefeated = completedTasks >= totalTasks && totalTasks > 0;
    const maxHP = totalTasks * 100;
    const currentHP = Math.max(0, (totalTasks - completedTasks) * 100);
    const hpPercent = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;

    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2.5rem] py-5 px-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group h-full">
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] transition-opacity duration-1000 ${
                bossDefeated ? "bg-amber-400 group-hover:opacity-60" : "bg-red-600 group-hover:opacity-40"
            }`} />

            {/* Boss Image Section */}
            <div className="relative mb-4">
                <div className={`w-24 h-24 rounded-3xl border-4 shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 ${
                    bossDefeated ? "border-amber-400 bg-amber-100" : "border-red-500/30 bg-black/40"
                }`}>
                    {bossDefeated ? (
                        <div className="flex flex-col items-center gap-1 text-amber-600">
                           <Sparkles className="w-12 h-12" />
                           <span className="text-[10px] font-black uppercase tracking-tighter">{t.student.bossConquered}</span>
                        </div>
                    ) : (
                        <img 
                            src="https://api.dicebear.com/9.x/bottts/svg?seed=DeadlineDragon&baseColor=c62828&eyes=bulging" 
                            alt="Boss" 
                            className="w-full h-full object-cover animate-pulse"
                            style={{ filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))' }}
                        />
                    )}
                </div>
                {!bossDefeated && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-full border-2 border-white/50 flex items-center justify-center text-white shadow-xl">
                        <Skull className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Typography */}
            <div className="relative z-10 mb-4">
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                    {bossDefeated ? t.student.bossDefeated : t.student.bossFight}
                </h1>
                <p className="text-xs font-bold text-red-300 drop-shadow-md mt-0.5 opacity-80">
                    {bossDefeated 
                        ? t.student.bossDefeatedSubtitle 
                        : t.student.bossFightSubtitle.replace("{totalTasks}", totalTasks.toString())
                    }
                </p>
            </div>

            {/* Large HP Bar Section */}
            <div className="w-full max-w-lg mb-4 mt-auto">
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-black uppercase text-white/50 tracking-widest flex items-center gap-2">
                        <Swords className="w-3.5 h-3.5" /> {t.student.bossHealth}
                    </span>
                    <span className="text-sm font-black text-white">
                        <span className="text-red-400 font-black">{currentHP}</span> / {maxHP} {t.student.hp}
                    </span>
                </div>
                {/* Thick HP Progress Bar */}
                <div className="h-6 bg-black/40 rounded-full p-1.5 border border-white/10 shadow-inner relative overflow-hidden group/bar">
                     <div 
                        className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        style={{ width: `${hpPercent}%` }}
                    />
                    <div className="absolute top-1.5 left-0 w-full h-1/2 bg-white/20 rounded-full" />
                </div>
            </div>

            {/* Motivation Text */}
             {!bossDefeated && (
                 <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                    {t.student.bossMotivation}
                 </p>
             )}
        </div>
    );
}
