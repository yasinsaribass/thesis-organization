"use client";

import { X, UserCog } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ProfileForm } from "./ProfileForm";

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        name: string;
        surname: string;
        phone_number: string;
        student_number: string;
        department: string;
        email: string;
    };
}

export function ProfileSettingsModal({ isOpen, onClose, initialData }: ProfileSettingsModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="px-6 py-4 bg-indigo-600 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                            <UserCog className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">Profile Settings</h2>
                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-70">
                                Manage your researcher identity
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10 active:scale-95"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Close</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-2 bg-stone-50">
                    <ProfileForm initialData={initialData} />
                </div>
            </div>
        </div>,
        document.body
    );
}
