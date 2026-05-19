import { getStudentDashboardData } from "@/server/tasks.server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllThesisTasks } from "@/server/tasks.server";
import { getUnreadNotifications } from "@/server/notifications.server";
import { getPendingSupervisorRequest } from "@/server/student.server";
import { getStudentGamification, getLeaderboard } from "@/server/gamification.server";
import { getStudentProfile } from "@/server/profile.server";
import { getConversation } from "@/server/messages.server";
import { StudentDashboardClient } from "@/components/Student/StudentDashboardClient";

export default async function StudentDashboardPage() {
    const result = await getStudentDashboardData();
    const { request } = await getPendingSupervisorRequest();
    const { notifications } = await getUnreadNotifications();
    const gamificationResult = await getStudentGamification();
    const leaderboardResult = await getLeaderboard();
    const profileResult = await getStudentProfile();
    const allTasksResult = await getAllThesisTasks();

    if ("error" in result) {
        redirect("/auth/login");
    }

    // Fetch conversation data for the Messages Modal
    let chatData = undefined;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: studentData } = await supabase
            .from("students")
            .select(`
                supervisor_id,
                supervisor:supervisor_id(
                    user_profiles(id, name, surname)
                )
            `)
            .eq("user_id", user.id)
            .single();

        if (studentData?.supervisor_id) {
            const supervisorProfile = (studentData.supervisor as any)?.user_profiles;
            const supervisorUserId = supervisorProfile?.id;
            const supervisorName = supervisorProfile
                ? `${supervisorProfile.name || 'Your'} ${supervisorProfile.surname || 'Supervisor'}`
                : "Your Supervisor";

            if (supervisorUserId) {
                const { messages, currentUserId } = await getConversation(supervisorUserId);
                chatData = {
                    messages: messages || [],
                    currentUserId: currentUserId!,
                    otherUserId: supervisorUserId,
                    otherUserName: supervisorName
                };
            }
        }
    }

    const { thesis, mainTasks, supervisorTasks, stats } = result as any;

    return (
        <StudentDashboardClient 
            thesis={thesis}
            mainTasks={mainTasks}
            supervisorTasks={supervisorTasks}
            stats={stats}
            notifications={notifications}
            profile={!("error" in profileResult) ? profileResult.profile : undefined}
            gamification={!("error" in gamificationResult) ? gamificationResult : undefined}
            leaderboard={!("error" in leaderboardResult) ? leaderboardResult.leaderboard : []}
            allTasks={!("error" in allTasksResult) ? allTasksResult : undefined}
            request={request}
            chatData={chatData}
        />
    );
}
