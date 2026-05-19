import { getSupervisorStudents } from "@/server/supervisor.server";
import { SupervisorDashboardClient } from "@/components/Supervisor/SupervisorDashboardClient";
import { getUnreadNotifications } from "@/server/notifications.server";

export default async function SupervisorDashboardPage() {
    const { students, supervisorProfile, error } = await getSupervisorStudents() as any;
    const { notifications } = await getUnreadNotifications();

    return (
        <SupervisorDashboardClient
            students={students || []}
            supervisorProfile={supervisorProfile || null}
            initialNotifications={notifications}
            error={error || null}
        />
    );
}


