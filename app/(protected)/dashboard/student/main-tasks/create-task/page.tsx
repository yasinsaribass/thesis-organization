"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Plus, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { useFieldArray } from "react-hook-form";
import { createMainTask } from "@/server/tasks.server";

const schema = z.object({
    title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
    description: z.string().max(500).optional(),
    subtasks: z.array(z.object({
        title: z.string().min(1, "Subtask title is required"),
        due_date: z.string().optional(),
        description: z.string().optional(), // Used for 'note'
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    })),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTaskPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const thesisId = searchParams.get("thesis_id") ?? "";

    const [serverError, setServerError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            subtasks: [{ title: "", due_date: "", description: "", priority: "MEDIUM" }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "subtasks",
    });

    async function onSubmit(values: FormValues) {
        if (!thesisId) {
            setServerError("Thesis ID is missing. Please go back and try again.");
            return;
        }

        setIsLoading(true);
        setServerError(null);

        const result = await createMainTask({
            title: values.title,
            description: values.description,
            thesis_id: thesisId,
            subtasks: values.subtasks,
        });

        if (result.error) {
            setServerError(result.error);
            setIsLoading(false);
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
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Design New Cycle</h1>
                        <p className="text-gray-400 text-sm font-medium">Create a main task and its detailed roadmap</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                    {/* Main Task Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Primary Goal</h2>
                        </div>

                        <div className="space-y-4 ml-10">
                            <div>
                                <label htmlFor="title" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Cycle Title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    placeholder="e.g., Literature Review & Gap Analysis"
                                    disabled={isLoading}
                                    {...register("title")}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 shadow-inner"
                                />
                                {errors.title && (
                                    <p className="text-xs font-bold text-red-500 mt-2 ml-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Overview <span className="text-gray-300 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    placeholder="Briefly summarize this work cycle..."
                                    disabled={isLoading}
                                    {...register("description")}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Subtasks Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">2</div>
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Roadmap Steps</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => append({ title: "", due_date: "", description: "", priority: "MEDIUM" })}
                                className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                ADD STEP
                            </button>
                        </div>

                        <div className="space-y-4 ml-10">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm relative group">
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-3">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                Step Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Define search queries"
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
                                                Deadline
                                            </label>
                                            <input
                                                type="date"
                                                {...register(`subtasks.${index}.due_date` as const)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                Importance
                                            </label>
                                            <select
                                                {...register(`subtasks.${index}.priority` as const)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all h-[46px]"
                                            >
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                                <option value="URGENT">Urgent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                Quick Note
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Key focus..."
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
                            <Link
                                href="/dashboard/student/main-tasks"
                                className="flex-1 py-4 rounded-2xl border border-gray-100 text-sm font-bold text-gray-400 text-center hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                Revert Changes
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] py-4 rounded-2xl bg-[#030213] text-white text-sm font-black hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                                )}
                                START THIS CYCLE
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

