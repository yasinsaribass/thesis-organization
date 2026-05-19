import { getStudentDetails } from "@/server/supervisor.server";
import { getFeedbackTemplates } from "@/server/feedback-templates.server";
import { StudentDetailClient } from "@/components/Supervisor/StudentDetailClient";
import { getConversation } from "@/server/messages.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { student, thesis, mainTasks, suggestions, error } = await getStudentDetails(id) as any;
    const { templates } = await getFeedbackTemplates();

    // Fetch chat data for the Messages Modal
    let chatData = undefined;
    if (student) {
        const studentUserId = student.user_profiles?.id || student.user_id;
        const studentName = student.user_profiles 
            ? `${student.user_profiles.name || 'Student'} ${student.user_profiles.surname || ''}`
            : "Your Student";

        if (studentUserId) {
            const { messages, currentUserId } = await getConversation(studentUserId);
            chatData = {
                messages: messages || [],
                currentUserId: currentUserId!,
                otherUserId: studentUserId,
                otherUserName: studentName
            };
        }
    }

    if (error || !student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center space-y-4">
                    <h2 className="text-2xl font-black text-red-500">Error Loading Student</h2>
                    <p className="text-gray-400 font-medium">{error || "Student not found"}</p>
                    <a href="/dashboard/supervisor" className="inline-block px-8 py-3 bg-[#030213] text-white rounded-xl text-sm font-black">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <StudentDetailClient
            student={student}
            thesis={thesis}
            mainTasks={mainTasks}
            suggestions={suggestions}
            supervisorId={user.id}
            templates={templates || []}
            chatData={chatData}
        />
    );
}
