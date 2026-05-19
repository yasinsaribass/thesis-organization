"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateStudentSchema } from "@/schemas/validation";
import * as z from "zod";
import { revalidatePath } from "next/cache";

export async function createStudentProfile(
    data: z.infer<typeof updateStudentSchema>
) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { error: "Not authenticated" };
        }

        const parsedData = updateStudentSchema.parse(data);

        // Check if student row already exists
        const { data: existing } = await supabase
            .from("students")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (existing) {
            const { error } = await supabase
                .from("students")
                .update({
                    student_number: parsedData.student_number,
                    department: parsedData.department,
                })
                .eq("id", existing.id);

            if (error) throw error;
        } else {
            const { error } = await supabase.from("students").insert({
                user_id: user.id,
                student_number: parsedData.student_number,
                department: parsedData.department,
            });

            if (error) throw error;
        }

        revalidatePath("/dashboard", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Student Setup Error:", error);
        return { error: error.message || "An error occurred" };
    }
}

export async function getPendingSupervisorRequest() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
        .from("students")
        .select(`
            supervisor_status,
            supervisors (
                user_profiles (
                    name,
                    surname
                )
            )
        `)
        .eq("user_id", user.id)
        .eq("supervisor_status", "PENDING")
        .single();

    if (error || !data) return { request: null };

    const supervisorData = Array.isArray(data.supervisors) ? data.supervisors[0] : (data.supervisors as any);
    if (!supervisorData) return { request: null };

    const supervisorProfile = Array.isArray(supervisorData.user_profiles)
        ? supervisorData.user_profiles[0]
        : supervisorData.user_profiles;

    if (!supervisorProfile) return { request: null };

    return {
        request: {
            supervisorName: `${supervisorProfile.name} ${supervisorProfile.surname}`
        }
    };
}

