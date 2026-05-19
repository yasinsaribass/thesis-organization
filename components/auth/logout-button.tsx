"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/server/auth.server";
import { useState } from "react";

interface LogoutButtonProps {
    className?: string;
    variant?: "default" | "ghost" | "outline" | "hero";
    showLabel?: boolean;
}

import { useLanguage } from "@/context/LanguageContext";

export function LogoutButton({
    className = "",
    variant = "ghost",
    showLabel = true
}: LogoutButtonProps) {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await logout();
        } catch (error) {
            console.error("Failed to logout:", error);
            setIsLoading(false);
        }
    };

    const variantStyles = {
        ghost: "hover:bg-gray-100 text-gray-600",
        outline: "border border-gray-200 hover:bg-gray-50 text-gray-700",
        default: "bg-red-50 text-red-600 hover:bg-red-100",
        hero: "border border-white/50 text-white hover:bg-white/20 backdrop-blur-sm"
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]} ${className}`}
            title={t.nav.logout}
        >
            <LogOut className={`w-4 h-4 ${isLoading ? "animate-pulse" : ""}`} />
            {showLabel && <span>{isLoading ? t.nav.loggingOut : t.nav.logout}</span>}
        </button>
    );
}
