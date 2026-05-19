"use client";

import React from "react";
import Link from "next/link";
import { Plus, Bell, BookOpen } from "lucide-react";
import { MainTaskCard } from "./MainTaskCard";
import { RegisterThesisForm } from "./RegisterThesisForm";

interface MainTaskListProps {
    thesis: { id: string; title: string; status: string } | null;
    mainTasks: any[];
    supervisorTasks: any[];
    onCreateClick: () => void;
    onEditClick: (task: any) => void;
}

import { useLanguage } from "@/context/LanguageContext";

export function MainTaskList({ 
    thesis, 
    mainTasks, 
    supervisorTasks, 
    onCreateClick,
    onEditClick
}: MainTaskListProps) {
    const { t } = useLanguage();
    const supervisorTaskCount = supervisorTasks.length;

    if (!thesis) {
        return (
            <div className="px-8 py-16 text-center space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
                <div className="max-w-xs mx-auto mb-8">
                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{t.student.list.thesisRequired}</h3>
                    <p className="text-slate-400 text-sm font-medium">
                        {t.student.list.thesisRequiredDesc}
                    </p>
                </div>
                <RegisterThesisForm />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t.student.list.activeCycles}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {t.student.list.cyclesRunning.replace("{count}", mainTasks.length.toString())}
                    </p>
                </div>
                {supervisorTaskCount > 0 && (
                    <Link
                        href="/dashboard/student/main-tasks/task-suggestions"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors shadow-sm animate-pulse"
                    >
                        <Bell className="w-3.5 h-3.5" />
                        {t.student.list.suggestions.replace("{count}", supervisorTaskCount.toString())}
                    </Link>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-100">
                {mainTasks.length === 0 ? (
                    <div className="px-8 py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.student.list.noCycles}</p>
                        <p className="text-xs text-slate-300 mt-1">{t.student.list.readyToStart}</p>
                    </div>
                ) : (
                    mainTasks.map((task) => (
                        <div key={task.id} className="relative group">
                            <MainTaskCard
                                task={task}
                                thesisId={thesis.id}
                                isSupervisorAssigned={supervisorTasks.some((st) => st.id === task.id)}
                            />
                            {/* Overlay edit button to switch modal view instead of navigation */}
                            <button 
                                onClick={() => onEditClick(task)}
                                className="absolute right-[110px] top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                                title={t.student.list.editInModal}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Action */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <button
                    onClick={onCreateClick}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    {t.student.list.createNew}
                </button>
            </div>
        </div>
    );
}
