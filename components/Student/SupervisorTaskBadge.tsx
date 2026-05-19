export function SupervisorTaskBadge({ count }: { count: number }) {
    if (count === 0) return null;
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            🔔 {count} Supervisor {count === 1 ? "Suggestion" : "Suggestions"}
        </span>
    );
}
