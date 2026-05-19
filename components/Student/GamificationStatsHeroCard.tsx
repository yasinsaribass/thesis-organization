"use client";

import { BADGES } from "@/lib/gamification";
import { Flame, Trophy, ChevronRight } from "lucide-react";
import { useState } from "react";
import { TrophyRoomModal } from "./TrophyRoomModal";

interface GamificationStatsHeroCardProps {
    streak: number;
    earnedBadgeKeys: string[];
}

import { useLanguage } from "@/context/LanguageContext";

export function GamificationStatsHeroCard({ streak, earnedBadgeKeys }: GamificationStatsHeroCardProps) {
    const { t } = useLanguage();
    const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);
    
    return (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-[2rem] py-5 px-6 shadow-2xl flex flex-col h-full group hover:bg-white/15 transition-all duration-500">
            {/* Streak Area */}
            <div className="mb-4 flex flex-col items-center sm:items-start">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                        <Flame className="w-7 h-7 text-orange-400 fill-orange-500 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">{t.student.ongoingStreak}</p>
                        <p className="text-3xl font-black text-white">
                            <span className="text-orange-500 text-4xl">{streak}</span> 
                            <span className="ml-2 text-xl opacity-80 uppercase tracking-tighter">{t.student.days}</span>
                        </p>
                    </div>
                 </div>
            </div>

            {/* Badges Area */}
            <div className="mt-1 mb-4">
                <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3">{t.student.recentAchievements}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {Object.values(BADGES).slice(0, 6).map((badge) => {
                        const earned = earnedBadgeKeys.includes(badge.key);
                        const badgeTranslation = (t.gamification.badges as any)[badge.key] || { name: badge.name };
                        const badgeName = badgeTranslation.name;
                        
                        return (
                            <div
                                key={badge.key}
                                title={earned ? badgeName : `${badgeName} (${t.gamification.locked || 'Locked'})`}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-500 border group/badge hover:scale-110 ${
                                    earned 
                                        ? "bg-amber-500/20 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)]" 
                                        : "bg-white/5 border-white/10 opacity-30 grayscale blur-[0.5px] hover:grayscale-0 hover:opacity-100 hover:blur-none"
                                }`}
                            >
                                <span className="transform group-hover/badge:scale-125 transition-transform">{badge.emoji}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Trophy Room Button */}
            <div className="mt-auto">
                <button 
                    onClick={() => setIsTrophyRoomOpen(true)}
                    className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 p-3 rounded-2xl transition-all duration-300 group/btn"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-200 group-hover/btn:scale-110 transition-transform">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white/80">{t.student.trophyRoom}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>

            <TrophyRoomModal 
                isOpen={isTrophyRoomOpen}
                onClose={() => setIsTrophyRoomOpen(false)}
                earnedBadgeKeys={earnedBadgeKeys}
            />
        </div>
    );
}
