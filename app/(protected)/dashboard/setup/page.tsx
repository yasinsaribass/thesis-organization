import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SetupClient } from "@/components/auth/SetupClient";

export const metadata = {
    title: "Profile Setup | ThesisFlow",
    description: "Please complete your profile information.",
};

export default async function SetupPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth/login");
    }

    // Fetch the user's role
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile?.role) {
        redirect("/auth/login");
    }

    return (
        <SetupClient
            role={profile.role as "STUDENT" | "SUPERVISOR"}
        />
    );
}
