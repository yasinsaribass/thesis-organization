import { getFeedbackTemplates } from "@/server/feedback-templates.server";
import { FeedbackTemplateManager } from "@/components/Supervisor/FeedbackTemplateManager";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FeedbackTemplatesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const studentId = searchParams?.studentId as string | undefined;
    const backUrl = studentId ? `/dashboard/supervisor/students/${studentId}` : "/dashboard/supervisor";

    const result = await getFeedbackTemplates();

    if ("error" in result) {
        if (result.error === "Not authenticated") redirect("/auth/login");
        return <div className="p-8 text-red-500">{result.error}</div>;
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7] pb-20">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        href={backUrl}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Feedback Templates</h1>
                        <p className="text-sm text-gray-500">Reusable messages for student feedback</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <FeedbackTemplateManager initialTemplates={result.templates} />
                </div>
            </main>
        </div>
    );
}
