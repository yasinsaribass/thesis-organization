import { getTaskDetail } from "@/server/tasks.server";
import { EditTaskForm } from "@/components/Student/EditTaskForm";
import { redirect } from "next/navigation";

interface EditTaskPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
    const { id } = await params;

    const { task, subtasks, error } = await getTaskDetail(id) as any;

    if (error || !task) {
        redirect("/dashboard/student/main-tasks");
    }

    return (
        <EditTaskForm
            task={task}
            initialSubtasks={subtasks}
        />
    );
}

