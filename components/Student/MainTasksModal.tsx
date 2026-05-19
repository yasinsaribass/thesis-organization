"use client";

import { X, ClipboardList, Loader2, MessageCircle, Clock, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { MainTaskList } from "./MainTaskList";
import { CreateTaskForm } from "./CreateTaskForm";
import { EditTaskForm } from "./EditTaskForm";
import { getTaskDetail } from "@/server/tasks.server";
import { useRouter } from "next/navigation";

interface MainTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
    thesis: { id: string; title: string; status: string } | null;
    mainTasks: any[];
    supervisorTasks: any[];
    initialView?: ModalView;
}

type ModalView = "list" | "create" | "edit" | "feedback";

import { useLanguage } from "@/context/LanguageContext";

export function MainTasksModal({ 
    isOpen, 
    onClose, 
    thesis, 
    mainTasks, 
    supervisorTasks,
    initialView = "list"
}: MainTasksModalProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [view, setView] = useState<ModalView>(initialView);
    const [selectedTaskData, setSelectedTaskData] = useState<{task: any, subtasks: any[]} | null>(null);
    const [isLoadingTask, setIsLoadingTask] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Reset view when modal opens
    useEffect(() => {
        if (isOpen) setView(initialView);
    }, [isOpen, initialView]);


    if (!isOpen || !mounted) return null;

    async function handleEditClick(task: any) {
        setIsLoadingTask(true);
        try {
            const data = await getTaskDetail(task.id) as any;
            if (data.task) {
                setSelectedTaskData({ task: data.task, subtasks: data.subtasks });
                setView("edit");
            }
        } catch (error) {
            console.error("Failed to fetch task details", error);
        } finally {
            setIsLoadingTask(false);
        }
    }

    const handleSuccess = () => {
        setView("list");
        router.refresh();
    };

    return createPortal(
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget && view === "list") onClose();
            }}
        >
            <div className="bg-[#fcfcfd] rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh] border border-white/40">
                
                {/* Global Modal Header (Minimal) */}
                <div className="absolute top-6 right-8 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-900 transition-all border border-slate-100 shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Context Info (Floating Top Left) */}
                <div className="absolute top-8 left-8 z-50 pointer-events-none hidden md:block">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                             <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white/80 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm backdrop-blur-sm">
                            {t.student.modals.missionControl} / {view === 'list' ? t.student.modals.cycles : view === 'create' ? t.student.modals.designing : view === 'edit' ? t.student.modals.refining : t.student.modals.supervisorEvaluations}
                        </span>
                     </div>
                </div>

                {/* Content Container */}
                <div className="flex-1 relative overflow-hidden mt-2">
                    {isLoadingTask && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t.student.modals.syncing}</span>
                            </div>
                        </div>
                    )}

                    {view === "list" && (
                        <div className="h-full p-4 md:p-8 pt-20">
                            <MainTaskList 
                                thesis={thesis} 
                                mainTasks={mainTasks} 
                                supervisorTasks={supervisorTasks}
                                onCreateClick={() => setView("create")}
                                onEditClick={handleEditClick}
                            />
                        </div>
                    )}

                    {view === "create" && (
                        <div className="h-full p-4 md:p-8 pt-20">
                            <CreateTaskForm 
                                thesisId={thesis?.id || ""} 
                                onSuccess={handleSuccess}
                                onBack={() => setView("list")}
                            />
                        </div>
                    )}

                    {view === "feedback" && (
                        <div className="h-full p-4 md:p-8 pt-20 overflow-y-auto">
                            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">{t.student.modals.supervisorEvaluations}</h2>
                                    <p className="text-slate-400 font-medium">{t.student.modals.evaluationsDesc}</p>
                                </div>
                                
                                {mainTasks.filter(t => t.supervisor_feedback).length === 0 ? (
                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 text-center shadow-sm">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <MessageCircle className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t.student.modals.noEvaluations}</h3>
                                        <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">{t.student.modals.noEvaluationsDesc}</p>
                                    </div>
                                ) : (
                                    mainTasks.filter(t => t.supervisor_feedback).map((task) => (
                                        <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h4 className="text-xl font-black text-slate-900 mb-1">{task.title}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {t.student.modals.cycleFeedback}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => router.push(`/dashboard/student/kanban?task_id=${task.id}`)}
                                                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group"
                                                >
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            </div>
                                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50 relative">
                                                <div className="absolute -left-2 top-6 bottom-6 w-1 bg-indigo-500 rounded-full" />
                                                <p className="text-slate-600 font-medium leading-relaxed italic">
                                                    "{task.supervisor_feedback}"
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}


                    {view === "edit" && selectedTaskData && (
                        <div className="h-full p-4 md:p-8 pt-20 overflow-y-auto">
                            {/* We wrap EditTaskForm but we need to pass a way to go back/success */}
                            {/* Since EditTaskForm is a complex component, I'll pass a custom property if I can, or just let it redirect as it does now */}
                            {/* Strategy: In modal mode, it should probably call a callback instead of router.push */}
                           
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
                                <div className="px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                                    <button onClick={() => setView("list")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                        <X className="w-4 h-4" /> {t.student.modals.backToCycles}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {/* Wrapping the existing page-like component might need CSS overrides */}
                                    <div className="modal-edit-form-wrapper">
                                        <EditTaskForm 
                                            task={selectedTaskData.task} 
                                            initialSubtasks={selectedTaskData.subtasks}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Legend / Info Footer */}
                <div className="px-10 py-4 bg-white border-t border-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] shrink-0">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"/> {t.student.modals.mainTask}</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> {t.student.modals.subtask}</span>
                    </div>
                    <span>{t.student.modals.versionInfo}</span>
                </div>
            </div>

            <style jsx global>{`
                .modal-edit-form-wrapper .min-h-screen {
                    min-height: auto !important;
                    background: transparent !important;
                    padding: 2rem 1rem !important;
                }
                .modal-edit-form-wrapper .max-w-3xl {
                    max-width: 100% !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 0 !important;
                }
            `}</style>
        </div>,
        document.body
    );
}
