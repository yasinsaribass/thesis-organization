"use client";

import { X, Lock, Trophy } from "lucide-react";
import { BADGES } from "@/lib/gamification";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";


interface TrophyRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    earnedBadgeKeys: string[];
}

import { useLanguage } from "@/context/LanguageContext";

export function TrophyRoomModal({ isOpen, onClose, earnedBadgeKeys }: TrophyRoomModalProps) {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const allBadges = Object.values(BADGES);
    const earnedCount = earnedBadgeKeys.length;
    const totalCount = allBadges.length;

    return createPortal(
        <div 
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 bg-stone-900 flex items-center justify-between border-b-4 border-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/50">
                            <Trophy className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">{t.gamification.trophyRoom.title}</h2>
                            <p className="text-xs font-bold text-amber-500/80 tracking-widest uppercase">
                                {t.gamification.trophyRoom.progress.replace("{earned}", earnedCount.toString()).replace("{total}", totalCount.toString())}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10 active:scale-95"
                        title={t.gamification.trophyRoom.close}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t.gamification.trophyRoom.close}</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable Badges Grid) */}
                <div className="p-6 overflow-y-auto bg-stone-100/50">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {allBadges.map((badge) => {
                            const isEarned = earnedBadgeKeys.includes(badge.key);
                            const badgeTranslation = (t.gamification.badges as any)[badge.key] || { name: badge.name, desc: badge.description };

                            return (
                                <div 
                                    key={badge.key}
                                    className={`relative flex flex-col items-center p-5 rounded-2xl border-2 transition-all group ${
                                        isEarned 
                                            ? "bg-white border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300"
                                            : "bg-stone-50 border-stone-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                    }`}
                                >
                                    {/* Icon Box */}
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-inner ${
                                        isEarned ? "bg-amber-50 border-2 border-amber-100" : "bg-stone-200 border-2 border-stone-300"
                                    }`}>
                                        {badge.emoji}
                                    </div>
                                    
                                    {/* Text Info */}
                                    <div className="text-center">
                                        <h3 className={`font-black uppercase tracking-wider text-sm ${
                                            isEarned ? "text-stone-800" : "text-stone-500"
                                        }`}>
                                            {badgeTranslation.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-stone-500 mt-1 line-clamp-2">
                                            {badgeTranslation.desc}
                                        </p>
                                    </div>

                                    {/* Lock overlay if not earned */}
                                    {!isEarned && (
                                        <div className="absolute top-3 right-3 w-6 h-6 bg-stone-200 rounded-full flex items-center justify-center shadow-sm">
                                            <Lock className="w-3 h-3 text-stone-500" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
