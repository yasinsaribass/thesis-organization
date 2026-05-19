"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createThesis(title: string) {
    try {
        const supabase = await createSupabaseServerClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        // Get student record
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (studentError || !student) {
            console.error("Student lookup error:", studentError);
            return { error: "Student profile not found. Please complete your profile setup." };
        }

        // Create thesis
        const { data, error } = await supabase.from("theses").insert({
            title: title.trim(),
            student_id: student.id,
            status: "IN_PROGRESS"
        }).select().single();

        if (error) {
            console.error("Thesis creation error:", error);
            return { error: `Database error: ${error.message}` };
        }

        revalidatePath("/dashboard/student", "layout");
        revalidatePath("/", "layout");

        return { success: true, thesis: data };
    } catch (err: any) {
        console.error("createThesis unexpected error:", err);
        return { error: err.message || "An unexpected error occurred" };
    }
}

/**
 * Update the default visibility preference for a thesis
 */
export async function updateThesisVisibilityDefault(thesisId: string, isVisible: boolean) {
    try {
        const supabase = await createSupabaseServerClient();
        
        const { error } = await supabase
            .from("theses")
            .update({ visible_to_supervisor_default: isVisible })
            .eq("id", thesisId);

        if (error) throw error;

        revalidatePath("/dashboard/student", "layout");
        return { success: true };
    } catch (err: any) {
        console.error("updateThesisVisibilityDefault Error:", err);
        return { error: err.message || "An error occurred" };
    }
}

/**
 * Get a specific thesis by ID
 */
export async function getThesisById(thesisId: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("theses")
            .select("*")
            .eq("id", thesisId)
            .single();

        if (error) throw error;
        return { thesis: data };
    } catch (err: any) {
        return { error: err.message || "Failed to fetch thesis" };
    }
}
