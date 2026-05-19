"use client";

import React, { useState, useRef } from "react";
import { uploadTaskDocument, deleteDocument, downloadDocument, toggleDocumentVisibility, toggleAllDocumentsVisibility } from "@/server/documents.server";
import { updateThesisVisibilityDefault } from "@/server/thesis.server";
import { FileText, UploadCloud, Trash2, Download, AlertCircle, Loader2, FileCheck2, FileUp, Eye, EyeOff } from "lucide-react";

interface Document {
    id: string;
    file_name: string;
    file_size: number;
    created_at: string;
    visible_to_supervisor: boolean;
    file_path?: string;
    document_type?: string;
}

interface TaskDocumentsClientProps {
    thesisId: string;
    taskId: string | null;
    initialDocuments: Document[];
    thesis?: {
        id: string;
        visible_to_supervisor_default: boolean;
    };
}

const CATEGORIES = [
    { id: '25%', label: 'Thesis %25', description: 'Early draft and proposal' },
    { id: '50%', label: 'Thesis %50', description: 'Mid-term progress report' },
    { id: '75%', label: 'Thesis %75', description: 'Final draft for review' },
    { id: '100%', label: 'Thesis %100', description: 'Complete final version' },
    { id: 'OTHER', label: 'Other Documents', description: 'Appendices, data, and resources' }
];

export function TaskDocumentsClient({ thesisId, taskId, initialDocuments, thesis }: TaskDocumentsClientProps) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [targetCategory, setTargetCategory] = useState<string>("OTHER");

    const [isGloballyVisible, setIsGloballyVisible] = useState(
        thesis ? thesis.visible_to_supervisor_default : 
        (documents.length > 0 ? documents.every(d => d.visible_to_supervisor) : true)
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUpload(file, category);
        }
    };

    const handleUpload = async (file: File, category: string) => {
        setUploadError(null);
        
        if (!file.name.endsWith('.doc') && !file.name.endsWith('.docx') && file.type !== "application/msword" && file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            setUploadError("Only Word documents (.doc, .docx) are supported.");
            return;
        }

        setUploadingCategory(category);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visibleToSupervisor", isGloballyVisible.toString());
        formData.append("documentType", category);

        try {
            const result = await uploadTaskDocument(thesisId, taskId, formData);
            if (result.error) {
                setUploadError(result.error);
            } else if (result.document) {
                setDocuments(prev => [result.document as Document, ...prev]);
            }
        } catch (error: any) {
            setUploadError(error.message || "An unexpected error occurred during upload.");
        } finally {
            setUploadingCategory(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        
        const result = await deleteDocument(documentId);
        if (result.error) {
            alert(result.error);
        } else {
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        }
    };

    const handleDownload = async (documentId: string) => {
        const result = await downloadDocument(documentId);
        if (result.error) {
            alert(result.error);
        } else if (result.url) {
            window.open(result.url, "_blank");
        }
    };

    const handleToggleAllVisibility = async () => {
        const newVisibility = !isGloballyVisible;
        const studentDocs = documents.filter(d => !d.file_path?.includes('supervisor-'));
        const documentIds = studentDocs.map(d => d.id);
        
        setIsGloballyVisible(newVisibility);
        setDocuments(prev => prev.map(doc => 
            !doc.file_path?.includes('supervisor-') 
                ? { ...doc, visible_to_supervisor: newVisibility }
                : doc
        ));

        if (thesisId) {
            await updateThesisVisibilityDefault(thesisId, newVisibility);
        }

        if (documentIds.length > 0) {
            const result = await toggleAllDocumentsVisibility(documentIds, newVisibility);
            if (result.error) {
                alert(`Error updating documents: ${result.error}`);
            }
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8">
            {/* Global Visibility Setting */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isGloballyVisible ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {isGloballyVisible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Visibility Setting</h3>
                        <p className="text-sm font-medium text-gray-500">
                            {isGloballyVisible ? "All documents are visible to your supervisor" : "All documents are hidden from your supervisor"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleToggleAllVisibility}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isGloballyVisible ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isGloballyVisible ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                </button>
            </div>

            {uploadError && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-4">
                    <AlertCircle className="w-5 h-5" />
                    {uploadError}
                    <button onClick={() => setUploadError(null)} className="ml-auto hover:bg-rose-100 p-1 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Categorized Sections */}
            <div className="space-y-6">
                {CATEGORIES.map((cat) => {
                    const catDocs = documents.filter(d => d.document_type === cat.id);
                    const isUploadingThis = uploadingCategory === cat.id;

                    return (
                        <div key={cat.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-all duration-300">
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                            catDocs.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'
                                        }`}>
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">{cat.label}</h3>
                                            <p className="text-sm font-medium text-gray-400">{cat.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="file" 
                                            id={`file-${cat.id}`}
                                            onChange={(e) => handleFileSelect(e, cat.id)}
                                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor={`file-${cat.id}`}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all ${
                                                isUploadingThis 
                                                ? 'bg-gray-100 text-gray-400 pointer-events-none' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {isUploadingThis ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UploadCloud className="w-4 h-4" />
                                            )}
                                            {isUploadingThis ? "Uploading..." : "Upload File"}
                                        </label>
                                    </div>
                                </div>

                                {catDocs.length === 0 ? (
                                    <div className="py-10 text-center border-2 border-dashed border-gray-50 rounded-[2rem] bg-gray-50/30">
                                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">No documents in this section</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {catDocs.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-indigo-100 transition-all group/item">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate" title={doc.file_name}>{doc.file_name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                                doc.file_path?.includes('supervisor-') 
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {doc.file_path?.includes('supervisor-') ? 'Supervisor' : 'Student'}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-gray-400">{formatBytes(doc.file_size)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
