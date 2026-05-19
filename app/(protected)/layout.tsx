import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("user_profiles")
        .select(
            `
            role,
            students (*),
            supervisors (*)
        `
        )
        .eq("id", user.id)
        .single();

    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    // Robust check for setup route
    const isSetupRoute = pathname.includes("/dashboard/setup");

    console.log("DEBUG: ProtectedLayout Details", {
        pathname,
        isSetupRoute,
        role: profile?.role,
        hasStudent: profile ? !!(Array.isArray(profile.students) ? profile.students[0] : profile.students) : false
    });

    let needsSetup = false;

    if (profile?.role === "STUDENT") {
        const student = profile.students ? (Array.isArray(profile.students)
            ? profile.students[0]
            : profile.students) : null;

        if (!student || !student.student_number || !student.department) {
            needsSetup = true;
        }
    } else if (profile?.role === "SUPERVISOR") {
        const supervisor = profile.supervisors ? (Array.isArray(profile.supervisors)
            ? profile.supervisors[0]
            : profile.supervisors) : null;

        if (
            !supervisor ||
            !supervisor.academic_title ||
            !supervisor.department ||
            supervisor.capacity === null
        ) {
            needsSetup = true;
        }
    }

    console.log("DEBUG: Needs Setup Final:", needsSetup);

    // --- REDIRECTION LOGIC ---

    // Safety: If no role is found, don't start redirecting or we'll loop forever
    if (!profile?.role && !isSetupRoute) {
        console.log("DEBUG: No role found, skipping redirect to avoid loop");
        return <>{children}</>;
    }

    // 1. Needs setup but NOT on setup page -> Go to setup
    if (needsSetup && !isSetupRoute) {
        console.log("DEBUG: Redirecting to Setup");
        return redirect("/dashboard/setup");
    }

    // 2. Already setup but ON setup page -> Go to dashboard
    if (!needsSetup && isSetupRoute) {
        console.log("DEBUG: Already setup, redirecting away from Setup");
        if (profile?.role === "STUDENT") return redirect("/dashboard/student");
        if (profile?.role === "SUPERVISOR") return redirect("/dashboard/supervisor");
        return redirect("/dashboard");
    }

    return <>{children}</>;
}
