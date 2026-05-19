import { getThesisDocuments } from "@/server/documents.server";
import { getThesisById } from "@/server/thesis.server";
import { redirect } from "next/navigation";
import { TaskDocumentsClient } from "@/components/Student/TaskDocumentsClient";
import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";

interface ThesisDocumentsPageProps {
    searchParams: Promise<{ thesis_id?: string }>;
}

export default async function ThesisDocumentsPage({ searchParams }: ThesisDocumentsPageProps) {
    const { thesis_id } = await searchParams;

    if (!thesis_id) {
        redirect("/dashboard/student");
    }

    // Fetch the attached documents and thesis info
    const [{ documents }, { thesis }] = await Promise.all([
        getThesisDocuments(thesis_id),
        getThesisById(thesis_id)
    ]);

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/student"
                            className="p-2 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="h-8 w-px bg-gray-100 mx-2" />
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    THESIS WORKSPACE
                                </span>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full uppercase tracking-tighter">
                                    Active
                                </span>
                            </div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Thesis Documents</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    <TaskDocumentsClient 
                        thesisId={thesis_id}
                        taskId={null} 
                        initialDocuments={documents || []} 
                        thesis={thesis}
                    />
                </div>
            </main>
        </div>
    );
}
