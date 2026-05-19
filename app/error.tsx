"use client";

import { useEffect } from "react";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-[#030213] text-white rounded-md hover:bg-[#030213]/90"
            >
                Try again
            </button>
        </div>
    );
}