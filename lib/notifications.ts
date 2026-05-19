/**
 * Internal helper — insert a notification for a given user.
 * This is NOT a server action file. Import this from server actions directly.
 */
export async function insertNotification(
    supabase: any,
    userId: string,
    type: string,
    title: string,
    body: string,
    link: string
) {
    const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type,
        title,
        message: body,  // existing column name in the DB
        body,           // newly added column
        link,
    });
    if (error) {
        console.error(`[Notification] Failed for user ${userId}:`, error.message, error.details);
    }
}
