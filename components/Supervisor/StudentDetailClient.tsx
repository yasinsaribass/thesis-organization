"use client";

import * as React from "react";
import Link from "next/link";
import {
    ChevronLeft,
    Plus,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    MessageSquare,
    MoreVertical,
    Check,
    X,
    User,
    GraduationCap,
    ArrowRight,
    FileText
} from "lucide-react";
import { suggestTask } from "@/server/supervisor.server";
import { useRouter } from "next/navigation";
import { AddSuggestionModal } from "./AddSuggestionModal";
import { TaskFeedback } from "./TaskFeedback";
import { MessagesModal } from "../Student/MessagesModal";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: string;
    due_date: string | null;
    created_at: string;
    created_by: string;
    parent_task_id: string | null;
    suggestion_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
    supervisor_feedback: string | null;
    subtasks?: Task[];
}

interface StudentDetailClientProps {
    student: any;
    thesis: any;
    mainTasks: Task[];
    suggestions: Task[];
    supervisorId: string;
    templates: any[];
    chatData?: {
        messages: any[];
        currentUserId: string;
        otherUserId: string;
        otherUserName: string;
    };
}

import { useLanguage } from "@/context/LanguageContext";

export function StudentDetailClient({ student, thesis, mainTasks, suggestions, supervisorId, templates, chatData }: StudentDetailClientProps) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isMessagesModalOpen, setIsMessagesModalOpen] = React.useState(false);
    const [expandedTasks, setExpandedTasks] = React.useState<string[]>([]);
    const [activeTab, setActiveTab] = React.useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

    // Progress Calculation
    const allSubtasks = mainTasks.flatMap(m => m.subtasks || []);
    const completedSubtasks = allSubtasks.filter(s => s.status === 'DONE').length;
    const totalSubtasksCount = allSubtasks.length;
    const progressPercent = totalSubtasksCount > 0 ? Math.round((completedSubtasks / totalSubtasksCount) * 100) : 0;

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    const filteredSuggestions = suggestions.filter(s => s.suggestion_status === activeTab);

    return (
        <div className="min-h-screen bg-[#f8f9fb] pb-20">
            <AddSuggestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                thesisId={thesis?.id}
                studentId={student.id}
                mainTasks={mainTasks.map(m => ({ id: m.id, title: m.title }))}
                onSuccess={() => router.refresh()}
            />

            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/dashboard/supervisor"
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#030213] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {t.supervisor.studentDetail.back}
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/dashboard/supervisor/feedback-templates?studentId=${student.id}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl text-sm font-black hover:bg-amber-600 hover:text-white transition-all shadow-lg shadow-amber-100"
                        >
                            <FileText className="w-4 h-4" />
                            {t.supervisor.studentDetail.useTemplates}
                        </Link>
                        <button
                            onClick={() => setIsMessagesModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-sky-50 text-sky-600 rounded-xl text-sm font-black hover:bg-sky-600 hover:text-white transition-all shadow-lg shadow-sky-100"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {t.supervisor.studentDetail.message}
                        </button>
                        <Link
                            href={`/dashboard/supervisor/consultations`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-black hover:bg-purple-600 hover:text-white transition-all shadow-lg shadow-purple-100"
                        >
                            <User className="w-4 h-4" />
                            CONSULTATIONS
                        </Link>
                        <Link
                            href={`/dashboard/supervisor/students/${student.id}/documents`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-black hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-100"
                        >
                            <FileText className="w-4 h-4" />
                            DOCUMENTS
                        </Link>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            <Plus className="w-4 h-4" />
                            {t.supervisor.studentDetail.addTask}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8 space-y-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                {student.user_profiles?.avatar_url ? (
                                    <img src={student.user_profiles.avatar_url} alt="" className="w-full h-full rounded-3xl object-cover" />
                                ) : (
                                    <User className="w-10 h-10" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-[#030213] mb-2">
                                    {student.user_profiles?.name} {student.user_profiles?.surname}
                                </h1>
                                <p className="text-gray-400 font-medium text-lg leading-relaxed">
                                    {thesis?.title || t.supervisor.studentDetail.noThesis}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.supervisor.studentDetail.overallProgress}</span>
                                <span className="text-sm font-black text-indigo-600">{progressPercent}%</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{t.supervisor.studentDetail.completedSubtasks}</span>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-[#030213]">{completedSubtasks}</span>
                                <span className="text-xl font-bold text-gray-300 mb-1">/ {totalSubtasksCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Tasks Overview */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-black text-[#030213] tracking-tight ml-4">{t.supervisor.studentDetail.mainTasksOverview}</h2>
                    <div className="space-y-4">
                        {mainTasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                                <div
                                    onClick={() => toggleExpand(task.id)}
                                    className="p-8 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-[#030213]">{task.title}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${task.created_by === supervisorId ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {task.created_by === supervisorId ? t.supervisor.studentDetail.supervisorSuggested : t.supervisor.studentDetail.studentCreated}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                                                    {task.subtasks?.length ? Math.round((task.subtasks.filter(s => s.status === 'DONE').length / task.subtasks.length) * 100) : (task.status === 'DONE' ? 100 : 0)}%
                                                </span>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all"
                                                        style={{ width: `${task.subtasks?.length ? (task.subtasks.filter(s => s.status === 'DONE').length / task.subtasks.length) * 100 : (task.status === 'DONE' ? 100 : 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                {task.subtasks?.length || 0} {t.supervisor.studentDetail.subtasks}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-white transition-colors">
                                            {expandedTasks.includes(task.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {expandedTasks.includes(task.id) && (
                                    <div className="px-8 pb-8 space-y-2 divide-y divide-gray-50">
                                        {task.subtasks?.map((sub) => (
                                            <div key={sub.id} className="py-6 flex items-center justify-between first:pt-0">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub.status === 'DONE' ? 'bg-green-50 text-green-600' :
                                                        sub.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        {sub.status === 'DONE' ? <CheckCircle2 className="w-5 h-5" /> :
                                                            sub.status === 'IN_PROGRESS' ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-base font-bold text-[#030213]">{sub.title}</span>
                                                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${sub.created_by === supervisorId ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                                                }`}>
                                                                {sub.created_by === supervisorId ? t.supervisor.studentDetail.supervisorSuggested : t.supervisor.studentDetail.studentCreated}
                                                            </span>
                                                        </div>
                                                        {sub.due_date && (
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {t.supervisor.studentDetail.deadline}: {new Date(sub.due_date).toLocaleDateString(language === 'LV' ? 'lv-LV' : 'en-GB')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${sub.status === 'DONE' ? 'bg-green-100/50 text-green-700' :
                                                        sub.status === 'IN_PROGRESS' ? 'bg-indigo-100/50 text-indigo-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {sub.status ? (t.projectBoard as any)[sub.status.toLowerCase()] || sub.status.replace('_', ' ') : t.projectBoard.todo}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!task.subtasks || task.subtasks.length === 0) && (
                                            <div className="py-10 text-center">
                                                <p className="text-sm font-bold text-gray-400 italic">{t.supervisor.studentDetail.noSubtasks}</p>
                                            </div>
                                        )}

                                        {/* Task Feedback Section */}
                                        <TaskFeedback
                                            taskId={task.id}
                                            studentId={student.id}
                                            initialFeedback={task.supervisor_feedback}
                                            templates={templates}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Suggestion Activity Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-black text-[#030213] tracking-tight ml-4">{t.supervisor.studentDetail.suggestionActivity}</h2>
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        {/* Status Tabs */}
                        <div className="px-8 pt-8 flex items-center gap-3">
                            {(['PENDING', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setActiveTab(status)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${activeTab === status
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {(t.projectBoard as any)[status.toLowerCase()] || status}
                                </button>
                            ))}
                        </div>

                        <div className="p-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.supervisor.studentDetail.table.title}</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.supervisor.studentDetail.table.type}</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.supervisor.studentDetail.table.dateSent}</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.supervisor.studentDetail.table.status}</th>
                                        <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredSuggestions.map((s) => (
                                        <tr key={s.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-bold text-[#030213]">{s.title}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    {s.parent_task_id ? t.supervisor.studentDetail.table.subtask : t.supervisor.studentDetail.table.mainTask}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-medium text-gray-500">{new Date(s.created_at).toLocaleDateString(language === 'LV' ? 'lv-LV' : 'en-GB')}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${s.suggestion_status === 'ACCEPTED' ? 'bg-green-100/50 text-green-700' :
                                                    s.suggestion_status === 'REJECTED' ? 'bg-red-100/50 text-red-700' : 'bg-amber-100/50 text-amber-700'
                                                    }`}>
                                                    {(t.projectBoard as any)[s.suggestion_status?.toLowerCase() || 'pending']}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSuggestions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                        <Clock className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                                        {t.supervisor.studentDetail.noSuggestions.replace("{status}", (t.projectBoard as any)[activeTab.toLowerCase()] || activeTab.toLowerCase())}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
            
            {chatData && (
                <MessagesModal 
                    isOpen={isMessagesModalOpen}
                    onClose={() => setIsMessagesModalOpen(false)}
                    currentUserId={chatData.currentUserId}
                    otherUserId={chatData.otherUserId}
                    otherUserName={chatData.otherUserName}
                    initialMessages={chatData.messages}
                />
            )}
        </div>
    );
}
