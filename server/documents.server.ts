"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Upload a Word document and link it to a specific task or thesis.
 */
export async function uploadTaskDocument(thesisId: string, taskId: string | null, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    // Validate MIME type (Word documents)
    const validMimeTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!validMimeTypes.includes(file.type) && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        return { error: "Invalid file type. Only Word documents (.doc, .docx) are allowed." };
    }

    // 2. Get student_id from thesis
    const { data: thesis, error: thesisError } = await supabase
        .from("theses")
        .select("student_id")
        .eq("id", thesisId)
        .single();

    if (thesisError || !thesis) return { error: "Thesis not found" };

    // Ensure the current user is the student
    const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (student && student.id !== thesis.student_id) {
        return { error: "You do not have permission to upload documents for this thesis." };
    }

    const studentId = thesis.student_id;
    const fileExt = file.name.split('.').pop();
    const prefix = taskId ? taskId : thesisId;
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;
    const filePath = `${studentId}/${fileName}`;

    // 3. Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from("thesis-documents")
        .upload(filePath, file);

    if (uploadError) return { error: `Storage upload failed: ${uploadError.message}` };

    const isVisible = formData.get("visibleToSupervisor") === "true";
    const documentType = formData.get("documentType") as string || "OTHER";

    // 4. Insert database record
    const { data: document, error: dbError } = await supabase
        .from("thesis_documents")
        .insert({
            thesis_id: thesisId,
            student_id: studentId,
            task_id: taskId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type || "application/msword",
            visible_to_supervisor: isVisible,
            document_type: documentType
        })
        .select()
        .single();

    if (dbError) {
        // Cleanup storage if DB insert fails
        await supabase.storage.from("thesis-documents").remove([filePath]);
        return { error: `Database insert failed: ${dbError.message}` };
    }

    if (taskId) {
        revalidatePath(`/dashboard/student/documents`);
    } else {
        revalidatePath(`/dashboard/student/thesis-documents`);
    }
    
    return { success: true, document };
}

/**
 * Get all documents for a specific task
 */
export async function getTaskDocuments(taskId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
        .from("thesis_documents")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { documents: data || [] };
}

/**
 * Get all documents for a specific thesis
 */
export async function getThesisDocuments(thesisId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
        .from("thesis_documents")
        .select("*, tasks(title)")
        .eq("thesis_id", thesisId)
        .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { documents: data || [] };
}

/**
 * Get all documents for a specific thesis that are visible to the supervisor
 * Checks both the document-level visibility and the thesis-level master switch
 */
export async function getSupervisorVisibleDocuments(thesisId: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. First check if the thesis has visibility enabled globally
    const { data: thesis } = await supabase
        .from("theses")
        .select("visible_to_supervisor_default")
        .eq("id", thesisId)
        .single();

    // If master switch is OFF, ONLY return documents uploaded by the supervisor
    if (thesis && thesis.visible_to_supervisor_default === false) {
        const { data, error } = await supabase
            .from("thesis_documents")
            .select("*, tasks(title)")
            .eq("thesis_id", thesisId)
            .like("file_path", "%supervisor-%")
            .order("created_at", { ascending: false });

        if (error) return { error: error.message };
        return { documents: data || [] };
    }
    
    // If master switch is ON, return supervisor docs + visible student docs
    const { data, error } = await supabase
        .from("thesis_documents")
        .select("*, tasks(title)")
        .eq("thesis_id", thesisId)
        .or("visible_to_supervisor.eq.true,file_path.like.%supervisor-%")
        .order("created_at", { ascending: false });

    if (error) return { error: error.message };
    return { documents: data || [] };
}

/**
 * Upload a Word document by a supervisor.
 */
