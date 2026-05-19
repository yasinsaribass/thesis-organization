import { getTaskDetail } from "@/server/tasks.server";
import { redirect } from "next/navigation";
import {
    ChevronLeft,
    BarChart3,
    LayoutDashboard,
    MessageCircle,
    Trophy,
    Target,
    Zap,
    History,
    CheckCircle2,
    Clock,
    Calendar,
    AlertCircle
} from "lucide-react";
import { TaskDetailHeader } from "@/components/Student/TaskDetailHeader";

interface ProgressPageProps {
    searchParams: Promise<{ task_id?: string }>;
}

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
    const { task_id } = await searchParams;

    if (!task_id) {
        redirect("/dashboard/student");
    }

    const { task, subtasks, error } = await getTaskDetail(task_id) as any;

    if (error || !task) {
        redirect("/dashboard/student");
    }

    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter((s: any) => s.status === "DONE").length;
    const completionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // 1. Focus Level Logic
    const inProgressCount = subtasks.filter((s: any) => s.status === "IN_PROGRESS").length;
    let focusLevel = "Planning Mode";
    if (inProgressCount === 1) focusLevel = "Laser Focused";
    else if (inProgressCount >= 2 && inProgressCount <= 3) focusLevel = "Balanced Output";
    else if (inProgressCount > 3) focusLevel = "High Multi-tasking";

    // 2. Active Velocity Logic (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7DaysDone = subtasks.filter((s: any) =>
        s.status === "DONE" && s.completed_at && new Date(s.completed_at) >= sevenDaysAgo
    ).length;
    const velocity = Number((last7DaysDone / 7).toFixed(2));

    // 3. Estimated End Logic
    const remainingTasks = subtasks.filter((s: any) => s.status !== "DONE").length;
    let estimatedEnd = "Need more data";

    if (velocity > 0) {
        const daysRemaining = Math.ceil(remainingTasks / velocity);
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + daysRemaining);
        estimatedEnd = estDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } else if (task.due_date) {
        estimatedEnd = new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }



    // 5. Priority Mix Logic
    const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
    const priorityColors: Record<string, string> = {
        URGENT: 'bg-rose-500',
        HIGH: 'bg-amber-500',
        MEDIUM: 'bg-blue-500',
        LOW: 'bg-emerald-500'
    };

    const priorityDistribution = priorities.map(p => ({
        label: p,
        count: subtasks.filter((s: any) => s.priority === p).length,
        color: priorityColors[p]
    }));

    const totalPriorityTasks = subtasks.length || 1;

    // 6. Time Integrity (Risk Assessment)
    let integrityStatus = "ON TRACK";
    let integrityColor = "text-emerald-600 bg-emerald-50";

    if (velocity > 0) {
        const daysToDue = task.due_date ? Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
        const daysNeeded = Math.ceil(remainingTasks / velocity);

        if (daysNeeded > daysToDue) {
            integrityStatus = "AT RISK";
            integrityColor = "text-rose-600 bg-rose-50";
        } else if (daysNeeded > daysToDue * 0.8) {
            integrityStatus = "NEEDS FOCUS";
            integrityColor = "text-amber-600 bg-amber-50";
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <TaskDetailHeader 
                task={task} 
                task_id={task_id} 
                currentView="progress" 
            />

            <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Hero Analytics: Overall Completion */}
                    <div className="lg:col-span-4">
                        <div
                            className="bg-[#030213] rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col items-center justify-center h-full min-h-[400px]"
                            title="Represents the total completion percentage of all subtasks for this main task."
                        >
                            <div className="relative w-48 h-48 mb-8">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" strokeWidth="14" fill="transparent" className="text-white/5" stroke="currentColor" />
                                    <circle
                                        cx="96" cy="96" r="88" strokeWidth="14" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 88}
                                        strokeDashoffset={2 * Math.PI * 88 * (1 - completionRate / 100)}
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round" stroke="currentColor"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-white tracking-tighter">{completionRate}</span>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Percent Done</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-white mb-2">Overall Progress</h3>
                                <p className="text-sm text-white/50 font-medium">
                                    {completedSubtasks} of {totalSubtasks} milestones achieved
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Analytics: Priority & Metrics */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Priority Mix */}
                        <div
                            className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/20 flex-1"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-[#030213] tracking-tight">Priority Distribution</h4>
                                    <p className="text-sm text-gray-400 font-medium">Urgency breakdown of all tasks</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="h-6 w-full bg-gray-50 rounded-full flex overflow-hidden shadow-inner border border-gray-100">
                                    {priorityDistribution.map((p, i) => (
                                        <div
                                            key={i}
                                            className={`${p.color} transition-all duration-500 hover:brightness-110`}
                                            style={{ width: `${(p.count / totalPriorityTasks) * 100}%` }}
                                        />
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                                    {priorityDistribution.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${p.color}`} />
                                            <div>
                                                <p className="text-[10px] font-black text-[#030213] uppercase tracking-widest leading-none mb-1">{p.label}</p>
                                                <p className="text-xs text-gray-400 font-bold">{p.count} Items</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-700/50 uppercase tracking-widest">Focus Level</p>
                                    <p className="text-lg font-black text-emerald-900">{focusLevel}</p>
                                </div>
                            </div>

                            <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-700/50 uppercase tracking-widest">Predicted Finish</p>
                                    <p className="text-lg font-black text-amber-900">{estimatedEnd}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtask Breakdown */}
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 px-1">
                    <History className="w-5 h-5 text-gray-400" />
                    Subtask Breakdown
                </h2>

                {subtasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subtasks.map((s: any) => {
                            const isDone = s.status === 'DONE';
                            const pColors: Record<string, { bg: string, text: string }> = {
                                URGENT: { bg: 'bg-rose-50', text: 'text-rose-600' },
                                HIGH: { bg: 'bg-amber-50', text: 'text-amber-600' },
                                MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-600' },
                                LOW: { bg: 'bg-emerald-50', text: 'text-emerald-600' }
                            };
                            const pColor = pColors[s.priority] || pColors['MEDIUM'];

                            return (
                                <div
                                    key={s.id}
                                    className={`relative bg-white/60 backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDone ? 'border-emerald-100/50 hover:border-emerald-200' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    {/* Status Icon Background Glow */}
                                    <div className={`absolute top-0 right-0 p-8 transform rotate-12 opacity-[0.03] pointer-events-none ${isDone ? 'text-emerald-500' : 'text-gray-900'}`}>
                                        {isDone ? <CheckCircle2 className="w-24 h-24" /> : <Clock className="w-24 h-24" />}
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-base tracking-tight mb-2 ${isDone ? 'text-gray-400 line-through decoration-gray-300' : 'text-[#030213]'}`}>
                                                    {s.title}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${pColor.bg} ${pColor.text}`}>
                                                    <AlertCircle className="w-3 h-3" />
                                                    {s.priority} PRIORITY
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {isDone ? 'Finished: ' : 'Target: '}
                                                <span className={isDone ? 'text-emerald-600' : 'text-gray-600'}>
                                                    {isDone && s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) :
                                                        s.due_date ? new Date(s.due_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : 'No Date Set'}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest transition-colors ${isDone ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}>
                                                {s.status?.replace('_', ' ') || "TODO"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                        <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-[#030213] mb-2">No Subtasks Yet</h3>
                        <p className="text-sm text-gray-400 font-medium">Break down this main task into smaller, actionable steps.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
