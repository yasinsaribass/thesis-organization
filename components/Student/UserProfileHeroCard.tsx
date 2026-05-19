"use client";

import { getLevelFromXP } from "@/lib/gamification";
import { User } from "lucide-react";

interface UserProfileHeroCardProps {
    xp: number;
    userProfile?: {
        name: string;
        surname: string;
        avatar_url?: string;
        student_number: string;
    };
}

import { useLanguage } from "@/context/LanguageContext";

export function UserProfileHeroCard({ xp, userProfile }: UserProfileHeroCardProps) {
    const { t } = useLanguage();
    const levelInfo = getLevelFromXP(xp);
    const fullName = userProfile ? `${userProfile.name} ${userProfile.surname}` : t.student.researchStudent;
    
    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2rem] py-5 px-6 shadow-2xl flex flex-col h-full group hover:bg-white/15 transition-all duration-500">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-white/30 overflow-hidden shadow-lg bg-indigo-500/30 flex items-center justify-center shrink-0">
                    {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-white/50" />
                    )}
                </div>
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-white leading-tight transition-colors group-hover:text-yellow-200">
                        {fullName}
                    </h2>
                    <p className="text-sm font-bold text-indigo-100/70">
                        {t.student.level} {levelInfo.level} — {(t.gamification.levels as any)[levelInfo.level] || levelInfo.name}
                    </p>
                </div>
            </div>

            <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{t.student.xpPoints}</span>
                    <span className="text-xs font-black text-white">
                        <span className="text-yellow-300">{xp}</span> / {levelInfo.nextLevel?.xpRequired || xp} XP
                    </span>
                </div>
                {/* Thick XP Bar */}
                <div className="h-5 bg-black/30 rounded-full p-1 border border-white/10 shadow-inner overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                        style={{ width: `${levelInfo.progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
