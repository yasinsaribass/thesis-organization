"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Supervisor adds an available time slot
 */
export async function addAvailability(supervisorId: string, startTime: Date, endTime: Date, meetingLink: string | null = null) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
        .from("consultations")
        .insert({
            supervisor_id: supervisorId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            meeting_link: meetingLink,
            status: "AVAILABLE"
        })
        .select()
        .single();

    if (error) return { error: error.message };

    revalidatePath(`/dashboard/supervisor/consultations`);
    revalidatePath(`/dashboard/student/consultations`);
    return { success: true, data };
}

/**
 * Fetch available slots for a specific supervisor
 */
export async function getAvailableSlots(supervisorId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("supervisor_id", supervisorId)
        .eq("status", "AVAILABLE")
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

    if (error) return { error: error.message };
    return { slots: data || [] };
}

/**
 * Student books an available slot
 */
export async function bookConsultation(slotId: string, studentId: string, topic: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Update the slot to BOOKED
    const { data, error } = await supabase
        .from("consultations")
        .update({
            student_id: studentId,
            topic: topic,
            status: "BOOKED",
            updated_at: new Date().toISOString()
        })
        .eq("id", slotId)
        .eq("status", "AVAILABLE") // ensure it's still available
        .select()
        .single();

    if (error) return { error: error.message };

    revalidatePath(`/dashboard/student/consultations`);
    revalidatePath(`/dashboard/supervisor/consultations`);
    return { success: true, data };
}

/**
 * Fetch consultations for a specific student (BOOKED, COMPLETED, CANCELLED)
 */
export async function getStudentConsultations(studentId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("consultations")
        .select("*, supervisors(user_profiles(name, surname))")
        .eq("student_id", studentId)
        .order("start_time", { ascending: true });

    if (error) return { error: error.message };
    return { consultations: data || [] };
}

/**
 * Fetch all consultations for a supervisor (AVAILABLE, BOOKED, COMPLETED, CANCELLED)
 */
export async function getSupervisorConsultations(supervisorId: string) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("consultations")
        .select("*, students(user_profiles(name, surname))")
        .eq("supervisor_id", supervisorId)
        .order("start_time", { ascending: true });

    if (error) return { error: error.message };
    return { consultations: data || [] };
}

/**
 * Cancel or Delete a consultation
 */
export async function cancelConsultation(slotId: string, role: "supervisor" | "student") {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Get current status
    const { data: slot, error: fetchError } = await supabase
        .from("consultations")
        .select("*")
        .eq("id", slotId)
        .single();

    if (fetchError || !slot) return { error: "Slot not found" };

    let error;

    if (slot.status === "AVAILABLE" && role === "supervisor") {
        // Supervisor can delete an unbooked slot
        const { error: deleteError } = await supabase
            .from("consultations")
            .delete()
            .eq("id", slotId);
        error = deleteError;
    } else {
        // Cancel a booked slot
        // Wait, if it's booked, maybe we just set status to CANCELLED instead of deleting
        const { error: updateError } = await supabase
            .from("consultations")
            .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
            .eq("id", slotId);
        error = updateError;
    }

    if (error) return { error: error.message };

    revalidatePath(`/dashboard/student/consultations`);
    revalidatePath(`/dashboard/supervisor/consultations`);
    return { success: true };
}
