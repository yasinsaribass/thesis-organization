"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateSupervisorSchema } from "@/schemas/validation";
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { insertNotification } from "@/lib/notifications";

export async function createSupervisorProfile(
    data: z.infer<typeof updateSupervisorSchema>
) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Not authenticated" };
        }

        const parsedData = updateSupervisorSchema.parse(data);

        // Check if supervisor row already exists
        const { data: existing } = await supabase
            .from("supervisors")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (existing) {
            const { error } = await supabase
                .from("supervisors")
                .update({
                    academic_title: parsedData.academic_title,
                    department: parsedData.department,
                    capacity: parsedData.capacity,
                    expertise_areas: parsedData.expertise_areas,
                })
                .eq("id", existing.id);

            if (error) throw error;
        } else {
            const { error } = await supabase.from("supervisors").insert({
                user_id: user.id,
                academic_title: parsedData.academic_title,
                department: parsedData.department,
                capacity: parsedData.capacity,
                expertise_areas: parsedData.expertise_areas,
            });

            if (error) throw error;
        }

        revalidatePath("/dashboard", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Supervisor Setup Error:", error);
        return { error: error.message || "An error occurred" };
    }
}

export async function getSupervisorStudents() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // 1. Get supervisor record with profile info
    const { data: supervisor } = await supabase
        .from("supervisors")
        .select(`
            id,
            user_profiles (
                name,
                surname
            )
        `)
        .eq("user_id", user.id)
        .single();

    if (!supervisor) return { error: "Supervisor profile not found" };

    const supervisorInfo = supervisor.user_profiles as any;

    // 2. Get students linked to this supervisor
    const { data: students, error } = await supabase
        .from("students")
        .select(`
            id,
            student_number,
            supervisor_status,
            user_profiles (
                id,
                name,
                surname
            ),
            theses (
                id,
                title
            )
        `)
        .eq("supervisor_id", supervisor.id);

    if (error) return { error: error.message };

    return {
        students,
        supervisorProfile: {
            name: supervisorInfo?.name,
            surname: supervisorInfo?.surname
        }
    };
}

export async function searchStudents(query: string) {
    const supabase = await createSupabaseServerClient();

    const { data: students, error } = await supabase
        .from("students")
        .select(`
            id,
            student_number,
            user_profiles (
                id,
                name,
                surname
            )
        `)
        .is("supervisor_id", null)
        .ilike("student_number", `%${query}%`);

    if (error) return { error: error.message };
    return { students: students || [] };
}


