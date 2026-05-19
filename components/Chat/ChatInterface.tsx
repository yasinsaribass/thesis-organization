"use client";

import * as React from "react";
import { Send, UserCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { sendMessage } from "@/server/messages.server";
import { useRouter } from "next/navigation";

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
    sender?: { name: string; surname: string; avatar_url: string | null };
}

interface ChatInterfaceProps {
    currentUserId: string;
    otherUserId: string;
    otherUserName: string;
    initialMessages: Message[];
}

import { useLanguage } from "@/context/LanguageContext";

export function ChatInterface({ currentUserId, otherUserId, otherUserName, initialMessages }: ChatInterfaceProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [messages, setMessages] = React.useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = React.useState("");
    const [isSending, setIsSending] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const content = newMessage.trim();
        setNewMessage(""); // Clear input immediately for better UX
        setIsSending(true);

        // Optimistic update
        const tempId = crypto.randomUUID();
        const optimisticMessage: Message = {
            id: tempId,
            content,
            created_at: new Date().toISOString(),
            sender_id: currentUserId,
            is_read: false,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Send to server
        const res = await sendMessage(otherUserId, content);

        setIsSending(false);

        if (res.error) {
            // Revert on error
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            alert(t.modals.chat.errorSend + res.error);
        } else if (res.data) {
            // Replace optimistic message with actual data from server
            setMessages((prev) => prev.map((m) => m.id === tempId ? res.data : m));
            router.refresh(); // Refresh server state occasionally
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-50/80 border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <UserCircle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">{otherUserName}</h3>
                    <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {t.modals.chat.activeConversation}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <UserCircle className="w-12 h-12 mb-3 opacity-20" />
                        <p>{t.modals.chat.noMessages}</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMe = message.sender_id === currentUserId;
                        return (
                            <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-sm"
                                        : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                                    <p className={`text-[10px] mt-1.5 font-medium flex items-center justify-end gap-1 ${isMe ? "text-indigo-200" : "text-slate-400"
                                        }`}>
                                        {format(new Date(message.created_at), "HH:mm")}
                                        {isMe && (
                                            <span className="ml-1">
                                                {message.is_read ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t.modals.chat.placeholder}
                        className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-200"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
