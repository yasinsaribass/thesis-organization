"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { createSubtask } from "@/server/tasks.server";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    title: z.string().min(2, { message: "Title is too short" }),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    due_date: z.date().optional(),
});

interface InlineTaskFormProps {
    taskId: string;
    onCancel: () => void;
    onSuccess: (newTask: any) => void;
}

export function InlineTaskForm({ taskId, onCancel, onSuccess }: InlineTaskFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);

            const result = await createSubtask({
                title: values.title,
                description: values.description || null,
                priority: values.priority,
                due_date: values.due_date ? values.due_date.toISOString() : null,
                main_task_id: taskId,
            });

            if (result.error) {
                alert("Error: " + result.error);
                return;
            }

            if (result.task) {
                onSuccess(result.task);
                form.reset();
            }
        } catch (error) {
            console.error("Error creating inline task:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-lg shadow-indigo-100/50 mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">New Step</h4>
                <button
                    onClick={onCancel}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="What needs to be done?"
                                        className="h-8 text-sm font-bold border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
                                        autoFocus
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add details (optional)"
                                        className="resize-none min-h-[60px] text-xs border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-8 text-[11px] font-bold rounded-xl border-gray-200">
                                                <SelectValue placeholder="Priority" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LOW" className="text-[11px] font-bold text-blue-600">Low</SelectItem>
                                            <SelectItem value="MEDIUM" className="text-[11px] font-bold text-amber-600">Medium</SelectItem>
                                            <SelectItem value="HIGH" className="text-[11px] font-bold text-red-600">High</SelectItem>
                                            <SelectItem value="URGENT" className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-8 px-2 text-left text-[11px] font-bold rounded-xl border-gray-200",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="end">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Step"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
