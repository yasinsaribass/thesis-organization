"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, FolderOpen, Clock, Target, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteTask } from "@/server/tasks.server";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    priority: string | null;
    created_by: string | null;
    due_date: string | null;
    suggestion_status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
}

interface MainTaskCardProps {
    task: Task;
    thesisId: string;
    isSupervisorAssigned: boolean;
}

export function MainTaskCard({ task, thesisId, isSupervisorAssigned }: MainTaskCardProps) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        setIsDeleting(true);
        const result = await deleteTask(task.id);
        if (result.error) {
            alert("Error: " + result.error);
            setIsDeleting(false);
        } else {
            router.refresh();
        }
    }

    return (
        <>
            <div className="px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition-colors group relative">
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg tracking-tight truncate">{task.title}</h3>
                        {task.suggestion_status === 'ACCEPTED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 shadow-sm animate-in fade-in zoom-in duration-500">
                                <Target className="w-3 h-3" />
                                SUPERVISOR SUGGESTION
                            </span>
                        )}
                    </div>
                    {task.description && (
                        <div className="mb-3">
                            {task.suggestion_status === 'ACCEPTED' && (
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1 block">Note from Supervisor:</span>
                            )}
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
                        </div>
                    )}
                    <div className="flex items-center gap-4">
                        {task.due_date && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(task.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-sm font-medium text-red-500 bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete this task and all its subtasks"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                        href={`/dashboard/student/main-tasks/edit-task/${task.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </Link>
                    <Link
                        href={`/dashboard/student/kanban?task_id=${task.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Open
                    </Link>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">Delete Task?</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    <span className="font-bold text-gray-700">"{task.title}"</span> and all its subtasks will be permanently deleted. This cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full pt-2">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
