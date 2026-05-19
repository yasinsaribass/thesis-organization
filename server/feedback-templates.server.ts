"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Get all feedback templates for the logged-in supervisor */
export async function getFeedbackTemplates() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: supervisor } = await supabase
        .from("supervisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!supervisor) return { error: "Supervisor profile not found" };

    const { data: templates, error } = await supabase
        .from("feedback_templates")
        .select("id, title, content, category, created_at")
        .eq("supervisor_id", supervisor.id)
        .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { templates: templates ?? [] };
}

/** Create a new feedback template */
export async function createFeedbackTemplate(data: {
    title: string;
    content: string;
    category?: string;
}) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: supervisor } = await supabase
        .from("supervisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!supervisor) return { error: "Supervisor profile not found" };

    if (!data.title.trim() || !data.content.trim()) {
        return { error: "Title and content are required" };
    }

    const { error } = await supabase.from("feedback_templates").insert({
        supervisor_id: supervisor.id,
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category?.trim() || null,
    });

    if (error) return { error: error.message };

    revalidatePath("/dashboard/supervisor/feedback-templates");
    return { success: true };
}

/** Delete a feedback template */
export async function deleteFeedbackTemplate(templateId: string) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from("feedback_templates")
        .delete()
        .eq("id", templateId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/supervisor/feedback-templates");
    return { success: true };
}

/** Update an existing feedback template */
export async function updateFeedbackTemplate(
    templateId: string,
    data: { title: string; content: string; category?: string }
) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    if (!data.title.trim() || !data.content.trim()) {
        return { error: "Title and content are required" };
    }

    const { error } = await supabase
        .from("feedback_templates")
        .update({
            title: data.title.trim(),
            content: data.content.trim(),
            category: data.category?.trim() || null,
        })
        .eq("id", templateId);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/supervisor/feedback-templates");
    return { success: true };
}
