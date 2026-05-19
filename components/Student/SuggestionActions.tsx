"use client";

import { respondToTaskSuggestion } from "@/server/tasks.server";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuggestionActionsProps {
    taskId: string;
}

export function SuggestionActions({ taskId }: SuggestionActionsProps) {
    const [isLoading, setIsLoading] = useState<'ACCEPTED' | 'REJECTED' | null>(null);
    const router = useRouter();

    const handleResponse = async (status: 'ACCEPTED' | 'REJECTED') => {
        setIsLoading(status);
        const res = await respondToTaskSuggestion(taskId, status);
        setIsLoading(null);

        if (res.success) {
            router.refresh();
        } else if (res.error) {
            alert(res.error);
        }
    };

    return (
        <div className="flex items-center gap-3 w-full">
            <button
                onClick={() => handleResponse('ACCEPTED')}
                disabled={!!isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
                {isLoading === 'ACCEPTED' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Check className="w-4 h-4" />
                )}
                ACCEPT & START
            </button>
            <button
                onClick={() => handleResponse('REJECTED')}
                disabled={!!isLoading}
                className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-50"
            >
                {isLoading === 'REJECTED' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <X className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
