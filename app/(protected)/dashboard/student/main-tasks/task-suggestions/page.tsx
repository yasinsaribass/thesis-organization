import Link from "next/link";
import { ArrowLeft, Bell, CheckCircle2 } from "lucide-react";
import { getStudentDashboardData } from "@/server/tasks.server";
import { redirect } from "next/navigation";

export default async function TaskSuggestionsPage() {
    const result = await getStudentDashboardData();

    if ("error" in result) {
        redirect("/auth/login");
    }

    const { supervisorTasks } = result as {
        supervisorTasks: Array<{ id: string; title: string; description: string | null; status: string | null; priority: string | null; due_date: string | null; parent_task_id?: string | null }>;
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/student/main-tasks"
                            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Supervisor Suggestions</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Tasks assigned to you by your supervisor</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-blue-50 rounded-full border border-blue-100 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">{supervisorTasks.length} New</span>
                    </div>
                </div>

                {/* Suggestions List */}
                <div className="space-y-4">
                    {supervisorTasks.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">All caught up!</p>
                            <p className="text-gray-400 text-sm mt-1">No pending suggestions from your supervisor.</p>
                        </div>
                    ) : (
                        supervisorTasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-gray-900 text-lg">{task.title}</h3>
                                        {task.parent_task_id && task.priority && (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 tracking-wider">
                                                {task.priority}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">
                                        {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No deadline'}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    {task.description || "No specific instructions provided. Contact your supervisor for more details."}
                                </p>
                                <div className="mt-auto">
                                    <SuggestionActions taskId={task.id} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

import { SuggestionActions } from "@/components/Student/SuggestionActions";
