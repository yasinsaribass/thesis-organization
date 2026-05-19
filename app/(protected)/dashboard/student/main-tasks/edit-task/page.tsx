"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateMainTask, deleteTask, getTaskDetail } from "@/server/tasks.server";

const schema = z.object({
    title: z.string().min(1, "Title is required").max(120),
    description: z.string().max(500).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function EditTaskPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const taskId = searchParams.get("id") ?? "";

    const [serverError, setServerError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [taskTitle, setTaskTitle] = React.useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    // Load task data
    React.useEffect(() => {
        if (!taskId) return;
        getTaskDetail(taskId).then((result) => {
            if ("error" in result) return;
            const { task } = result;
            setTaskTitle(task.title);
            reset({
                title: task.title,
                description: task.description ?? "",
                status: (task.status as FormValues["status"]) ?? "TODO",
                priority: (task.priority as FormValues["priority"]) ?? "MEDIUM",
            });
        });
    }, [taskId, reset]);

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        setServerError(null);

        const result = await updateMainTask({ id: taskId, ...values });

        if (result.error) {
            setServerError(result.error);
            setIsLoading(false);
        } else {
            router.push("/dashboard/student/main-tasks");
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this task?")) return;
        setIsDeleting(true);
        const result = await deleteTask(taskId);
        if (result.error) {
            setServerError(result.error);
            setIsDeleting(false);
        } else {
            router.push("/dashboard/student/main-tasks");
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/student/main-tasks"
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Task</h1>
                            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-64">{taskTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-100 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Delete
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            disabled={isLoading}
                            {...register("title")}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            disabled={isLoading}
                            {...register("description")}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 resize-none"
                        />
                    </div>

                    {/* Status + Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select
                                id="status"
                                disabled={isLoading}
                                {...register("status")}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                            <select
                                id="priority"
                                disabled={isLoading}
                                {...register("priority")}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Server Error */}
                    {serverError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                            {serverError}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Link
                            href="/dashboard/student/main-tasks"
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 text-center hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
