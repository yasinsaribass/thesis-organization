"use client";

import { X, LayoutDashboard, Calendar } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { GanttChart } from "./GanttChart";

interface ProjectBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    thesis: { id: string; title: string };
    tasks: any[];
}

import { useLanguage } from "@/context/LanguageContext";

export function ProjectBoardModal({ 
    isOpen, 
    onClose, 
    thesis, 
    tasks 
}: ProjectBoardModalProps) {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-[#f8fafc] rounded-[3rem] w-full max-w-7xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[95vh] border border-white/20">
                
                {/* Header */}
                <div className="px-8 py-6 bg-white flex items-center justify-between border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 group-hover:rotate-6 transition-transform">
                            <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.projectBoard.title}</h2>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">{t.projectBoard.liveTimeline}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 font-mono tracking-wide mt-0.5">
                                {thesis.title}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 active:scale-95 group"
                        >
                            <span className="text-xs font-black uppercase tracking-[0.2em]">{t.projectBoard.exitBoard}</span>
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6 bg-slate-50/50">
                    <GanttChart thesis={thesis} tasks={tasks} />
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.projectBoard.completed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.projectBoard.ongoing}</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                        {t.projectBoard.version}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
}
