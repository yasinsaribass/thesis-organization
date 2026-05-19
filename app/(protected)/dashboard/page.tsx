import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role === "STUDENT") {
        redirect("/dashboard/student");
    } else if (profile?.role === "SUPERVISOR") {
        redirect("/dashboard/supervisor");
    }

    // Default to setup if role is missing or unknown
    redirect("/dashboard/setup");
}
