"use client";

import * as React from "react";
import { UserCheck, X, Check, Loader2 } from "lucide-react";
import { respondToSupervisorRequest } from "@/server/supervisor.server";

interface SupervisorRequestBannerProps {
    supervisorName: string;
}

export function SupervisorRequestBanner({ supervisorName }: SupervisorRequestBannerProps) {
    const [isLoading, setIsLoading] = React.useState<string | null>(null);
    const [resolved, setResolved] = React.useState(false);

    const handleResponse = async (status: 'ACCEPTED' | 'REJECTED') => {
        setIsLoading(status);
        const res = await respondToSupervisorRequest(status);
        if (!res.error) {
            setResolved(true);
            window.location.reload(); // Refresh to update dashboard state
        }
        setIsLoading(null);
    };

    if (resolved) return null;

    return (
        <div className="mb-8 p-6 rounded-[2rem] bg-[#030213] text-white shadow-2xl shadow-blue-900/10 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <UserCheck className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-lg font-black tracking-tight">Supervisor Request</h3>
                    <p className="text-blue-100/60 text-sm font-medium">
                        <span className="text-white font-bold">{supervisorName}</span> want to supervise your thesis.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                    onClick={() => handleResponse('REJECTED')}
                    disabled={!!isLoading}
                    className="flex-1 md:flex-none px-6 py-3.5 rounded-xl border border-white/10 text-white text-xs font-black hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                    {isLoading === 'REJECTED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    DECLINE
                </button>
                <button
                    onClick={() => handleResponse('ACCEPTED')}
                    disabled={!!isLoading}
                    className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-blue-500 text-white text-xs font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                    {isLoading === 'ACCEPTED' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    ACCEPT REQUEST
                </button>
            </div>
        </div>
    );
}
