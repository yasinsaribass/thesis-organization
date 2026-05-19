"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const subtaskSchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Subtask title is required"),
    due_date: z.string().optional().nullable(),
    description: z.string().optional().nullable(), // Used as 'note'
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
});

const mainTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    thesis_id: z.string().uuid(),
    subtasks: z.array(subtaskSchema).optional(),
});

const updateMainTaskSchema = mainTaskSchema.partial().extend({
    id: z.string().uuid(),
    subtasks: z.array(subtaskSchema).optional(),
});

// ──────────────────────────────────────────────
// QUERIES
// ──────────────────────────────────────────────

/** Returns current student's thesis and student record */
export async function getStudentDashboardData() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Find student record
    const { data: student } = await supabase
        .from("students")
        .select("id, department, student_number, supervisor_id")
        .eq("user_id", user.id)
        .single();

    if (!student) return { error: "Student profile not found" };

    // Find student's thesis
    const { data: thesis } = await supabase
        .from("theses")
        .select("id, title, status, visible_to_supervisor_default")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!thesis) return { student, thesis: null, mainTasks: [], supervisorTasks: [], stats: { completed: 0, ongoing: 0, suggestions: 0 } };

    // Main tasks: no parent and student-created or accepted suggestions
    const { data: mainTasks } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, created_by, due_date, updated_at, suggestion_status, supervisor_feedback, feedback_updated_at")
        .eq("thesis_id", thesis.id)
        .is("parent_task_id", null)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED")
        .order("created_at", { ascending: false });

    // Pending supervisor suggestions
    // Skip subtask suggestions when parent main task is still pending
    // Only show independent suggestions
    const { data: allPending } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, parent_task_id")
        .eq("thesis_id", thesis.id)
        .eq("suggestion_status", "PENDING")
        .order("created_at", { ascending: false });

    const pendingTasks = allPending || [];

    // Keep main suggestions or subtask suggestions whose parent is not pending
    const supervisorTasks = pendingTasks.filter(t => {
        if (!t.parent_task_id) return true;
        // If subtask has parent, check if parent is also pending
        const isParentAlsoPending = pendingTasks.some(p => p.id === t.parent_task_id);
        return !isParentAlsoPending;
    });

    // Count actual task progress including subtasks
    const { count: completedCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", thesis.id)
        .eq("status", "DONE")
        .not("parent_task_id", "is", null);

    const { count: ongoingCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", thesis.id)
        .neq("status", "DONE")
        .not("parent_task_id", "is", null)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED");

    return {
        student,
        thesis,
        mainTasks: mainTasks ?? [],
        supervisorTasks: supervisorTasks ?? [],
        stats: {
            completed: completedCount || 0,
            ongoing: ongoingCount || 0,
            suggestions: supervisorTasks.length
        }
    };
}

/** Returns task detail with subtasks */
export async function getTaskDetail(taskId: string) {
    const supabase = await createSupabaseServerClient();

    const { data: task } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, created_by, thesis_id, supervisor_feedback, feedback_updated_at, created_at, updated_at, completed_at")
        .eq("id", taskId)
        .single();

    if (!task) return { error: "Task not found" };

    const { data: subtasks } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, completed_at")
        .eq("parent_task_id", taskId)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED")
        .order("created_at", { ascending: true });

    // Check if this is the last global task for the thesis
    const { count: totalOngoingCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", task.thesis_id)
        .neq("status", "DONE")
        .not("parent_task_id", "is", null)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED");

    // We count how many subtasks of THIS main task are NOT done
    const currentTaskOngoingCount = subtasks?.filter(s => s.status !== 'DONE').length || 0;

    // If totalOngoingCount === currentTaskOngoingCount, it means all other main tasks' subtasks are done.
    // So when THIS task's subtasks are finished, the whole thesis is finished.
    const isLastGlobalTask = (totalOngoingCount || 0) <= currentTaskOngoingCount;

    return { task, subtasks: subtasks ?? [], isLastGlobalTask };
}

/** Returns all thesis tasks */
export async function getAllThesisTasks() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!student) return { error: "Student profile not found" };

    const { data: thesis } = await supabase
        .from("theses")
        .select("id, title")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!thesis) return { error: "No active thesis found" };

    const { data: allTasks } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, created_by, parent_task_id, created_at, completed_at, suggestion_status")
        .eq("thesis_id", thesis.id)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED")
        .order("created_at", { ascending: true });

    return { thesis, tasks: allTasks ?? [] };
}

// ──────────────────────────────────────────────
// MUTATIONS
// ──────────────────────────────────────────────

/** Creates main task and optional subtasks */
export async function createMainTask(data: z.infer<typeof mainTaskSchema>) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = mainTaskSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    // 1. Create main task
    const { data: mainTask, error: mainError } = await supabase
        .from("tasks")
        .insert({
            title: parsed.data.title,
            description: parsed.data.description ?? null,
            thesis_id: parsed.data.thesis_id,
            created_by: user.id,
            status: "TODO",
            priority: "MEDIUM",
            parent_task_id: null,
        })
        .select()
        .single();

    if (mainError) return { error: mainError.message };

    // 2. Create subtasks if any
    if (parsed.data.subtasks && parsed.data.subtasks.length > 0) {
        const subtasksToInsert = parsed.data.subtasks.map(s => ({
            title: s.title,
            description: s.description ?? null,
            due_date: s.due_date ? new Date(s.due_date).toISOString() : null,
            thesis_id: parsed.data.thesis_id,
            created_by: user.id,
            status: "TODO",
            priority: s.priority,
            parent_task_id: mainTask.id,
        }));

        const { error: subError } = await supabase.from("tasks").insert(subtasksToInsert);
        if (subError) return { error: `Main task created, but subtasks failed: ${subError.message}` };
    }

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/main-tasks");
    return { success: true };
}

