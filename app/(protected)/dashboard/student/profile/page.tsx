import { Metadata } from "next";
import { UserCircle } from "lucide-react";
import { getStudentProfile } from "@/server/profile.server";
import { ProfileForm } from "@/components/Student/ProfileForm";

export const metadata: Metadata = {
    title: "My Profile | ThesisFlow",
    description: "Manage your student profile information",
};

export default async function StudentProfilePage() {
    const { profile, error } = await getStudentProfile();

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <UserCircle className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-slate-900">Unable to load profile</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    We encountered an error while retrieving your profile information. Please try refreshing the page.
                    <br />
                    <span className="text-xs font-mono mt-2 block opacity-70 border border-slate-200 bg-slate-50 p-2 rounded">{error}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Student Profile</h2>
                <p className="text-slate-500">
                    Manage your personal details and university information.
                </p>
            </div>

            <div className="mt-8">
                <ProfileForm initialData={profile} />
            </div>
        </div>
    );
}
