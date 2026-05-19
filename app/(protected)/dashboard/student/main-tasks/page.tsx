"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StudentMainTasksPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/student");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-gray-500">Redirecting to Dashboard...</p>
            </div>
        </div>
    );
}
