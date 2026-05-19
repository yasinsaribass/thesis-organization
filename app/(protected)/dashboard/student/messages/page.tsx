import { Metadata } from "next";
import { getConversation } from "@/server/messages.server";
import { ChatInterface } from "@/components/Chat/ChatInterface";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Messages | Student Dashboard",
};

export default async function StudentMessagesPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    // Get the student's assigned supervisor
    const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select(`
            supervisor_id,
            supervisor:supervisor_id(
                user_profiles(id, name, surname)
            )
        `)
        .eq("user_id", user.id)
        .single();

    if (studentError || !studentData?.supervisor_id) {
        return (
            <div className="flex-1 p-8 text-center flex flex-col items-center justify-center h-[60vh]">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <MessageCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">No Supervisor Assigned</h2>
                <p className="text-slate-500 max-w-sm mb-8">
                    You need to be assigned to a supervisor before you can send messages. Please wait for an assignment or try creating a new request from the dashboard.
                </p>
                <Link
                    href="/dashboard/student"
                    className="px-6 py-2.5 bg-[#030213] text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const supervisorProfile = (studentData.supervisor as any)?.user_profiles;
    const supervisorUserId = supervisorProfile?.id;
    const supervisorName = supervisorProfile
        ? `${supervisorProfile.name || 'Your'} ${supervisorProfile.surname || 'Supervisor'}`
        : "Your Supervisor";

    if (!supervisorUserId) {
        return <div className="p-8">Supervisor user profile not found.</div>;
    }

    const { messages, currentUserId, error } = await getConversation(supervisorUserId);

    if (error) {
        return (
            <div className="p-8 text-rose-500">
                <p className="mb-4">Error loading messages: {error}</p>
                <Link href="/dashboard/student" className="text-slate-900 font-bold hover:underline">
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 max-w-5xl mx-auto w-full">
            <Link
                href="/dashboard/student"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Q&A / Messages</h2>
                <p className="text-slate-500 font-medium">
                    Discuss your thesis progress, ask questions, and get direct feedback.
                </p>
            </div>

            <div className="mt-4">
                <ChatInterface
                    currentUserId={currentUserId!}
                    otherUserId={supervisorUserId}
                    otherUserName={supervisorName}
                    initialMessages={messages || []}
                />
            </div>
        </div>
    );
}
