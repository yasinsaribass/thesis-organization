"use client";

import { useState } from "react";
import { createThesis } from "@/server/thesis.server";
import { Loader2, Plus } from "lucide-react";
import { CinematicSuccess } from "./CinematicSuccess";


import { useLanguage } from "@/context/LanguageContext";


interface RegisterThesisFormProps {
    onboardingMode?: boolean;
    onSuccess?: () => void;
}


export function RegisterThesisForm({ onboardingMode, onSuccess }: RegisterThesisFormProps) {
    const { t } = useLanguage();
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log("Submitting thesis title:", trimmedTitle);
            const result = await createThesis(trimmedTitle);
            console.log("Response from createThesis:", result);

            if (result && "error" in result && result.error) {
                setError(result.error);
                setIsLoading(false);
            } else if (result && (result as any).success) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.href = "/dashboard/student";
                }
            } else {


                throw new Error("Unexpected response from server");
            }
        } catch (err: any) {
            console.error("Form submission error:", err);
            setError(err.message || "Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-white rounded-[2.5rem] border transition-all duration-500 ${
            onboardingMode 
            ? "p-10 shadow-2xl shadow-indigo-200/50 border-indigo-50" 
            : "p-8 border-blue-100 shadow-sm"
        }`}>
            {!onboardingMode && (
                <>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{t.student.forms.registerThesis.title}</h3>
                    <p className="text-gray-400 text-sm mb-6">{t.student.forms.registerThesis.subtitle}</p>
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t.student.forms.registerThesis.placeholder}
                        className={`w-full px-6 py-4 rounded-2xl border transition-all outline-none text-lg font-bold tracking-tight ${
                            onboardingMode
                            ? "bg-indigo-50/30 border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                            : "bg-gray-50/50 border-gray-100 focus:ring-2 focus:ring-blue-500"
                        }`}
                        required
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl animate-shake">
                        <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !title.trim()}
                    className={`w-full py-5 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                        onboardingMode
                        ? "bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200"
                        : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                    } disabled:opacity-50 disabled:grayscale`}
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                    {t.student.forms.registerThesis.submit}
                </button>
            </form>
        </div>


    );
}
