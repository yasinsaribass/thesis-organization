"use client";

import React from "react";
import { FileText, Download, ChevronLeft, Search, Calendar, User, UploadCloud, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { downloadDocument, uploadSupervisorDocument } from "@/server/documents.server";

interface Document {
    id: string;
    file_name: string;
    file_size: number;
    created_at: string;
    file_path?: string;
    document_type?: string;
    tasks?: {
        title: string;
    } | null;
}

interface SupervisorDocumentsClientProps {
    documents: Document[];
    studentName: string;
    thesisTitle: string;
    studentId: string;
    thesisId: string;
}

const CATEGORIES = [
    { id: '25%', label: 'Thesis %25', description: 'Early draft and proposal' },
    { id: '50%', label: 'Thesis %50', description: 'Mid-term progress report' },
    { id: '75%', label: 'Thesis %75', description: 'Final draft for review' },
    { id: '100%', label: 'Thesis %100', description: 'Complete final version' },
    { id: 'OTHER', label: 'Other Documents', description: 'Appendices, data, and resources' }
];

export function SupervisorDocumentsClient({ documents: initialDocuments, studentName, thesisTitle, studentId, thesisId }: SupervisorDocumentsClientProps) {
    const [localDocs, setLocalDocs] = React.useState<Document[]>(initialDocuments);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [uploadingCategory, setUploadingCategory] = React.useState<string | null>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setLocalDocs(initialDocuments);
    }, [initialDocuments]);

    const filteredDocuments = localDocs.filter(doc => 
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tasks?.title.toLowerCase().includes(searchTerm.toLowerCase())
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
        formData.append("documentType", category);

        try {
            const result = await uploadSupervisorDocument(thesisId, formData);
            if (result.error) {
                setUploadError(result.error);
            } else if (result.document) {
                setLocalDocs(prev => [result.document as Document, ...prev]);
            }
        } catch (error: any) {
            setUploadError(error.message || "An unexpected error occurred during upload.");
        } finally {
            setUploadingCategory(null);
            // Clear input value
            const input = document.getElementById(`file-${category}`) as HTMLInputElement;
            if (input) input.value = '';
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

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] pb-20">
            {/* Top Navigation */}
            <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href={`/dashboard/supervisor/students/${studentId}`}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#030213] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Student Detail
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8">
                {/* Header Section */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileText className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{studentName}</span>
                            </div>
                            <h1 className="text-3xl font-black text-[#030213] mb-2">Student Documents</h1>
                            <p className="text-gray-400 font-medium text-lg leading-relaxed">
                                {thesisTitle}
                            </p>
                        </div>
                    </div>
                </div>

                {uploadError && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-4 mb-8">
                        <AlertCircle className="w-5 h-5" />
                        {uploadError}
                        <button onClick={() => setUploadError(null)} className="ml-auto hover:bg-rose-100 p-1 rounded-lg transition-colors">
                            <span className="sr-only">Dismiss</span>
                            <User className="w-4 h-4 opacity-0" /> {/* Spacer or custom icon can go here, maybe X, but we don't have X imported so just omit or rely on text */}
                            ✕
                        </button>
                    </div>
                )}

                {/* Categorized Sections */}
                <div className="space-y-10">
                    {CATEGORIES.map((cat) => {
                        const catDocs = filteredDocuments.filter(d => d.document_type === cat.id);
                        
                        // If searching and no results in this category, don't show it
                        if (searchTerm && catDocs.length === 0) return null;

                        return (
                            <div key={cat.id} className="space-y-6">
                                <div className="flex items-center justify-between gap-4 px-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            catDocs.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'
                                        }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-[#030213] tracking-tight">{cat.label}</h3>
                                            <p className="text-xs font-medium text-gray-400">{cat.description}</p>
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
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all ${
                                                uploadingCategory === cat.id 
                                                ? 'bg-gray-100 text-gray-400 pointer-events-none' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            {uploadingCategory === cat.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UploadCloud className="w-4 h-4" />
                                            )}
                                            {uploadingCategory === cat.id ? "Uploading..." : "Upload File"}
                                        </label>
                                    </div>
                                </div>

                                {catDocs.length === 0 ? (
                                    <div className="bg-white/40 rounded-[2rem] border-2 border-dashed border-gray-100 p-10 text-center">
                                        <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No documents shared in this section</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {catDocs.map((doc) => (
                                            <div key={doc.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-indigo-100 hover:shadow-xl transition-all group flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="p-2.5 bg-gray-50 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                        title="Download File"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="flex-1 min-w-0 mb-6">
                                                    <h3 className="text-base font-black text-[#030213] mb-1 truncate" title={doc.file_name}>
                                                        {doc.file_name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                                            doc.file_path?.includes('supervisor-') 
                                                                ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                                                : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                        }`}>
                                                            Uploaded by {doc.file_path?.includes('supervisor-') ? 'Supervisor' : 'Student'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-gray-400">{formatBytes(doc.file_size)}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(doc.created_at).toLocaleDateString('en-GB')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {doc.tasks && (
                                                    <div className="pt-4 border-t border-gray-50 mt-auto">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Related Task</p>
                                                        <p className="text-xs font-bold text-indigo-600 truncate">{doc.tasks.title}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {searchTerm && filteredDocuments.length === 0 && (
                        <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No documents found</h3>
                            <p className="text-gray-400 font-medium">No documents match your search criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
