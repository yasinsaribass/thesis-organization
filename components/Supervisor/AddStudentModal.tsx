"use client";

import * as React from "react";
import { X, Search, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { searchStudents, assignStudent } from "@/server/supervisor.server";
import { useRouter } from "next/navigation";

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { useLanguage } from "@/context/LanguageContext";

export function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
    const { t } = useLanguage();
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isAssigning, setIsAssigning] = React.useState<string | null>(null);
    const [successId, setSuccessId] = React.useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        const { students, error } = await searchStudents(query);
        if (!error && students) {
            setResults(students);
        }
        setIsSearching(false);
    };

    const handleAssign = async (studentId: string) => {
        setIsAssigning(studentId);
        const res = await assignStudent(studentId);
        if (res.success) {
            setSuccessId(studentId);
            setTimeout(() => {
                setResults(results.filter(r => r.id !== studentId));
                setSuccessId(null);
            }, 2000);
        }
        setIsAssigning(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#030213]/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t.supervisor.addStudentModal.title}</h2>
                            <p className="text-gray-400 text-sm font-medium">{t.supervisor.addStudentModal.subtitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.supervisor.addStudentModal.searchPlaceholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-11 pr-32 py-4 bg-[#f5f5f7] border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-2xl text-sm font-semibold transition-all outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-[#030213] text-white rounded-[1.1rem] text-xs font-black hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : t.supervisor.addStudentModal.searchButton}
                        </button>
                    </form>

                    {/* Results Area */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {results.length > 0 ? (
                            results.map((student) => (
                                <div
                                    key={student.id}
                                    className="p-5 rounded-3xl bg-[#f5f5f7]/50 border border-gray-50 flex items-center justify-between group hover:bg-[#f5f5f7] transition-all"
                                >
                                    <div>
                                        <p className="text-sm font-black text-gray-900">
                                            {student.user_profiles?.name} {student.user_profiles?.surname}
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                            ID: {student.student_number}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(student.id)}
                                        disabled={!!isAssigning || successId === student.id}
                                        className={`p-3 rounded-xl transition-all ${successId === student.id
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-white text-gray-400 hover:text-blue-600 hover:shadow-sm"
                                            }`}
                                    >
                                        {isAssigning === student.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : successId === student.id ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <UserPlus className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : query && !isSearching ? (
                            <div className="py-12 text-center">
                                <p className="text-gray-400 font-medium">{t.supervisor.addStudentModal.noResults}</p>
                            </div>
                        ) : !query ? (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-gray-300 text-sm font-semibold">{t.supervisor.addStudentModal.startPrompt}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
