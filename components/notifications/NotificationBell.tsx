"use client";

import * as React from "react";
import { Bell, MessageCircle, ClipboardList, CheckCircle2, X, MessageSquareQuote } from "lucide-react";
import { markAllNotificationsRead } from "@/server/notifications.server";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationBellProps {
    initialNotifications: Notification[];
}

import { useLanguage } from "@/context/LanguageContext";

function NotifIcon({ type }: { type: string }) {
    if (type === "message")
        return <MessageCircle className="w-5 h-5 text-sky-500" />;
    if (type === "task_suggestion" || type === "subtask_suggestion")
        return <ClipboardList className="w-5 h-5 text-indigo-500" />;
    if (type === "feedback")
        return <MessageSquareQuote className="w-5 h-5 text-emerald-500" />;
    return <Bell className="w-5 h-5 text-gray-400" />;
}

export function NotificationBell({ initialNotifications }: NotificationBellProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<Notification[]>(initialNotifications);
    const [marking, setMarking] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return t.notifs.justNow;
        if (diff < 3600) return `${Math.floor(diff / 60)}${t.notifs.minutesAgo}`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}${t.notifs.hoursAgo}`;
        return `${Math.floor(diff / 86400)}${t.notifs.daysAgo}`;
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // Close on outside click
    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function handleMarkAll() {
        setMarking(true);
        await markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setMarking(false);
        router.refresh();
    }

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm text-white"
                aria-label={t.notifs.title}
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-gray-700" />
                            <h3 className="text-sm font-black text-gray-900">{t.notifs.title}</h3>
                            {unreadCount > 0 && (
                                <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {unreadCount} {t.notifs.new}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    disabled={marking}
                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest disabled:opacity-50"
                                >
                                    {marking ? "..." : t.notifs.markAllRead}
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm font-bold text-gray-400">{t.notifs.allCaughtUp}</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <Link
                                    key={n.id}
                                    href={n.link ?? "/dashboard/student"}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-indigo-50/40" : ""}`}
                                >
                                    <div className={`mt-0.5 w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${!n.is_read ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                                        <NotifIcon type={n.type} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!n.is_read ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                                            {n.title}
                                        </p>
                                        {n.body && (
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                                        )}
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
                                            {timeAgo(n.created_at)}
                                        </p>
                                    </div>
                                    {!n.is_read && (
                                        <span className="mt-2 flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
