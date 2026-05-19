"use client";

import React from "react";
import Link from "next/link";
import { 
    ChevronLeft, 
    LayoutDashboard, 
    BarChart3, 
    MessageCircle,
    Plus
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TaskDetailHeaderProps {
    task: any;
    task_id: string;
    currentView: "kanban" | "progress" | "feedback";
}

export function TaskDetailHeader({ task, task_id, currentView }: TaskDetailHeaderProps) {
    const { t } = useLanguage();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/student"
                        className="p-2 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-8 w-px bg-gray-100 mx-2" />
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {t.student.currentTask}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full uppercase tracking-tighter">
                                Active
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">{task.title}</h1>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="hidden lg:flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                    <Link
                        href={`/dashboard/student/kanban?task_id=${task_id}`}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${
                            currentView === "kanban" 
                                ? "bg-white shadow-sm text-gray-900 border border-gray-100" 
                                : "text-gray-400 hover:text-gray-900 hover:bg-white/50"
                        }`}
                    >
                        <LayoutDashboard className={`w-4 h-4 ${currentView === "kanban" ? "text-indigo-600" : ""}`} />
                        {t.student.kanban.toUpperCase()}
                    </Link>
                    <Link
                        href={`/dashboard/student/progress?task_id=${task_id}`}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${
                            currentView === "progress" 
                                ? "bg-white shadow-sm text-gray-900 border border-gray-100" 
                                : "text-gray-400 hover:text-gray-900 hover:bg-white/50"
                        }`}
                    >
                        <BarChart3 className={`w-4 h-4 ${currentView === "progress" ? "text-indigo-600" : ""}`} />
                        {t.student.progress.toUpperCase()}
                    </Link>
                    {task.supervisor_feedback && (
                        <Link
                            href={`/dashboard/student/feedback?task_id=${task_id}`}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${
                                currentView === "feedback" 
                                    ? "bg-white shadow-sm text-gray-900 border border-gray-100" 
                                    : "text-gray-400 hover:text-gray-900 hover:bg-white/50"
                            }`}
                        >
                            <MessageCircle className={`w-4 h-4 ${currentView === "feedback" ? "text-amber-600" : ""}`} />
                            {t.student.feedback.toUpperCase()}
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {currentView === "kanban" ? (
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                            <Plus className="w-4 h-4" />
                            {t.student.forms.taskForm.addStep.toUpperCase()}
                        </button>
                    ) : (
                        <div className="w-[124px]" /> 
                    )}
                </div>
            </div>
        </header>
    );
}
