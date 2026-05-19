// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────

// XP earned per action
export const XP_RULES = {
    COMPLETE_SUBTASK: 10,
    COMPLETE_MAIN_TASK: 50,
    DAILY_LOGIN: 5,
    RECEIVE_FEEDBACK: 15,
    STREAK_BONUS_5_DAYS: 25,
};

// Level thresholds and names
export const LEVELS = [
    { level: 1, name: "Novice Researcher", xpRequired: 0 },
    { level: 2, name: "Apprentice", xpRequired: 100 },
    { level: 3, name: "Scholar", xpRequired: 300 },
    { level: 4, name: "Analyst", xpRequired: 600 },
    { level: 5, name: "Expert Researcher", xpRequired: 1000 },
];

// Badge definitions
export const BADGES = {
    first_task: {
        key: "first_task",
        name: "First Step",
        description: "Completed your first task!",
        emoji: "🎯",
    },
    on_fire: {
        key: "on_fire",
        name: "On Fire",
        description: "Maintained a 5-day activity streak!",
        emoji: "🔥",
    },
    week_warrior: {
        key: "week_warrior",
        name: "Week Warrior",
        description: "Completed 10 tasks in a single week!",
        emoji: "⚔️",
    },
    halfway: {
        key: "halfway",
        name: "Halfway There",
        description: "Reached 50% thesis completion!",
        emoji: "🏅",
    },
    thesis_champion: {
        key: "thesis_champion",
        name: "Thesis Champion",
        description: "Completed 100% of thesis tasks!",
        emoji: "🏆",
    },
    level_scholar: {
        key: "level_scholar",
        name: "Scholar",
        description: "Reached Level 3 — Scholar!",
        emoji: "📚",
    },
    level_expert: {
        key: "level_expert",
        name: "Expert Researcher",
        description: "Reached Level 5 — Expert Researcher!",
        emoji: "🎓",
    },
};

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

export function getLevelFromXP(xp: number) {
    let currentLevel = LEVELS[0];
    for (const level of LEVELS) {
        if (xp >= level.xpRequired) {
            currentLevel = level;
        }
    }
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
    const progress = nextLevel
        ? Math.round(((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100)
        : 100;
    return { ...currentLevel, nextLevel, progress, xpToNext: nextLevel ? nextLevel.xpRequired - xp : 0 };
}
