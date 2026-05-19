"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2, Check, FileText } from "lucide-react";
import { updateTaskFeedback } from "@/server/supervisor.server";
import { createFeedbackTemplate } from "@/server/feedback-templates.server";
import { useRouter } from "next/navigation";

interface TaskFeedbackProps {
    taskId: string;
    studentId: string;
    initialFeedback: string | null;
    templates?: { id: string; title: string; content: string; category: string }[];
}

import { useLanguage } from "@/context/LanguageContext";

export function TaskFeedback({ taskId, studentId, initialFeedback, templates = [] }: TaskFeedbackProps) {
    const { t } = useLanguage();
    const [feedback, setFeedback] = useState(initialFeedback || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const router = useRouter();

    const handleSaveTemplate = async () => {
        if (!feedback.trim()) return;
        const title = prompt(t.supervisor.taskFeedback.promptTemplateTitle);
        if (!title) return;

        setIsSavingTemplate(true);
        const res = await createFeedbackTemplate({ title, content: feedback });
        setIsSavingTemplate(false);

        if (res.success) {
            alert(t.supervisor.taskFeedback.templateSaved);
            router.refresh(); // Refresh to update the templates prop
        } else {
            alert(res.error || "Failed to save template");
        }
    };

    const handleSave = async () => {
        if (!feedback.trim()) return;

        setIsSaving(true);
        const res = await updateTaskFeedback(taskId, feedback, studentId);
        setIsSaving(false);

        if (res.success) {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            router.refresh();
        } else {
            alert(res.error || "Failed to save feedback");
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-[0.1em]">{t.supervisor.taskFeedback.title}</h4>
                </div>
                
                <button
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate || !feedback.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t.supervisor.taskFeedback.btnSaveTemplate}
                >
                    {isSavingTemplate ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <FileText className="w-3 h-3" />
                    )}
                    {t.supervisor.taskFeedback.btnSaveTemplate}
                </button>
            </div>

            <div className="relative group">
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t.supervisor.taskFeedback.placeholder}
                    className="w-full min-h-[120px] p-6 rounded-[1.5rem] bg-amber-50/40 border-2 border-transparent focus:border-amber-400 focus:bg-white outline-none transition-all text-sm font-medium text-gray-700 leading-relaxed resize-none"
                />

                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {isSaved && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                            <Check className="w-3 h-3" />
                            {t.supervisor.taskFeedback.saved}
                        </div>
                    )}
                    
                    <div className="relative group/template list-none">
                        <button className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm">
                            <FileText className="w-3 h-3" />
                            {t.supervisor.taskFeedback.btnUseTemplate}
                        </button>
                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border border-gray-100 opacity-0 invisible group-hover/template:opacity-100 group-hover/template:visible transition-all z-20 overflow-hidden transform origin-bottom-right scale-95 group-hover/template:scale-100">
                            <div className="max-h-64 overflow-y-auto p-2">
                                {templates.length > 0 ? (
                                    templates.map(t_item => (
                                        <button
                                            key={t_item.id}
                                            onClick={() => setFeedback(prev => t_item.content)}
                                            className="w-full text-left p-3 hover:bg-amber-50 rounded-lg transition-colors group/item"
                                        >
                                            <div className="text-xs font-bold text-gray-900 mb-1">{t_item.title}</div>
                                            <div className="text-[10px] text-gray-400 font-medium line-clamp-2">{t_item.content}</div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-xs text-gray-500 font-medium mb-2">{t.supervisor.taskFeedback.noTemplates}</p>
                                        <a href="/dashboard/supervisor/feedback-templates" className="text-[10px] uppercase font-bold text-amber-600 hover:underline">
                                            {t.supervisor.taskFeedback.createTemplate}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || feedback === (initialFeedback || "")}
                        className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 shadow-md shadow-amber-500/20 disabled:shadow-none disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Send className="w-3 h-3" />
                        )}
                        {initialFeedback ? t.supervisor.taskFeedback.btnUpdate : t.supervisor.taskFeedback.btnSend}
                    </button>
                </div>
            </div>
        </div>
    );
}
