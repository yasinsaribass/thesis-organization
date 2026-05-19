import { getStudentDashboardData } from "@/server/tasks.server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    MessageSquare,
    Calendar,
    User,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { TaskDetailHeader } from "@/components/Student/TaskDetailHeader";

export default async function StudentFeedbackPage({ searchParams }: { searchParams: Promise<{ task_id?: string }> }) {
    const { task_id } = await searchParams;
    const result = await getStudentDashboardData();

    if ("error" in result) {
        redirect("/auth/login");
    }

    const { mainTasks } = result as {
        mainTasks: any[];
    };

    // Filter only tasks that have feedback
    let feedbackTasks = mainTasks.filter(task => task.supervisor_feedback);

    // If a specific task_id is requested, filter for that task
    if (task_id) {
        feedbackTasks = feedbackTasks.filter(task => task.id === task_id);
        
        // Safety: If task_id is provided but no feedback exists for it, redirect to dashboard
        if (feedbackTasks.length === 0) {
            redirect("/dashboard/student");
        }
    }

    // Determine if we are viewing a single task's feedback
    const isSingleTaskView = feedbackTasks.length === 1 && task_id === feedbackTasks[0].id;
    const currentTask = isSingleTaskView ? feedbackTasks[0] : null;

    return (
        <div className="min-h-screen bg-[#f5f5f7] py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {isSingleTaskView ? (
                    <TaskDetailHeader 
                        task={currentTask} 
                        task_id={task_id!} 
                        currentView="feedback" 
                    />
                ) : (
                    <div className="mb-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <Link
                                    href="/dashboard/student"
                                    className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all hover:scale-105"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <div>
                                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Supervisor Feedback</h1>
                                    <p className="text-gray-500 font-medium mt-1">Review your supervisor's comments on your work cycles.</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-amber-50 rounded-2xl border border-amber-100 flex-shrink-0">
                                <MessageSquare className="w-5 h-5 text-amber-600" />
                                <span className="text-sm font-black text-amber-700 uppercase tracking-widest">{feedbackTasks.length} Feedbacks</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback List */}
                <div className="space-y-8">
                    {feedbackTasks.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-gray-200" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Feedback Yet</h2>
                            <p className="text-gray-400 max-w-sm mx-auto">Your supervisor hasn't provided specific feedback on your main tasks yet. They'll appear here once submitted.</p>
                        </div>
                    ) : (
                        feedbackTasks.map((task) => (
                            <div key={task.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="p-10">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 mb-1">
                                                {task.suggestion_status === 'ACCEPTED' && (
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">
                                                        Supervisor Suggested
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                                {task.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-xl">
                                            <Clock className="w-4 h-4" />
                                            Last Updated: {task.feedback_updated_at ? new Date(task.feedback_updated_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>

                                    {/* Feedback Content */}
                                    <div className="relative">
                                        <div className="absolute -left-10 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                        <div className="bg-blue-50/30 rounded-3xl p-8 border border-blue-50/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-black text-blue-700 uppercase tracking-widest">Supervisor's Evaluation</span>
                                            </div>
                                            <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                                {task.supervisor_feedback}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-end">
                                        <Link
                                            href={`/dashboard/student/kanban?task_id=${task.id}`}
                                            className="text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                                        >
                                            View Task Details
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
