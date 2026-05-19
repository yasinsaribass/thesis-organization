"use client";

import { X, MessageCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ChatInterface } from "../Chat/ChatInterface";

interface MessagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    initialMessages: any[];
}

import { useLanguage } from "@/context/LanguageContext";

export function MessagesModal({ 
    isOpen, 
    onClose, 
    currentUserId, 
    otherUserId, 
    otherUserName, 
    initialMessages 
}: MessagesModalProps) {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[90vh] max-h-[800px]">
                
                {/* Header */}
                <div className="px-6 py-4 bg-[#030213] flex items-center justify-between border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">{t.modals.chat.title}</h2>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase opacity-70">
                                {otherUserName} • {t.modals.chat.active}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border border-white/10 active:scale-95"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{t.modals.chat.close}</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area - We remove the ChatInterface's own container styles to fit perfectly */}
                <div className="flex-1 overflow-hidden relative bg-slate-50">
                    <ChatInterface 
                        currentUserId={currentUserId}
                        otherUserId={otherUserId}
                        otherUserName={otherUserName}
                        initialMessages={initialMessages}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
