"use client";

import { useLanguage } from "@/context/LanguageContext";
import { 
    Clock, 
    CheckCircle2, 
    Bell 
} from "lucide-react";
import { HeroActions } from "@/components/Student/HeroActions";
import { UserProfileHeroCard } from "@/components/Student/UserProfileHeroCard";
import { EpicBossHeroCard } from "@/components/Student/EpicBossHeroCard";
import { GamificationStatsHeroCard } from "@/components/Student/GamificationStatsHeroCard";
import { SupervisorRequestBanner } from "@/components/Student/SupervisorRequestBanner";
import { LeaderboardCard } from "@/components/Student/LeaderboardCard";
import { ProjectBoardTrigger } from "@/components/Student/ProjectBoardTrigger";
import { TaskWorkflowGrid } from "@/components/Student/TaskWorkflowGrid";
import { RegisterThesisForm } from "@/components/Student/RegisterThesisForm";
import { CinematicSuccess } from "@/components/Student/CinematicSuccess";
import { CinematicDragonDefeat } from "@/components/Student/CinematicDragonDefeat";
import { CinematicFeedback } from "@/components/Student/CinematicFeedback";
import { BookOpen, Sparkles, GraduationCap as GradCap } from "lucide-react";
import { useState, useEffect } from "react";



interface StudentDashboardClientProps {
    thesis: any;
    mainTasks: any[];
    supervisorTasks: any[];
    stats: any;
    notifications: any[];
    profile: any;
    gamification: any;
    leaderboard: any[];
    allTasks: any;
    request: any;
    chatData: any;
}

