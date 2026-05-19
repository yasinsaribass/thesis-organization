"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Plus, Trash2, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { updateMainTask, deleteTask } from "@/server/tasks.server";

const subtaskSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Subtask title is required"),
    due_date: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

const schema = z.object({
    title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
    description: z.string().max(500).optional().nullable(),
    subtasks: z.array(subtaskSchema),
});

type FormValues = z.infer<typeof schema>;

interface EditTaskFormProps {
    task: {
        id: string;
        title: string;
        description: string | null;
        thesis_id: string;
    };
    initialSubtasks: Array<{
        id: string;
        title: string;
        description: string | null;
        due_date: string | null;
        priority: string | null;
    }>;
}

import { useLanguage } from "@/context/LanguageContext";

export function EditTaskForm({ task, initialSubtasks }: EditTaskFormProps) {
    const { t } = useLanguage();
    const router = useRouter();

    // Schema with localized messages
    const subtaskSchema = z.object({
        id: z.string().uuid().optional(),
        title: z.string().min(1, t.student.forms.taskForm.validation.subtaskRequired),
        due_date: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    });

    const schema = z.object({
        title: z.string().min(1, t.student.forms.taskForm.validation.titleRequired).max(120, t.student.forms.taskForm.validation.titleMax),
        description: z.string().max(500).optional().nullable(),
        subtasks: z.array(subtaskSchema),
    });

    const [serverError, setServerError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: task.title,
            description: task.description,
            subtasks: initialSubtasks.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                due_date: s.due_date ? s.due_date.split('T')[0] : "",
                priority: (s.priority as any) || "MEDIUM",
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "subtasks",
    });

    async function onSubmit(values: FormValues) {
        setIsLoading(true);
        setServerError(null);

        const result = await updateMainTask({
            id: task.id,
            title: values.title,
            description: values.description,
            thesis_id: task.thesis_id,
            subtasks: values.subtasks,
        });

        if (result.error) {
            setServerError(result.error);
            setIsLoading(false);
        } else {
            router.push("/dashboard/student/main-tasks");
        }
    }

    async function handleDeleteMainTask() {
        setIsDeleting(true);
        const result = await deleteTask(task.id);
        if (result.error) {
            alert("Error: " + result.error);
            setIsDeleting(false);
        } else {
            router.push("/dashboard/student/main-tasks");
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] py-12 px-4 flex justify-center items-start">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href="/dashboard/student/main-tasks"
                        className="p-3 rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t.student.forms.taskForm.editHeader}</h1>
                        <p className="text-gray-400 text-sm font-medium">{t.student.forms.taskForm.editSubheader}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    {/* Main Task Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t.student.forms.taskForm.coreDetails}</h2>
                        </div>

                        <div className="space-y-4 ml-10">
                            <div>
                                <label htmlFor="title" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    {t.student.forms.taskForm.titleLabel}
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder={t.student.forms.taskForm.titlePlaceholder}
                                    disabled={isLoading}
                                    {...register("title")}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 shadow-inner"
                                />
                                {errors.title && (
                                    <p className="text-xs font-bold text-red-500 mt-2 ml-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    {t.student.forms.taskForm.overviewLabel} <span className="text-gray-300 font-normal">{t.student.forms.taskForm.optional}</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    placeholder={t.student.forms.taskForm.overviewPlaceholder}
                                    disabled={isLoading}
                                    {...register("description")}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Subtasks Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t.student.forms.taskForm.roadmapSteps}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => append({ title: "", due_date: "", description: "", priority: "MEDIUM" })}
                                className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                {t.student.forms.taskForm.addStep}
                            </button>
                        </div>

                        <div className="space-y-4 ml-10">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm relative group">
                                    {/* Subtask remove button – always visible */}
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Remove subtask"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                {t.student.forms.taskForm.stepPlaceholder.split('(')[0].trim()}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={t.student.forms.taskForm.stepPlaceholder}
                                                {...register(`subtasks.${index}.title` as const)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                            {errors.subtasks?.[index]?.title && (
                                                <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                                    {errors.subtasks[index]?.title?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                {t.student.forms.taskForm.deadline}
                                            </label>
                                            <input
                                                type="date"
                                                {...register(`subtasks.${index}.due_date` as const)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                {t.student.forms.taskForm.importance}
                                            </label>
                                            <select
                                                {...register(`subtasks.${index}.priority` as const)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-[46px]"
                                            >
                                                <option value="LOW">{t.student.forms.taskForm.priorities.low}</option>
                                                <option value="MEDIUM">{t.student.forms.taskForm.priorities.medium}</option>
                                                <option value="HIGH">{t.student.forms.taskForm.priorities.high}</option>
                                                <option value="URGENT">{t.student.forms.taskForm.priorities.urgent}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                {t.student.forms.taskForm.quickNote}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={t.student.forms.taskForm.keyFocusPlaceholder}
                                                {...register(`subtasks.${index}.description` as const)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-gray-50">
                        {serverError && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm font-bold text-red-600 flex items-center gap-3 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {serverError}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-red-100 text-sm font-bold text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t.student.forms.taskForm.deleteCycle}
                            </button>
                            <Link
                                href="/dashboard/student/main-tasks"
                                className="flex-1 py-4 rounded-2xl border border-gray-100 text-sm font-bold text-gray-400 text-center hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                {t.student.forms.taskForm.discard}
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 text-emerald-400" />
                                )}
                                {t.student.forms.taskForm.submitEdit}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-1">{t.student.forms.taskForm.deleteConfirmTitle}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {t.student.forms.taskForm.deleteConfirmDesc.replace("{title}", task.title)}
                                </p>
                            </div>
                            <div className="flex gap-3 w-full pt-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    {t.student.forms.taskForm.cancel}
                                </button>
                                <button
                                    onClick={handleDeleteMainTask}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            {t.student.forms.taskForm.delete}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
