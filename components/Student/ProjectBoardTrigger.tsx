"use client";

import { useState } from "react";
import { BarChart3, ChevronRight } from "lucide-react";
import { ProjectBoardModal } from "./ProjectBoardModal";

interface ProjectBoardTriggerProps {
    thesis: { id: string; title: string };
    tasks: any[];
}

import { useLanguage } from "@/context/LanguageContext";

export function ProjectBoardTrigger({ thesis, tasks }: ProjectBoardTriggerProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-10 w-full mt-2">
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between bg-white text-indigo-600 border-2 border-indigo-100/60 hover:border-indigo-300 hover:bg-indigo-50/50 px-8 py-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all duration-300 font-bold text-lg group overflow-hidden relative text-left"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-20 transition-transform group-hover:scale-110"></div>
                <div className="absolute bottom-0 left-20 w-32 h-32 bg-sky-50 rounded-full blur-3xl transition-transform group-hover:scale-150"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl group-hover:bg-white group-hover:text-indigo-600 transition-colors shadow-inner">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-900">{t.projectBoard.triggerTitle}</span>
                        <span className="text-sm font-medium text-indigo-400 group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{t.projectBoard.triggerSub}</span>
                    </div>
                </div>
                
                <div className="p-3 rounded-full group-hover:bg-indigo-100 transition-colors relative z-10">
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </div>
            </button>

            <ProjectBoardModal 
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                thesis={thesis}
                tasks={tasks}
            />
        </div>
    );
}
