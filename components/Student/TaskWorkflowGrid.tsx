"use client";

import { useState } from "react";
import { 
    ClipboardList, 
    LayoutDashboard, 
    BarChart3, 
    MessageCircle, 
    ChevronRight 
} from "lucide-react";
import { MainTasksModal } from "./MainTasksModal";

interface TaskWorkflowGridProps {
    thesis: { id: string; title: string; status: string } | null;
    mainTasks: any[];
    supervisorTasks: any[];
}

type ModalView = "list" | "create" | "edit" | "feedback";

import { useLanguage } from "@/context/LanguageContext";

export function TaskWorkflowGrid({ thesis, mainTasks, supervisorTasks }: TaskWorkflowGridProps) {
    const { t, language } = useLanguage();
    const [modalState, setModalState] = useState({ isOpen: false, view: "list" as ModalView });

    const openModal = (view: ModalView) => {
        setModalState({ isOpen: true, view });
    };

    const feedbackCount = mainTasks.filter(t => t.supervisor_feedback).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Main Tasks */}
            <button
                onClick={() => openModal("list")}
                className="bg-white group rounded-[32px] border-2 border-indigo-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-left"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ClipboardList className="w-24 h-24" />
                </div>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-2">{t.student.workflow.mainTasks}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{t.student.workflow.mainTasksSub}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        {t.student.activeCycles.replace("{count}", mainTasks.length.toString())}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </button>

            {/* 2. Kanban */}
            <button
                onClick={() => openModal("list")}
                className="bg-white group rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
            >
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-2">{t.student.workflow.kanban}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{t.student.workflow.kanbanSub}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic bg-slate-50 px-2 py-1 rounded-lg">
                        {t.student.cycleSpecific}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </button>

            {/* 3. Progress */}
            <button
                onClick={() => openModal("list")}
                className="bg-white group rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
            >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-2">{t.student.workflow.progress}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{t.student.workflow.progressSub}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic bg-slate-50 px-2 py-1 rounded-lg">
                        {t.student.milestones}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </button>

            {/* 4. Feedback */}
            <button
                onClick={() => openModal("feedback")}
                className="bg-white group rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
            >
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-black text-slate-900 text-xl mb-2">{t.student.workflow.feedback}</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{t.student.workflow.feedbackSub}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${feedbackCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {t.student.evaluations.replace("{count}", feedbackCount.toString())}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${feedbackCount > 0 ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-slate-100 text-slate-400'}`}>
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </button>

            <MainTasksModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                thesis={thesis}
                mainTasks={mainTasks}
                supervisorTasks={supervisorTasks}
                initialView={modalState.view}
            />
        </div>
    );
}
