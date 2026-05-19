"use client";

import Link from "next/link";
import { User, ChevronRight, GraduationCap, Trash2, Loader2 } from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { removeStudent } from "@/server/supervisor.server";

interface StudentCardProps {
    student: {
        id: string;
        user_id: string;
        supervisor_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
        user_profiles: any; // Can be object or array depending on Supabase structure
        theses: Array<{
            id: string;
            title: string;
            status: string;
        }> | null;
    };
}

import { useLanguage } from "@/context/LanguageContext";

export function StudentCard({ student }: StudentCardProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Normalize profile and thesis data
    const profile = Array.isArray(student.user_profiles) ? student.user_profiles[0] : student.user_profiles;
    const fullName = (profile?.name || profile?.surname)
        ? `${profile.name ?? ""} ${profile.surname ?? ""}`.trim()
        : t.supervisor.studentCard.unknownStudent;

    const thesis = Array.isArray(student.theses) ? student.theses[0] : student.theses;
    const isPending = student.supervisor_status === 'PENDING';

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmMsg = t.supervisor.studentCard.removeConfirm.replace("{name}", fullName);
        if (confirm(confirmMsg)) {
            setIsDeleting(true);
            const res = await removeStudent(student.id);
            if (res.error) {
                alert(res.error);
                setIsDeleting(false);
            } else {
                router.refresh();
            }
        }
    };

    return (
        <div className={`bg-white rounded-[2rem] border p-8 shadow-sm hover:shadow-md transition-all duration-300 group relative ${isPending ? 'border-amber-200' : 'border-gray-100'}`}>
            {/* Delete Button */}
            <button
                onClick={handleRemove}
                disabled={isDeleting}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                title={t.modals.cancel}
            >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>

            <div className="flex flex-col h-full">
                {/* Avatar/Icon & Name */}
                <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${isPending ? 'bg-amber-50 text-amber-600' : 'bg-[#f5f5f7] text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={fullName} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                        <h3 className="text-xl font-black text-gray-900 truncate tracking-tight">{fullName}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            {isPending ? (
                                <>
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{t.supervisor.studentCard.waitingApproval}</span>
                                </>
                            ) : (
                                <>
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">{t.supervisor.studentCard.thesisStudent}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thesis Info */}
                <div className="mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.supervisor.studentCard.projectTitle}</p>
                    <p className="text-sm font-semibold text-gray-600 line-clamp-2 leading-relaxed h-[2.8rem]">
                        {thesis?.title ?? t.supervisor.studentCard.noThesisRegistered}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-auto">
                    {isPending ? (
                        <div className="w-full py-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-black text-center uppercase tracking-widest">
                            {t.supervisor.studentCard.accessRestricted}
                        </div>
                    ) : (
                        <Link
                            href={`/dashboard/supervisor/students/${student.id}`}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-50 text-indigo-600 text-sm font-black hover:bg-indigo-600 hover:text-white transition-all duration-300"
                        >
                            {t.supervisor.studentCard.viewDetail.toUpperCase()}
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
