import { getTaskDetail } from "@/server/tasks.server";
import { redirect } from "next/navigation";
import {
    ChevronLeft,
    Plus,
    MoreHorizontal,
    LayoutDashboard,
    BarChart3,
    MessageCircle,
    Clock,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { KanbanBoard } from "@/components/Student/KanbanBoard";
import { TaskDetailHeader } from "@/components/Student/TaskDetailHeader";

interface KanbanPageProps {
    searchParams: Promise<{ task_id?: string }>;
}

export default async function KanbanPage({ searchParams }: KanbanPageProps) {
    const { task_id } = await searchParams;

    if (!task_id) {
        redirect("/dashboard/student");
    }

    const { task, subtasks, isLastGlobalTask, error } = await getTaskDetail(task_id) as any;

    if (error || !task) {
        redirect("/dashboard/student");
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <TaskDetailHeader
                task={task}
                task_id={task_id}
                currentView="kanban"
            />

            {/* Kanban Board Layout */}
            <main className="max-w-[1600px] mx-auto px-6 py-8 h-[calc(100vh-100px)] overflow-hidden">
                <KanbanBoard 
                    initialSubtasks={subtasks} 
                    taskId={task_id} 
                    isLastGlobalTask={isLastGlobalTask}
                    thesisId={task.thesis_id}
                />
            </main>
        </div>
    );
}
