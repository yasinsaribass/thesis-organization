"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { notifications: [], count: 0 };

    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, message, body, link, is_read, created_at")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) {
        console.error("[getUnreadNotifications] error:", error.message);
        return { notifications: [], count: 0 };
    }

    // normalize body field (may be in `message` or `body`)
    const normalized = (data ?? []).map((n: any) => ({
        ...n,
        body: n.body ?? n.message ?? null,
    }));

    return { notifications: normalized, count: normalized.length };
}

export async function getAllNotifications() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { notifications: [] };

    const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, message, body, link, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) return { notifications: [] };

    const normalized = (data ?? []).map((n: any) => ({
        ...n,
        body: n.body ?? n.message ?? null,
    }));

    return { notifications: normalized };
}

export async function markNotificationsRead(ids: string[]) {
    if (!ids.length) return { success: true };

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", ids)
        .eq("user_id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard", "layout");
    return { success: true };
}

export async function markAllNotificationsRead() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (error) return { error: error.message };

    revalidatePath("/dashboard", "layout");
    return { success: true };
}
