import { getStudentDetails } from "@/server/supervisor.server";
import { getSupervisorVisibleDocuments } from "@/server/documents.server";
import { SupervisorDocumentsClient } from "@/components/Supervisor/SupervisorDocumentsClient";
import { notFound } from "next/navigation";

export default async function StudentDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { student, thesis, error } = await getStudentDetails(id);

    if (error || !student) {
        return notFound();
    }

    if (!thesis) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No Thesis Registered</h1>
                <p className="text-gray-500">This student hasn't registered a thesis yet.</p>
            </div>
        );
    }

    const { documents, error: docsError } = await getSupervisorVisibleDocuments(thesis.id);

    if (docsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-rose-600">
                <h1 className="text-2xl font-bold mb-2">Error Loading Documents</h1>
                <p>{docsError}</p>
            </div>
        );
    }

    const profile = Array.isArray(student.user_profiles) ? student.user_profiles[0] : student.user_profiles;
    const studentName = profile ? `${profile.name} ${profile.surname}` : "Student";

    return (
        <SupervisorDocumentsClient
            documents={documents || []}
            studentName={studentName}
            thesisTitle={thesis.title}
            studentId={id}
            thesisId={thesis.id}
        />
    );
}
