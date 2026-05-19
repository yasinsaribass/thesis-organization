"use client";

import { UserCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";
import { useLanguage } from "@/context/LanguageContext";

interface ProfileClientProps {
    profile: any;
}

export function ProfileClient({ profile }: ProfileClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t.nav.profile}</h2>
                <p className="text-slate-500">
                    {t.supervisor.profile.subtitle}
                </p>
            </div>

            <div className="mt-8">
                <ProfileForm initialData={profile} />
            </div>
        </div>
    );
}

export function ProfileError({ error }: { error: string }) {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <UserCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-slate-900">{t.supervisor.profile.loadErrorTitle}</h2>
            <p className="text-slate-500 max-w-md mx-auto">
                {t.supervisor.profile.loadErrorDesc}
                <br />
                <span className="text-xs font-mono mt-2 block opacity-70 border border-slate-200 bg-slate-50 p-2 rounded">{error}</span>
            </p>
        </div>
    );
}
