import { getSupervisorConsultations } from "@/server/consultations.server";
import { ConsultationsClient } from "@/components/Supervisor/ConsultationsClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SupervisorConsultationsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth");
    }

    // Get supervisor ID
    const { data: supervisor } = await supabase
        .from("supervisors")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!supervisor) {
        redirect("/dashboard/student");
    }

    const { consultations } = await getSupervisorConsultations(supervisor.id);

    return (
        <ConsultationsClient 
            supervisorId={supervisor.id} 
            initialConsultations={consultations || []} 
        />
    );
}
