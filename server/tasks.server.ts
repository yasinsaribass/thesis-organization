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

/** Oturum açmış öğrencinin tezini ve student kaydını getirir */
export async function getStudentDashboardData() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Student kaydını bul
    const { data: student } = await supabase
        .from("students")
        .select("id, department, student_number, supervisor_id")
        .eq("user_id", user.id)
        .single();

    if (!student) return { error: "Student profile not found" };

    // Öğrencinin tezini bul
    const { data: thesis } = await supabase
        .from("theses")
        .select("id, title, status, visible_to_supervisor_default")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!thesis) return { student, thesis: null, mainTasks: [], supervisorTasks: [], stats: { completed: 0, ongoing: 0, suggestions: 0 } };

    // Ana görevler: parent_task_id NULL + (öğrencinin oluşturduğu VEYA kabul edilmiş öneri)
    const { data: mainTasks } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, created_by, due_date, updated_at, suggestion_status, supervisor_feedback, feedback_updated_at")
        .eq("thesis_id", thesis.id)
        .is("parent_task_id", null)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED")
        .order("created_at", { ascending: false });

    // Danışmanın önerdiği bekleyen görevler
    // Önemli: Eğer bir Main Task bekliyorsa, onun alt görevlerini ayrıca listede göstermiyoruz.
    // Sadece "bağımsız" önerilenleri (Main task'lar veya zaten kabul edilmiş bir task'ın altına eklenen yeni subtask'lar) gösteriyoruz.
    const { data: allPending } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, parent_task_id")
        .eq("thesis_id", thesis.id)
        .eq("suggestion_status", "PENDING")
        .order("created_at", { ascending: false });

    const pendingTasks = allPending || [];

    // Filtreleme: parent_task_id null olanlar (Main) VEYA parent'ı PENDING olmayanlar (Bağımsız Subtask)
    const supervisorTasks = pendingTasks.filter(t => {
        if (!t.parent_task_id) return true;
        // Eğer parent_id varsa, o parent'ın da pending listesinde olup olmadığına bakıyoruz
        const isParentAlsoPending = pendingTasks.some(p => p.id === t.parent_task_id);
        return !isParentAlsoPending;
    });

    // İstatistikler (Tüm görevleri ve alt görevleri dahil ederek gerçek ilerlemeyi bul)
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

/** Bir task'ın detayını getirir (alt görevleriyle birlikte) */
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

/** Bütün görevleri (Ana ve Alt) hiyerarşik veya düz bir liste olarak tez bazında getirir */
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

/** Yeni bir ana task oluşturur ve varsa alt görevlerini ekler */
export async function createMainTask(data: z.infer<typeof mainTaskSchema>) {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = mainTaskSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    // 1. Ana taskı oluştur
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

    // 2. Varsa alt görevleri oluştur
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

/** Yeni bir alt görev (subtask) oluşturur */
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

/** Mevcut bir task'ı günceller (ve alt görevlerini senkronize eder) */
export async function updateMainTask(data: z.infer<typeof updateMainTaskSchema>) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const parsed = updateMainTaskSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const { id, subtasks, ...mainFields } = parsed.data;

    // 1. Ana görevi güncelle
    const { error: mainUpdateError } = await supabase
        .from("tasks")
        .update({ ...mainFields, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (mainUpdateError) return { error: mainUpdateError.message };

    // 2. Alt görevleri senkronize et
    if (subtasks) {
        // Mevcut alt görevleri veritabanından çek (silinenleri belirlemek için)
        const { data: existingSubtasks } = await supabase
            .from("tasks")
            .select("id")
            .eq("parent_task_id", id);

        const existingIds = existingSubtasks?.map(s => s.id) || [];
        const incomingIds = subtasks.filter(s => s.id).map(s => s.id!);

        // a) Silinenleri sil
        const idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));
        if (idsToDelete.length > 0) {
            await supabase.from("tasks").delete().in("id", idsToDelete);
        }

        // b) Güncellenecek ve yeni eklenecekleri işle
        for (const s of subtasks) {
            if (s.id) {
                // Güncelle
                await supabase.from("tasks").update({
                    title: s.title,
                    description: s.description,
                    due_date: s.due_date ? new Date(s.due_date).toISOString() : null,
                    priority: s.priority,
                    updated_at: new Date().toISOString()
                }).eq("id", s.id);
            } else {
                // Ekle (tez_id ve created_by ana görevden alınabilir veya state'ten gelebilir)
                // Burada ana görevin thesis_id'sini bulmamız gerekebilir eğer data içinde yoksa.
                // Şimdilik schema'da thesis_id zorunlu (partial olsa da).
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

/** Bir task'ı siler (main task ise önce alt görevleri siler) */
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

/** Task durumunu günceller (Kanban sürükle-bırak için) */
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
