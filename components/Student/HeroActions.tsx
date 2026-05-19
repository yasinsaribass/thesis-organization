"use client";

import { MessageCircle, UserCircle, Settings, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { MessagesModal } from "./MessagesModal";

interface HeroActionsProps {
    notifications: any[];
    profile: any;
    chatData?: {
        messages: any[];
        currentUserId: string;
        otherUserId: string;
        otherUserName: string;
    };
    thesisId?: string;
}

import { LanguageSwitcher } from "@/components/Shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export function HeroActions({ notifications, profile, chatData, thesisId }: HeroActionsProps) {
    const { t } = useLanguage();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);

    return (
        <div className="flex items-center gap-3">
            <LanguageSwitcher variant="light" />
            <div className="h-4 w-px bg-white/10 mx-1" />
            <NotificationBell initialNotifications={notifications} />
            
            <button
                onClick={() => setIsMessagesModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95"
            >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.messages}</span>
            </button>

            {thesisId && (
                <Link
                    href={`/dashboard/student/consultations`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95"
                >
                    <UserCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">CONSULTATION</span>
                </Link>
            )}

            {thesisId && (
                <Link
                    href={`/dashboard/student/thesis-documents?thesis_id=${thesisId}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95"
                >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">DOCUMENTS</span>
                </Link>
            )}

            <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95"
            >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.settings}</span>
            </button>

            <LogoutButton variant="hero" />

            <ProfileSettingsModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                initialData={profile}
            />

            {chatData && (
                <MessagesModal 
                    isOpen={isMessagesModalOpen}
                    onClose={() => setIsMessagesModalOpen(false)}
                    currentUserId={chatData.currentUserId}
                    otherUserId={chatData.otherUserId}
                    otherUserName={chatData.otherUserName}
                    initialMessages={chatData.messages}
                />
            )}
        </div>
    );
}
