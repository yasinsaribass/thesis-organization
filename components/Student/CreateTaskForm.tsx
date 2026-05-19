"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2, Zap, ArrowLeft } from "lucide-react";
import { createMainTask } from "@/server/tasks.server";

const schema = z.object({
    title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
    description: z.string().max(500).optional(),
    subtasks: z.array(z.object({
        title: z.string().min(1, "Subtask title is required"),
        due_date: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    })),
});

type FormValues = z.infer<typeof schema>;

interface CreateTaskFormProps {
    thesisId: string;
    onSuccess: () => void;
    onBack: () => void;
}

import { useLanguage } from "@/context/LanguageContext";

export function CreateTaskForm({ thesisId, onSuccess, onBack }: CreateTaskFormProps) {
    const { t } = useLanguage();
    
    // Schema with localized messages
    const schema = z.object({
        title: z.string().min(1, t.student.forms.taskForm.validation.titleRequired).max(120, t.student.forms.taskForm.validation.titleMax),
        description: z.string().max(500).optional(),
        subtasks: z.array(z.object({
            title: z.string().min(1, t.student.forms.taskForm.validation.subtaskRequired),
            due_date: z.string().optional(),
            description: z.string().optional(),
            priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
        })),
    });

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
            setServerError(t.student.forms.taskForm.thesisIdMissing);
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
            onSuccess();
        }
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full animate-in slide-in-from-right duration-300">
             {/* Form Header */}
             <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                <button
                    onClick={onBack}
                    className="p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all text-slate-400 hover:text-slate-900 shadow-none hover:shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t.student.forms.taskForm.createHeader}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.student.forms.taskForm.createSubheader}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-100">
                {/* Primary Info */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">
                            {t.student.forms.taskForm.titleLabel}
                        </label>
                        <input
                            type="text"
                            placeholder={t.student.forms.taskForm.titlePlaceholder}
                            disabled={isLoading}
                            {...register("title")}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                        />
                        {errors.title && (
                            <p className="text-[10px] font-bold text-red-500 mt-2 ml-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">
                            {t.student.forms.taskForm.overviewLabel} <span className="text-slate-300 font-normal lowercase">{t.student.forms.taskForm.optional}</span>
                        </label>
                        <textarea
                            rows={3}
                            placeholder={t.student.forms.taskForm.overviewPlaceholder}
                            disabled={isLoading}
                            {...register("description")}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                        />
                    </div>
                </div>

                {/* Subtasks */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t.student.forms.taskForm.roadmapSteps}</h4>
                         <button
                            type="button"
                            onClick={() => append({ title: "", due_date: "", description: "", priority: "MEDIUM" })}
                            className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase tracking-widest"
                        >
                            {t.student.forms.taskForm.addStep}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm relative group/step hover:shadow-md transition-shadow">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="absolute top-4 right-4 p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            placeholder={t.student.forms.taskForm.stepPlaceholder}
                                            {...register(`subtasks.${index}.title` as const)}
                                            className="w-full px-0 py-2 border-b border-slate-100 bg-transparent text-sm font-bold placeholder-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t.student.forms.taskForm.deadline}</label>
                                        <input
                                            type="date"
                                            {...register(`subtasks.${index}.due_date` as const)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/30 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t.student.forms.taskForm.priority}</label>
                                        <select
                                            {...register(`subtasks.${index}.priority` as const)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/30 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-[42px]"
                                        >
                                            <option value="LOW">{t.student.forms.taskForm.priorities.low}</option>
                                            <option value="MEDIUM">{t.student.forms.taskForm.priorities.medium}</option>
                                            <option value="HIGH">{t.student.forms.taskForm.priorities.high}</option>
                                            <option value="URGENT">{t.student.forms.taskForm.priorities.urgent}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {serverError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-bold text-red-600 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {serverError}
                    </div>
                )}
            </form>

            {/* Form Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                <button
                    type="submit"
                    form="_create_task_form_modal_"
                    disabled={isLoading}
                    onClick={handleSubmit(onSubmit)}
                    id="_create_task_form_modal_"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98] group"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Zap className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                    )}
                    {t.student.forms.taskForm.submitCreate}
                </button>
            </div>
        </div>
    );
}
