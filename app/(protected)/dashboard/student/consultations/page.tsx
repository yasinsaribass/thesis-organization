import { getAvailableSlots, getStudentConsultations } from "@/server/consultations.server";
import { StudentConsultationsClient } from "@/components/Student/StudentConsultationsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentConsultationsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth");
    }

    // Get student ID and supervisor ID
    const { data: student } = await supabase
        .from("students")
        .select("id, supervisor_id")
        .eq("user_id", user.id)
        .single();

    if (!student || !student.supervisor_id) {
        // Fallback or show empty if no supervisor assigned
        return <div className="p-10 text-center">No supervisor assigned yet.</div>;
    }

    const [{ slots }, { consultations }] = await Promise.all([
        getAvailableSlots(student.supervisor_id),
        getStudentConsultations(student.id)
    ]);

    return (
        <StudentConsultationsClient 
            studentId={student.id}
            initialAvailableSlots={slots || []}
            initialMyConsultations={consultations || []}
        />
    );
}
