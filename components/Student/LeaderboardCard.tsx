"use client";

import { getLevelFromXP } from "@/lib/gamification";

type LeaderboardEntry = {
    rank: number;
    studentId: string;
    name: string;
    xp: number;
    level: ReturnType<typeof getLevelFromXP>;
    streak: number;
    isCurrentUser: boolean;
};

type Props = {
    entries: LeaderboardEntry[];
};

const RANK_STYLES = [
    { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", medal: "🥇" },
    { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", medal: "🥈" },
    { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", medal: "🥉" },
];

export function LeaderboardCard({ entries }: Props) {
    if (entries.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <span className="text-xl">🏆</span>
                </div>
                <div>
                    <h3 className="font-black text-gray-900 text-lg">Leaderboard</h3>
                    <p className="text-sm text-gray-400">Students under your supervisor</p>
                </div>
            </div>

            <div className="space-y-3">
                {entries.map(entry => {
                    const rankStyle = RANK_STYLES[entry.rank - 1];
                    const isTop3 = entry.rank <= 3;
                    return (
                        <div
                            key={entry.studentId}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                entry.isCurrentUser
                                    ? "bg-indigo-50 border-indigo-200 ring-2 ring-indigo-300"
                                    : isTop3
                                    ? `${rankStyle?.bg} ${rankStyle?.border}`
                                    : "bg-gray-50 border-gray-100"
                            }`}
                        >
                            {/* Rank + Name */}
                            <div className="flex items-center gap-4">
                                <div className="w-8 text-center">
                                    {isTop3 ? (
                                        <span className="text-xl">{rankStyle?.medal}</span>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-gray-900 text-sm">
                                            {entry.name}
                                            {entry.isCurrentUser && (
                                                <span className="ml-2 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">You</span>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{entry.level.name}</p>
                                </div>
                            </div>

                            {/* XP + Streak */}
                            <div className="flex items-center gap-6 text-right">
                                <div>
                                    <p className="font-black text-gray-900">{entry.xp} <span className="text-xs font-semibold text-gray-400">XP</span></p>
                                </div>
                                {entry.streak > 0 && (
                                    <div className="text-sm font-bold text-orange-500 flex items-center gap-1">
                                        🔥 {entry.streak}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
