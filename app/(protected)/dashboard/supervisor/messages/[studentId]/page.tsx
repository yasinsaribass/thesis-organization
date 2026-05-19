import { Metadata } from "next";
import { getConversation } from "@/server/messages.server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SupervisorChatClient, ChatError, StudentNotFoundError } from "@/components/Supervisor/SupervisorChatClient";

export const metadata: Metadata = {
    title: "Student Messages | Supervisor Dashboard",
};

export default async function SupervisorMessagesPage(
    props: { params: Promise<{ studentId: string }> }
) {
    const params = await props.params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const studentUserId = params.studentId;

    // Fetch the student's record and profile info
    const { data: studentRecord, error: studentError } = await supabase
        .from("students")
        .select(`
            id,
            user_profiles (
                name,
                surname
            )
        `)
        .eq("user_id", studentUserId)
        .single();

    if (studentError || !studentRecord) {
        return <StudentNotFoundError />;
    }

    const profile = studentRecord.user_profiles as any;
    const studentName = `${profile?.name || 'Student'} ${profile?.surname || ''}`;
    const studentTableId = studentRecord.id;

    const { messages, currentUserId, error } = await getConversation(studentUserId);

    if (error) {
        return <ChatError message={error} />;
    }

    return (
        <SupervisorChatClient
            studentId={studentUserId}
            studentName={studentName}
            studentTableId={studentTableId}
            currentUserId={currentUserId!}
            initialMessages={messages || []}
        />
    );
}
