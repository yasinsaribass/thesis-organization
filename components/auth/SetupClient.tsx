"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ProfileSetupForm } from "@/components/auth/profile-setup-form";
import { LogoutButton } from "@/components/auth/logout-button";

interface SetupClientProps {
    role: "STUDENT" | "SUPERVISOR";
}

export function SetupClient({ role }: SetupClientProps) {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col w-full">
            {/* Minimal Header for Logout */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <span className="font-bold text-gray-900 tracking-tight">{t.setup.headerTitle}</span>
                <LogoutButton variant="outline" />
            </header>

            <div className="flex-1 flex w-full">
                {/* Left Side: Branding / Welcome message */}
                <div className="hidden lg:flex flex-col justify-center items-start w-1/2 bg-gray-50 p-12 xl:p-24 border-r">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold tracking-tight text-[#030213] mb-4">
                            {role === "SUPERVISOR" 
                                ? t.setup.welcomeTitleSupervisor 
                                : t.setup.welcomeTitleStudent}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {role === "SUPERVISOR"
                                ? t.setup.welcomeDescSupervisor
                                : t.setup.welcomeDescStudent}
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-4 bg-white">
                    <div className="w-full max-w-md">
                        <ProfileSetupForm
                            role={role}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