export function StudentDashboardClient({
    thesis,
    mainTasks,
    supervisorTasks,
    stats,
    notifications,
    profile,
    gamification,
    leaderboard,
    allTasks,
    request,
    chatData
}: StudentDashboardClientProps) {
    const { t } = useLanguage();
    const [showCinematic, setShowCinematic] = useState(false);
    const [showDragonDefeat, setShowDragonDefeat] = useState(false);
    const [showFeedbackCinematic, setShowFeedbackCinematic] = useState(false);
    const [feedbackData, setFeedbackData] = useState<{ title: string; snippet: string } | null>(null);

    // Effect to detect Dragon Defeat (all tasks finished)
    useEffect(() => {
        if (!thesis?.id || stats.ongoing > 0 || stats.completed === 0) return;

        // Check if we've already shown the animation for this thesis in this session/browser
        const storageKey = `dragon_defeat_seen_${thesis.id}`;
        const hasSeen = localStorage.getItem(storageKey);

        if (!hasSeen) {
            // Trigger animation
            setShowDragonDefeat(true);
            // Mark as seen
            localStorage.setItem(storageKey, "true");
        }
    }, [stats.ongoing, stats.completed, thesis?.id]);

    // Effect to detect new Supervisor Guidance (Feedback or Suggestions)
    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        // Find newest guidance notification
        const guidanceNotif = notifications.find(n => 
            n.type === 'feedback' || 
            n.type === 'task_suggestion' || 
            n.type === 'subtask_suggestion'
        );

        if (guidanceNotif) {
            const lastSeenId = localStorage.getItem('last_guidance_notif_id');
            if (lastSeenId !== guidanceNotif.id) {
                setFeedbackData({
                    title: guidanceNotif.title,
                    snippet: guidanceNotif.body || guidanceNotif.message || ""
                });
                setShowFeedbackCinematic(true);
                localStorage.setItem('last_guidance_notif_id', guidanceNotif.id);
            }
        }
    }, [notifications]);

    if (!thesis && !showCinematic) {

        return (
            <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-2xl w-full relative">
                    <div className="text-center mb-10 space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-white shadow-xl shadow-indigo-100 border border-indigo-50 mb-4 transform hover:scale-110 transition-transform">
                            <BookOpen className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            {t.student.forms.registerThesis.title}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
                            {t.student.forms.registerThesis.subtitle}
                        </p>
                    </div>

                    <div className="relative group">
                        {/* Decorative Gradient Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
                        
                        {/* Form Container */}
                        <div className="relative z-10">
                            <RegisterThesisForm 
                                onboardingMode 
                                onSuccess={() => setShowCinematic(true)} 
                            />
                        </div>
                    </div>


                    <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gamified Tracking</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <div className="flex items-center gap-2">
                            <GradCap className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Supervisor Sync</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] pb-12 transition-colors duration-500">
            {showCinematic && (
                <CinematicSuccess 
                    onComplete={() => {
                        setShowCinematic(false);
                        window.location.reload(); // Refresh to catch any pending server state
                    }}
                />
            )}
            {showDragonDefeat && (
                <CinematicDragonDefeat 
                    onComplete={() => {
                        setShowDragonDefeat(false);
                    }}
                />
            )}
            {showFeedbackCinematic && (
                <CinematicFeedback 
                    taskTitle={feedbackData?.title}
                    feedbackSnippet={feedbackData?.snippet}
                    onComplete={() => {
                        setShowFeedbackCinematic(false);
                    }}
                />
            )}
            {/* Hero Section */}

            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 border-b border-indigo-500/30">
                <div className="max-w-[1600px] mx-auto px-6 py-6 md:py-8">
                    
                    {/* Top Actions Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                            {thesis ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="line-clamp-1">{thesis.title}</span>
                                </>
                            ) : (
                                t.student.noThesis
                            )}
                        </div>
                        <HeroActions 
                            notifications={notifications}
                            profile={profile}
                            chatData={chatData}
                            thesisId={thesis?.id}
                        />
                    </div>

                    {/* The 3-Column RPG Hero Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                        <div className="lg:col-span-1">
                            <UserProfileHeroCard 
                                xp={gamification?.xp || 0}
                                userProfile={profile}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <EpicBossHeroCard 
                                completedTasks={stats.completed}
                                totalTasks={stats.completed + stats.ongoing}
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <GamificationStatsHeroCard 
                                streak={gamification?.streak || 0}
                                earnedBadgeKeys={gamification?.badges?.map((b: any) => b.badge_key) || []}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 mt-10">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Ongoing Tasks Metric Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-black text-indigo-600/80 uppercase tracking-widest mb-1">{t.metrics.ongoing}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.ongoing}</p>
                                    <span className="text-sm font-semibold text-gray-400">{t.metrics.ongoingSub}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform group-hover:rotate-6 transition-transform">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-5 w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-full animate-pulse rounded-full"></div>
                        </div>
                    </div>

                    {/* Completed Metric Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-black text-emerald-600/80 uppercase tracking-widest mb-1">{t.metrics.completed}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.completed}</p>
                                    <span className="text-sm font-semibold text-gray-400">{t.metrics.completedSub}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform group-hover:-rotate-6 transition-transform">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-5 w-full bg-emerald-50 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-full rounded-full"></div>
                        </div>
                    </div>

                    {/* Suggestions Metric Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(245,158,11,0.1)] transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-black text-amber-600/80 uppercase tracking-widest mb-1">{t.metrics.pending}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.suggestions}</p>
                                    <span className="text-sm font-semibold text-gray-400">{t.metrics.pendingSub}</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 transform group-hover:scale-110 transition-transform">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-5 flex items-center gap-2">
                            {stats.suggestions > 0 ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                                    <p className="text-xs font-bold text-amber-600">{t.metrics.actionNeeded}</p>
                                </>
                            ) : (
                                <p className="text-xs font-semibold text-gray-400">{t.metrics.allProcessed}</p>
                            )}
                        </div>
                    </div>
                </div>

                {request && (
                    <SupervisorRequestBanner supervisorName={request.supervisorName} />
                )}

                {/* Leaderboard */}
                {leaderboard.length > 1 && (
                    <LeaderboardCard entries={leaderboard as any} />
                )}

                {/* Project Board & Timeline Trigger */}
                {allTasks && (
                    <ProjectBoardTrigger 
                        thesis={allTasks.thesis}
                        tasks={allTasks.tasks}
                    />
                )}

                {/* Navigation Cards */}
                <h2 className="text-lg font-bold text-gray-900 mb-6 px-1 tracking-tight">{t.student.workflow.title}</h2>
                <TaskWorkflowGrid 
                    thesis={thesis}
                    mainTasks={mainTasks}
                    supervisorTasks={supervisorTasks}
                />
            </div>
        </div>
    );
}
