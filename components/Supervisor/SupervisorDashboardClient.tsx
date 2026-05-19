"use client";

import * as React from "react";
import { Plus, Users, Search, UserCircle } from "lucide-react";
import Link from "next/link";
import { StudentCard } from "@/components/Supervisor/StudentCard";
import { AddStudentModal } from "@/components/Supervisor/AddStudentModal";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface SupervisorDashboardClientProps {
    students: any[];
    supervisorProfile: {
        name: string | null;
        surname: string | null;
    } | null;
    initialNotifications: any[];
    error: string | null;
}

import { LanguageSwitcher } from "@/components/Shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export function SupervisorDashboardClient({ students, supervisorProfile, initialNotifications, error }: SupervisorDashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const { t } = useLanguage();
    const supervisorName = supervisorProfile ? `${supervisorProfile.name} ${supervisorProfile.surname}` : t.nav.supervisor;

    return (
        <div className="min-h-screen bg-[#f5f5f7] pb-20 relative">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 pt-16 pb-12 px-8 relative">
                <div className="max-w-7xl mx-auto relative">
                    {/* Top Right Actions */}
                    <div className="absolute -top-10 right-0 flex items-center gap-4">
                        <LanguageSwitcher variant="light" />
                        <div className="h-4 w-px bg-white/10 mx-1" />
                        <NotificationBell initialNotifications={initialNotifications} />
                        <Link
                            href="/dashboard/supervisor/profile"
                            className="flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                        >
                            <UserCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.nav.profile}</span>
                        </Link>
                        <LogoutButton
                            variant="hero"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-black text-indigo-200 uppercase tracking-[0.2em]">{t.supervisor.portal}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
                                {supervisorName}
                            </h1>
                            <p className="text-indigo-200 text-lg font-medium max-w-xl leading-relaxed">
                                {t.supervisor.overview}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group hidden sm:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t.supervisor.searchPlaceholder}
                                    className="pl-11 pr-6 py-3.5 bg-white border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-2xl w-[280px] text-sm font-semibold transition-all outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2.5 px-6 py-4 bg-white text-indigo-600 rounded-2xl text-sm font-black hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20"
                            >
                                <Plus className="w-4 h-4" />
                                {t.supervisor.addStudent.toUpperCase()}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 mt-12">
                {error ? (
                    <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 font-bold text-center">
                        {error}
                    </div>
                ) : students && students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {students.map((student: any) => (
                            <StudentCard key={student.id} student={student} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-8 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">{t.supervisor.noStudents}</h3>
                        <p className="text-gray-400 font-medium mb-8 text-center max-w-sm">
                            {t.supervisor.noStudentsDesc}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <Plus className="w-4 h-4" />
                            {t.supervisor.addFirstStudent.toUpperCase()}
                        </button>
                    </div>
                )}
            </main>

            <AddStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