export async function uploadSupervisorDocument(thesisId: string, formData: FormData) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    // Validate MIME type (Word documents)
    const validMimeTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!validMimeTypes.includes(file.type) && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        return { error: "Invalid file type. Only Word documents (.doc, .docx) are allowed." };
    }

    // Get student_id from thesis
    const { data: thesis, error: thesisError } = await supabase
        .from("theses")
        .select("student_id")
        .eq("id", thesisId)
        .single();

    if (thesisError || !thesis) return { error: "Thesis not found" };

    const studentId = thesis.student_id;
    const fileExt = file.name.split('.').pop();
    const fileName = `supervisor-${Date.now()}.${fileExt}`;
    const filePath = `${studentId}/${fileName}`;

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from("thesis-documents")
        .upload(filePath, file);

    if (uploadError) return { error: `Storage upload failed: ${uploadError.message}` };

    const documentType = formData.get("documentType") as string || "OTHER";

    // Insert database record
    const { data: document, error: dbError } = await supabase
        .from("thesis_documents")
        .insert({
            thesis_id: thesisId,
            student_id: studentId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type || "application/msword",
            visible_to_supervisor: true, // Supervisor uploaded docs are always visible to themselves
            document_type: documentType
        })
        .select()
        .single();

    if (dbError) {
        // Cleanup storage if DB insert fails
        await supabase.storage.from("thesis-documents").remove([filePath]);
        return { error: `Database insert failed: ${dbError.message}` };
    }

    revalidatePath(`/dashboard/supervisor/students/${studentId}/documents`);
    
    return { success: true, document };
}

/**
 * Delete a document by its ID
 */
export async function deleteDocument(documentId: string) {
    const supabase = await createSupabaseServerClient();
    
    // 1. Get document details
    const { data: doc, error: docError } = await supabase
        .from("thesis_documents")
        .select("file_path, task_id")
        .eq("id", documentId)
        .single();

    if (docError || !doc) return { error: "Document not found" };

    // 2. Remove from Storage
    const { error: storageError } = await supabase.storage
        .from("thesis-documents")
        .remove([doc.file_path]);

    if (storageError) {
        console.error("Storage deletion error:", storageError);
        // Continue to delete from DB even if storage deletion fails
    }

    // 3. Delete from DB
    const { error: dbError } = await supabase
        .from("thesis_documents")
        .delete()
        .eq("id", documentId);

    if (dbError) return { error: dbError.message };

    revalidatePath(`/dashboard/student/documents`);
    return { success: true };
}

/**
 * Get a temporary signed URL to download a document
 */
export async function downloadDocument(documentId: string) {
    const supabase = await createSupabaseServerClient();
    
    const { data: doc, error: docError } = await supabase
        .from("thesis_documents")
        .select("file_path, file_name")
        .eq("id", documentId)
        .single();

    if (docError || !doc) return { error: "Document not found" };

    // Create a signed URL valid for 60 seconds
    const { data, error } = await supabase.storage
        .from("thesis-documents")
        .createSignedUrl(doc.file_path, 60, {
            download: doc.file_name // Force download with original filename
        });

    if (error || !data) return { error: "Failed to generate download URL" };

    return { url: data.signedUrl };
}

/**
 * Toggle the visibility of a document to the supervisor
 */
export async function toggleDocumentVisibility(documentId: string, newVisibility: boolean) {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
        .from("thesis_documents")
        .update({ visible_to_supervisor: newVisibility })
        .eq("id", documentId);

    if (error) return { error: `Failed to update visibility: ${error.message}` };

    revalidatePath(`/dashboard/student/documents`);
    revalidatePath(`/dashboard/student/thesis-documents`);
    return { success: true };
}

/**
 * Toggle the visibility of multiple documents to the supervisor
 */
export async function toggleAllDocumentsVisibility(documentIds: string[], newVisibility: boolean) {
    const supabase = await createSupabaseServerClient();
    
    if (!documentIds.length) return { success: true };

    const { error } = await supabase
        .from("thesis_documents")
        .update({ visible_to_supervisor: newVisibility })
        .in("id", documentIds);

    if (error) return { error: `Failed to update visibility: ${error.message}` };

    revalidatePath(`/dashboard/student/documents`);
    revalidatePath(`/dashboard/student/thesis-documents`);
    return { success: true };
}