/** Creates a new subtask */
export async function createSubtask(data: {
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    main_task_id: string;
}) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Find thesis_id from parent task
    const { data: parentTask } = await supabase.from("tasks").select("thesis_id").eq("id", data.main_task_id).single();
    if (!parentTask) return { error: "Parent task not found" };

    const { data: newTask, error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description || null,
        due_date: data.due_date,
        priority: data.priority,
        parent_task_id: data.main_task_id,
        thesis_id: parentTask.thesis_id,
        status: "TODO",
        created_by: user.id
    }).select().single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard/student/kanban");
    revalidatePath("/dashboard/student/main-tasks");
    return { success: true, task: newTask };
}

/** Updates a task and syncs subtasks */
export async function updateMainTask(data: z.infer<typeof updateMainTaskSchema>) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = updateMainTaskSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { id, subtasks, ...mainFields } = parsed.data;

    // 1. Update main task
    const { error: mainUpdateError } = await supabase
        .from("tasks")
        .update({ ...mainFields, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (mainUpdateError) return { error: mainUpdateError.message };

    // 2. Sync subtasks
    if (subtasks) {
        // Get existing subtasks from DB
        const { data: existingSubtasks } = await supabase
            .from("tasks")
            .select("id")
            .eq("parent_task_id", id);

        const existingIds = existingSubtasks?.map(s => s.id) || [];
        const incomingIds = subtasks.filter(s => s.id).map(s => s.id!);

        // a) Delete removed subtasks
        const idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));
        if (idsToDelete.length > 0) {
            await supabase.from("tasks").delete().in("id", idsToDelete);
        }

        // b) Handle updates and new subtasks
        for (const s of subtasks) {
            if (s.id) {
                // Update
                await supabase.from("tasks").update({
                    title: s.title,
                    description: s.description,
                    due_date: s.due_date ? new Date(s.due_date).toISOString() : null,
                    priority: s.priority,
                    updated_at: new Date().toISOString()
                }).eq("id", s.id);
            } else {
                // Insert new subtask
                // thesis_id must be present
                // Schema requires thesis_id
                await supabase.from("tasks").insert({
                    title: s.title,
                    description: s.description,
                    due_date: s.due_date ? new Date(s.due_date).toISOString() : null,
                    parent_task_id: id,
                    thesis_id: parsed.data.thesis_id, // parsed.data'da thesis_id gelmeli
                    created_by: user.id,
                    status: "TODO",
                    priority: s.priority
                });
            }
        }
    }

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/main-tasks");
    revalidatePath(`/dashboard/student/kanban?task_id=${id}`);
    return { success: true };
}

/** Deletes a task and its subtasks */
export async function deleteTask(taskId: string) {
    const supabase = await createSupabaseServerClient();

    // First delete all subtasks (child tasks)
    const { error: subtaskError } = await supabase
        .from("tasks")
        .delete()
        .eq("parent_task_id", taskId);

    if (subtaskError) return { error: subtaskError.message };

    // Then delete the main task
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/main-tasks");
    return { success: true };
}

/** Updates task status */
export async function updateTaskStatus(taskId: string, newStatus: string) {
    const supabase = await createSupabaseServerClient();

    // Look up the task to get thesis_id (needed for badge checks)
    const { data: taskRecord } = await supabase
        .from("tasks")
        .select("thesis_id")
        .eq("id", taskId)
        .single();

    const { error } = await supabase
        .from("tasks")
        .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
            completed_at: newStatus === 'DONE' ? new Date().toISOString() : null
        })
        .eq("id", taskId);

    if (error) return { error: error.message };

    // Award XP when a task is marked as DONE
    if (newStatus === 'DONE' && taskRecord?.thesis_id) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: student } = await supabase
                    .from("students")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();

                if (student) {
                    // Import and call gamification engine
                    const { onTaskCompleted } = await import("@/server/gamification.server");
                    await onTaskCompleted(student.id, taskRecord.thesis_id);
                }
            }
        } catch (gamErr) {
            // Gamification errors should never block task updates
            console.error("Gamification error (non-fatal):", gamErr);
        }
    }

    revalidatePath("/dashboard/student/kanban");
    revalidatePath("/dashboard/student");
    return { success: true };
}


export async function respondToTaskSuggestion(taskId: string, status: 'ACCEPTED' | 'REJECTED') {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // 1. Update the status of the main task
    const { error: taskError } = await supabase
        .from("tasks")
        .update({ suggestion_status: status })
        .eq("id", taskId);

    if (taskError) return { error: taskError.message };

    // 2. Automatically update all subtasks of this task
    const { error: subtaskError } = await supabase
        .from("tasks")
        .update({ suggestion_status: status })
        .eq("parent_task_id", taskId);

    if (subtaskError) {
        console.error("Failed to update subtasks status:", subtaskError);
    }

    revalidatePath("/dashboard/student");
    return { success: true };
}
