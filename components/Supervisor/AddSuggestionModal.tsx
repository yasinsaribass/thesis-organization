"use client";

import * as React from "react";
import { X, Plus, Calendar, AlertCircle, Loader2, List, Type, FileText, ChevronDown, Trash2 } from "lucide-react";
import { suggestTask } from "@/server/supervisor.server";
import { useLanguage } from "@/context/LanguageContext";

interface AddSuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    thesisId: string;
    studentId: string;
    mainTasks: Array<{ id: string; title: string }>;
    onSuccess: () => void;
}

export function AddSuggestionModal({ isOpen, onClose, thesisId, studentId, mainTasks, onSuccess }: AddSuggestionModalProps) {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = React.useState(false);
    const [taskType, setTaskType] = React.useState<'MAIN_TASK' | 'SUBTASK'>('MAIN_TASK');
    const [selectedParentId, setSelectedParentId] = React.useState<string>("");
    const [subtasks, setSubtasks] = React.useState<Array<{ id: string; title: string; priority: string; due_date?: string }>>([]);

    const addSubtask = () => {
        setSubtasks([...subtasks, { id: Math.random().toString(36).substr(2, 9), title: "", priority: "MEDIUM" }]);
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(s => s.id !== id));
    };

    const updateSubtask = (id: string, field: string, value: string) => {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;

        if (!title.trim()) {
            alert(t.supervisor.suggestionModal.errorTitleRequired);
            setIsLoading(false);
            return;
        }

        const res = await suggestTask({
            thesis_id: thesisId,
            student_id: studentId,
            parent_task_id: taskType === 'SUBTASK' ? selectedParentId : null,
            title: title,
            description: formData.get("description") as string,
            due_date: formData.get("due_date") as string || undefined,
            priority: formData.get("priority") as string,
            subtasks: taskType === 'MAIN_TASK' ? subtasks.map(({ title, priority, due_date }) => ({ title, priority, due_date })) : undefined
        });

        setIsLoading(false);
        if (!res.error) {
            onSuccess();
            onClose();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#030213]/40 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <form onSubmit={handleSubmit}>
                    <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#030213]">{t.supervisor.suggestionModal.title}</h2>
                                <p className="text-gray-400 text-sm font-medium">{t.supervisor.suggestionModal.subtitle}</p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                        {/* Task Type Toggle */}
                        <div className="grid grid-cols-2 gap-4 p-1.5 bg-gray-50 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setTaskType('MAIN_TASK')}
                                className={`py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${taskType === 'MAIN_TASK' ? 'bg-white text-[#030213] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t.supervisor.suggestionModal.typeMain}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTaskType('SUBTASK')}
                                className={`py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${taskType === 'SUBTASK' ? 'bg-white text-[#030213] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t.supervisor.suggestionModal.typeSub}
                            </button>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t.supervisor.suggestionModal.labelTitle}</label>
                            <div className="relative group">
                                <Type className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    name="title"
                                    required
                                    placeholder={t.supervisor.suggestionModal.placeholderTitle}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-2xl text-sm font-semibold transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Parent Task Selection (only for subtasks) */}
                        {taskType === 'SUBTASK' && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t.supervisor.suggestionModal.labelGroup}</label>
                                <div className="relative">
                                    <List className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                                    <select
                                        required
                                        value={selectedParentId}
                                        onChange={(e) => setSelectedParentId(e.target.value)}
                                        className="w-full pl-14 pr-12 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-2xl text-sm font-semibold transition-all outline-none appearance-none"
                                    >
                                        <option value="">{t.supervisor.suggestionModal.placeholderGroup}</option>
                                        {mainTasks.map(t => (
                                            <option key={t.id} value={t.id}>{t.title}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t.supervisor.suggestionModal.labelInstructions}</label>
                            <div className="relative group">
                                <FileText className="absolute left-5 top-5 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder={t.supervisor.suggestionModal.placeholderInstructions}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-2xl text-sm font-semibold transition-all outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className={`${taskType === 'SUBTASK' ? 'grid grid-cols-2' : 'block'} gap-6`}>
                            {/* Deadline */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t.supervisor.suggestionModal.labelDeadline}</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="due_date"
                                        type="date"
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-2xl text-sm font-semibold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Priority - Only for individual subtasks */}
                            {taskType === 'SUBTASK' ? (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t.supervisor.suggestionModal.labelPriority}</label>
                                    <div className="relative">
                                        <AlertCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                                        <select
                                            name="priority"
                                            defaultValue="MEDIUM"
                                            className="w-full pl-14 pr-12 py-4 bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-2xl text-sm font-semibold transition-all outline-none appearance-none"
                                        >
                                            <option value="LOW">{t.student.forms.taskForm.priorities.low}</option>
                                            <option value="MEDIUM">{t.student.forms.taskForm.priorities.medium}</option>
                                            <option value="HIGH">{t.student.forms.taskForm.priorities.high}</option>
                                            <option value="URGENT">{t.student.forms.taskForm.priorities.urgent}</option>
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                            ) : (
                                <input type="hidden" name="priority" value="MEDIUM" />
                            )}
                        </div>

                        {/* Subtasks Section (Only for Main Task) */}
                        {taskType === 'MAIN_TASK' && (
                            <div className="space-y-6 pt-4 border-t border-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-[#030213] uppercase tracking-wider">{t.supervisor.suggestionModal.labelSubtasks}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">{t.supervisor.suggestionModal.subtasksDesc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSubtask}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black hover:bg-blue-100 transition-all uppercase tracking-widest"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        {t.supervisor.suggestionModal.btnAddItem}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {subtasks.map((sub, index) => (
                                        <div key={sub.id} className="relative group/sub animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex gap-4 p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all">
                                                <div className="flex-1 space-y-4">
                                                    <input
                                                        placeholder={t.supervisor.suggestionModal.placeholderSubTitle.replace("#{index}", (index + 1).toString())}
                                                        value={sub.title}
                                                        onChange={(e) => updateSubtask(sub.id, 'title', e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 text-sm font-bold placeholder:text-gray-300 outline-none focus:ring-0"
                                                        required
                                                    />
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 relative">
                                                            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                                                            <input
                                                                type="date"
                                                                value={sub.due_date || ""}
                                                                onChange={(e) => updateSubtask(sub.id, 'due_date', e.target.value)}
                                                                className="w-full pl-6 bg-transparent border-none p-0 text-[10px] font-black uppercase text-gray-500 outline-none"
                                                            />
                                                        </div>
                                                        <div className="flex-1 relative">
                                                            <AlertCircle className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                                                            <select
                                                                value={sub.priority}
                                                                onChange={(e) => updateSubtask(sub.id, 'priority', e.target.value)}
                                                                className="w-full pl-6 bg-transparent border-none p-0 text-[10px] font-black uppercase text-gray-500 outline-none appearance-none cursor-pointer"
                                                            >
                                                                <option value="LOW">{t.student.forms.taskForm.priorities.low}</option>
                                                                <option value="MEDIUM">{t.student.forms.taskForm.priorities.medium}</option>
                                                                <option value="HIGH">{t.student.forms.taskForm.priorities.high}</option>
                                                                <option value="URGENT">{t.student.forms.taskForm.priorities.urgent}</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubtask(sub.id)}
                                                    className="p-2 h-fit rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/sub:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {subtasks.length === 0 && (
                                        <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                                            <p className="text-xs font-bold text-gray-300">{t.supervisor.suggestionModal.noSubtasks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-gray-50 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                        >
                            {t.supervisor.suggestionModal.btnCancel}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {isLoading ? t.supervisor.suggestionModal.btnSending : t.supervisor.suggestionModal.btnSend}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
