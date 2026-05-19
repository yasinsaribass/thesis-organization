"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getStudentProfile() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("name, surname, phone_number, avatar_url")
        .eq("id", user.id)
        .single();

    if (profileError) return { error: profileError.message };

    // Fetch student specific data
    const { data: student, error: studentError } = await supabase
        .from("students")
        .select("student_number, department")
        .eq("user_id", user.id)
        .single();

    if (studentError) return { error: studentError.message };

    return {
        profile: {
            name: profile.name || "",
            surname: profile.surname || "",
            phone_number: profile.phone_number || "",
            avatar_url: profile.avatar_url,
            student_number: student.student_number || "",
            department: student.department || "",
            email: user.email || ""
        }
    };
}

export async function updateStudentProfile(data: {
    name: string;
    surname: string;
    phone_number?: string;
    student_number: string;
    department: string;
}) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Update user_profiles table
    const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
            name: data.name,
            surname: data.surname,
            phone_number: data.phone_number || null,
        })
        .eq("id", user.id);

    if (profileError) return { error: profileError.message };

    // Update students table
    const { error: studentError } = await supabase
        .from("students")
        .update({
            student_number: data.student_number,
            department: data.department,
        })
        .eq("user_id", user.id);

    if (studentError) return { error: studentError.message };

    revalidatePath("/dashboard/student/profile");
    return { success: true };
}

export async function getSupervisorProfile() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("name, surname, phone_number, avatar_url")
        .eq("id", user.id)
        .single();

    if (profileError) return { error: profileError.message };

    // Fetch supervisor specific data
    const { data: supervisor, error: supervisorError } = await supabase
        .from("supervisors")
        .select("department, academic_title, capacity")
        .eq("user_id", user.id)
        .single();

    if (supervisorError) return { error: supervisorError.message };

    return {
        profile: {
            name: profile.name || "",
            surname: profile.surname || "",
            phone_number: profile.phone_number || "",
            avatar_url: profile.avatar_url,
            department: supervisor.department || "",
            academic_title: supervisor.academic_title || "",
            capacity: supervisor.capacity || 10,
            email: user.email || ""
        }
    };
}

export async function updateSupervisorProfile(data: {
    name: string;
    surname: string;
    phone_number?: string;
    department: string;
    academic_title?: string;
    capacity: number;
}) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // Update user_profiles table
    const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
            name: data.name,
            surname: data.surname,
            phone_number: data.phone_number || null,
        })
        .eq("id", user.id);

    if (profileError) return { error: profileError.message };

    // Update supervisors table
    const { error: supervisorError } = await supabase
        .from("supervisors")
        .update({
            department: data.department,
            academic_title: data.academic_title || null,
            capacity: data.capacity,
        })
        .eq("user_id", user.id);

    if (supervisorError) return { error: supervisorError.message };

    revalidatePath("/dashboard/supervisor/profile");
    return { success: true };
}

export async function updateAvatarUrl(url: string) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from("user_profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/student/profile");
    return { success: true };
}
