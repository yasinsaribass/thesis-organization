"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ChatInterface } from "@/components/Chat/ChatInterface";
import { useLanguage } from "@/context/LanguageContext";

interface SupervisorChatClientProps {
    studentId: string;
    studentName: string;
    studentTableId: string;
    currentUserId: string;
    initialMessages: any[];
}

export function SupervisorChatClient({
    studentId,
    studentName,
    studentTableId,
    currentUserId,
    initialMessages
}: SupervisorChatClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 max-w-5xl mx-auto w-full">
            <Link
                href={`/dashboard/supervisor/students/${studentTableId}`}
                className="inline-flex items-center text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.supervisor.chat.backToProfile}
            </Link>

            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    {t.supervisor.chat.title.replace("{name}", studentName)}
                </h2>
                <p className="text-slate-500 font-medium">
                    {t.supervisor.chat.subtitle}
                </p>
            </div>

            <div className="mt-4">
                <ChatInterface
                    currentUserId={currentUserId}
                    otherUserId={studentId}
                    otherUserName={studentName}
                    initialMessages={initialMessages}
                />
            </div>
        </div>
    );
}

export function ChatError({ message }: { message: string }) {
    const { t } = useLanguage();
    return <div className="p-8 text-rose-500">{t.supervisor.chat.loadError.replace("{error}", message)}</div>;
}

export function StudentNotFoundError() {
    const { t } = useLanguage();
    return <div className="p-8">{t.supervisor.chat.recordNotFound}</div>;
}
