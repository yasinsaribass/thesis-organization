"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { XP_RULES, LEVELS, BADGES, getLevelFromXP } from "@/lib/gamification";


/** Get student gamification data (XP, level, streak, badges) */
export async function getStudentGamification() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!student) return { error: "Student not found" };

    // Get or create gamification record
    let { data: gamification } = await supabase
        .from("student_gamification")
        .select("*")
        .eq("student_id", student.id)
        .single();

    if (!gamification) {
        // Create initial record for new student
        const { data: newRecord } = await supabase
            .from("student_gamification")
            .insert({ student_id: student.id })
            .select()
            .single();
        gamification = newRecord;
    }

    // Get badges
    const { data: badges } = await supabase
        .from("student_badges")
        .select("badge_key, earned_at")
        .eq("student_id", student.id)
        .order("earned_at", { ascending: false });

    const levelInfo = getLevelFromXP(gamification?.xp ?? 0);

    return {
        xp: gamification?.xp ?? 0,
        level: levelInfo,
        streak: gamification?.streak_days ?? 0,
        badges: badges ?? [],
    };
}

/** Get leaderboard: rank students under same supervisor by XP */
export async function getLeaderboard() {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: currentStudent } = await supabase
        .from("students")
        .select("id, supervisor_id")
        .eq("user_id", user.id)
        .single();

    if (!currentStudent?.supervisor_id) return { leaderboard: [] };

    // Get all students under same supervisor
    const { data: peers } = await supabase
        .from("students")
        .select("id")
        .eq("supervisor_id", currentStudent.supervisor_id);

    if (!peers || peers.length === 0) return { leaderboard: [] };

    const peerIds = peers.map(p => p.id);

    // Get their gamification data
    const { data: gamData } = await supabase
        .from("student_gamification")
        .select("student_id, xp, level, streak_days")
        .in("student_id", peerIds)
        .order("xp", { ascending: false });

    // Get user profile info for display names
    const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .in("id", peers.map(p => p.id));  // Need to join through students

    // Get students with user_ids
    const { data: studentsWithUsers } = await supabase
        .from("students")
        .select("id, user_id, student_number")
        .in("id", peerIds);

    const userIds = studentsWithUsers?.map(s => s.user_id) ?? [];
    const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

    const leaderboard = (gamData ?? []).map((g, idx) => {
        const studentRecord = studentsWithUsers?.find(s => s.id === g.student_id);
        const profile = userProfiles?.find(p => p.user_id === studentRecord?.user_id);
        const levelInfo = getLevelFromXP(g.xp);
        return {
            rank: idx + 1,
            studentId: g.student_id,
            name: profile?.full_name ?? "Student",
            xp: g.xp,
            level: levelInfo,
            streak: g.streak_days,
            isCurrentUser: g.student_id === currentStudent.id,
        };
    });

    return { leaderboard };
}


/** Award XP to a student and check for level-up and badges */
export async function awardXP(studentId: string, amount: number) {
    const supabase = await createSupabaseServerClient();

    // Get or create current record
    let { data: current } = await supabase
        .from("student_gamification")
        .select("*")
        .eq("student_id", studentId)
        .single();

    if (!current) {
        const { data: newRecord } = await supabase
            .from("student_gamification")
            .insert({ student_id: studentId, xp: amount })
            .select()
            .single();
        current = newRecord;
    } else {
        const newXP = (current.xp ?? 0) + amount;
        const newLevel = getLevelFromXP(newXP).level;
        await supabase
            .from("student_gamification")
            .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
            .eq("student_id", studentId);
        current = { ...current, xp: newXP, level: newLevel };
    }

    // Check and award level badges
    const newXP = current?.xp ?? 0;
    if (newXP >= 300) await grantBadgeIfNew(studentId, "level_scholar");
    if (newXP >= 1000) await grantBadgeIfNew(studentId, "level_expert");

    return { newXP };
}

/** Update daily streak for a student */
export async function updateStreak(studentId: string) {
    const supabase = await createSupabaseServerClient();

    const today = new Date().toISOString().split("T")[0];

    const { data: current } = await supabase
        .from("student_gamification")
        .select("*")
        .eq("student_id", studentId)
        .single();

    if (!current) {
        await supabase.from("student_gamification").insert({
            student_id: studentId,
            streak_days: 1,
            last_activity_date: today,
        });
        return;
    }

    const lastActive = current.last_activity_date;
    if (lastActive === today) return; // Already counted today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newStreak = lastActive === yesterday ? (current.streak_days ?? 0) + 1 : 1;

    await supabase
        .from("student_gamification")
        .update({
            streak_days: newStreak,
            last_activity_date: today,
            updated_at: new Date().toISOString(),
        })
        .eq("student_id", studentId);

    // Award daily XP
    await awardXP(studentId, XP_RULES.DAILY_LOGIN);

    // Check streak badges
    if (newStreak >= 5) {
        await grantBadgeIfNew(studentId, "on_fire");
        await awardXP(studentId, XP_RULES.STREAK_BONUS_5_DAYS);
    }
}

/** Award badge to student (idempotent — won't duplicate) */
async function grantBadgeIfNew(studentId: string, badgeKey: string) {
    const supabase = await createSupabaseServerClient();
    // Use upsert with unique constraint to prevent duplicates
    await supabase.from("student_badges").upsert(
        { student_id: studentId, badge_key: badgeKey },
        { onConflict: "student_id,badge_key", ignoreDuplicates: true }
    );
}

/** Called when a subtask is marked DONE — awards XP and checks badges */
export async function onTaskCompleted(studentId: string, thesisId: string) {
    const supabase = await createSupabaseServerClient();

    // Award XP for completing a subtask
    const { newXP } = await awardXP(studentId, XP_RULES.COMPLETE_SUBTASK);

    // Get all task counts to check badges
    const { count: totalCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", thesisId)
        .or("suggestion_status.is.null,suggestion_status.eq.ACCEPTED");

    const { count: doneCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", thesisId)
        .eq("status", "DONE");

    // First task badge
    if ((doneCount ?? 0) >= 1) await grantBadgeIfNew(studentId, "first_task");

    // Halfway badge
    if (totalCount && doneCount && doneCount / totalCount >= 0.5) {
        await grantBadgeIfNew(studentId, "halfway");
    }

    // Thesis champion badge (100%)
    if (totalCount && doneCount && doneCount >= totalCount) {
        await grantBadgeIfNew(studentId, "thesis_champion");
        await awardXP(studentId, XP_RULES.COMPLETE_MAIN_TASK);
    }

    // Week warrior: check if 10 tasks done this week
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { count: weekCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("thesis_id", thesisId)
        .eq("status", "DONE")
        .gte("completed_at", oneWeekAgo);

    if ((weekCount ?? 0) >= 10) await grantBadgeIfNew(studentId, "week_warrior");

    return { newXP };
}