export async function assignStudent(studentId: string) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: supervisor } = await supabase
        .from("supervisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!supervisor) return { error: "Supervisor profile not found" };

    const { error } = await supabase
        .from("students")
        .update({
            supervisor_id: supervisor.id,
            supervisor_status: 'PENDING'
        })
        .eq("id", studentId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/supervisor");
    return { success: true };
}

export async function respondToSupervisorRequest(status: 'ACCEPTED' | 'REJECTED') {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    if (status === 'REJECTED') {
        // Clear supervisor if rejected
        const { error } = await supabase
            .from("students")
            .update({
                supervisor_id: null,
                supervisor_status: null
            })
            .eq("user_id", user.id);
        if (error) return { error: error.message };
    } else {
        const { error } = await supabase
            .from("students")
            .update({ supervisor_status: 'ACCEPTED' })
            .eq("user_id", user.id);
        if (error) return { error: error.message };
    }

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/supervisor");
    return { success: true };
}

export async function removeStudent(studentId: string) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: supervisor } = await supabase
        .from("supervisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!supervisor) return { error: "Supervisor profile not found" };

    const { error } = await supabase
        .from("students")
        .update({
            supervisor_id: null,
            supervisor_status: null
        })
        .eq("id", studentId)
        .eq("supervisor_id", supervisor.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/supervisor");
    return { success: true };
}

export async function getStudentDetails(studentId: string) {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        // 1. Get student and thesis
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select(`
                id,
                student_number,
                user_profiles (
                    id,
                    name,
                    surname,
                    avatar_url
                ),
                theses (
                    id,
                    title,
                    status
                )
            `)
            .eq("id", studentId)
            .single();

        if (studentError || !student) return { error: "Student not found" };

        const profile = Array.isArray(student.user_profiles) ? student.user_profiles[0] : student.user_profiles;
        const thesis = Array.isArray(student.theses) ? student.theses[0] : student.theses;

        // Replace with normalized versions
        const normalizedStudent = {
            ...student,
            user_profiles: profile
        };

        if (!thesis) return { student: normalizedStudent, thesis: null, mainTasks: [], suggestions: [] };

        // 2. Get all tasks
        const { data: allTasks, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .eq("thesis_id", thesis.id)
            .order("created_at", { ascending: true });

        if (tasksError) return { error: tasksError.message };

        const tasks = allTasks || [];

        // Main tasks (parent_task_id is null)
        // We only show accepted tasks or student-created tasks (suggestion_status is null) in the main overview
        const mainTasksList = tasks.filter(t => t.parent_task_id === null && t.suggestion_status !== 'REJECTED' && t.suggestion_status !== 'PENDING');
        const subTasksList = tasks.filter(t => t.parent_task_id !== null && t.suggestion_status !== 'REJECTED' && t.suggestion_status !== 'PENDING');

        const formattedTasks = mainTasksList.map(main => ({
            ...main,
            subtasks: subTasksList.filter(sub => sub.parent_task_id === main.id)
        }));

        // Suggestions for activity table - only show top-level suggestions 
        // OR standalone subtask suggestions (where parent is not also pending)
        const suggestions = tasks.filter(t => {
            if (t.suggestion_status === null) return false;
            if (t.parent_task_id === null) return true;

            // Subtask ise: parent'ı da şu an listede mi (yani beraber mi önerildiler?)
            const parent = tasks.find(p => p.id === t.parent_task_id);
            return parent?.suggestion_status !== 'PENDING';
        });

        return {
            student: normalizedStudent,
            thesis,
            mainTasks: formattedTasks,
            suggestions
        };
    } catch (error: any) {
        console.error("getStudentDetails Error:", error);
        return { error: error.message || "An unexpected error occurred" };
    }
}

export async function suggestTask(data: {
    thesis_id: string;
    student_id?: string; // Add this for revalidation
    parent_task_id?: string | null;
    title: string;
    description?: string;
    due_date?: string;
    priority?: any;
    subtasks?: Array<{ title: string; priority: string; due_date?: string }>;
}) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        console.log("Suggesting Task:", { ...data, user_id: user.id });

        if (!data.thesis_id) {
            return { error: "Thesis ID is missing. Please ensure the student has a registered thesis." };
        }

        // 1. Insert main task or single subtask
        const { data: insertedTask, error: mainError } = await supabase
            .from("tasks")
            .insert({
                title: data.title,
                description: data.description || null,
                thesis_id: data.thesis_id,
                parent_task_id: data.parent_task_id || null,
                created_by: user.id,
                due_date: data.due_date || null,
                priority: data.priority || 'MEDIUM',
                suggestion_status: 'PENDING'
            })
            .select()
            .single();

        if (mainError) {
            console.error("Main Task Insertion Error:", mainError);
            return { error: `Failed to create task: ${mainError.message}` };
        }

        // 2. If it's a main task and subtasks were provided, insert them
        if (!data.parent_task_id && data.subtasks && data.subtasks.length > 0) {
            const subtasksToInsert = data.subtasks.map(s => ({
                title: s.title,
                thesis_id: data.thesis_id,
                parent_task_id: insertedTask.id,
                created_by: user.id,
                due_date: s.due_date || null,
                priority: s.priority || 'MEDIUM',
                suggestion_status: 'PENDING'
            }));

            const { error: subError } = await supabase.from("tasks").insert(subtasksToInsert);
            if (subError) {
                console.error("Subtasks Insertion Error:", subError);
                return { error: `Main task suggested, but subtasks failed: ${subError.message}` };
            }
        }

        if (data.student_id) {
            revalidatePath(`/dashboard/supervisor/students/${data.student_id}`);

            // Notify the student
            const { data: studentRecord } = await supabase
                .from("students")
                .select("user_id")
                .eq("id", data.student_id)
                .single();

            if (studentRecord?.user_id) {
                const isSubtask = !!data.parent_task_id;
                await insertNotification(
                    supabase,
                    studentRecord.user_id,
                    isSubtask ? "subtask_suggestion" : "task_suggestion",
                    isSubtask
                        ? `New subtask suggestion: ${data.title}`
                        : `New task suggestion: ${data.title}`,
                    data.description || "Your supervisor suggested a new task for your thesis.",
                    "/dashboard/student/main-tasks/task-suggestions"
                );
            }
        }
        revalidatePath("/dashboard/supervisor/students/[id]", "page");

        return { success: true };
    } catch (err: any) {
        console.error("suggestTask Exception:", err);
        return { error: err.message || "An unexpected error occurred while sending the suggestion." };
    }
}
export async function updateTaskFeedback(taskId: string, feedback: string, studentId?: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        // 1. Fetch task details to identify the task in the notification
        const { data: taskData } = await supabase
            .from("tasks")
            .select("title")
            .eq("id", taskId)
            .single();

        const { error } = await supabase
            .from("tasks")
            .update({
                supervisor_feedback: feedback,
                feedback_updated_at: new Date().toISOString()
            })
            .eq("id", taskId);

        if (error) throw error;

        // 2. Notify the student
        if (studentId) {
            const { data: studentRecord } = await supabase
                .from("students")
                .select("user_id")
                .eq("id", studentId)
                .single();

            if (studentRecord?.user_id) {
                await insertNotification(
                    supabase,
                    studentRecord.user_id,
                    "feedback",
                    `New Feedback: ${taskData?.title || 'Task'}`,
                    feedback.substring(0, 100), // Show a snippet of feedback
                    "/dashboard/student/feedback"
                );
            }
            revalidatePath(`/dashboard/supervisor/students/${studentId}`);
        }
        
        revalidatePath("/dashboard/student/feedback");

        return { success: true };
    } catch (err: any) {
        console.error("updateTaskFeedback Exception:", err);
        return { error: err.message || "An unexpected error occurred while saving feedback." };
    }
}
