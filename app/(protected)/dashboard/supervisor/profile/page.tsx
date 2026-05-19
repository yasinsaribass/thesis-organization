import { Metadata } from "next";
import { getSupervisorProfile } from "@/server/profile.server";
import { ProfileClient, ProfileError } from "@/components/Supervisor/ProfileClient";

export const metadata: Metadata = {
    title: "Supervisor Profile | ThesisFlow",
    description: "Manage your academic profile information",
};

export default async function SupervisorProfilePage() {
    const { profile, error } = await getSupervisorProfile();

    if (error || !profile) {
        return <ProfileError error={error || "Profile not found"} />;
    }

    return <ProfileClient profile={profile} />;
}
