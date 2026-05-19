"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function logout() {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/auth/login");
}
