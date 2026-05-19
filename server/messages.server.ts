"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { insertNotification } from "@/lib/notifications";

export async function getConversation(otherUserId: string) {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
        .from("messages")
        .select(`
            *,
            sender:sender_id(name, surname, avatar_url),
            receiver:receiver_id(name, surname, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return { error: error.message };
    }

    // Mark unread messages from the other user as read implicitly when fetching
    const unreadIds = data
        .filter(m => m.receiver_id === user.id && !m.is_read)
        .map(m => m.id);

    if (unreadIds.length > 0) {
        supabase
            .from("messages")
            .update({ is_read: true })
            .in("id", unreadIds)
            .then(() => {
                revalidatePath("/dashboard", "layout");
            });
    }

    return { messages: data, currentUserId: user.id };
}

export async function sendMessage(receiverId: string, content: string) {
    if (!content.trim()) return { error: "Message cannot be empty" };

    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data, error } = await supabase
        .from("messages")
        .insert({
            sender_id: user.id,
            receiver_id: receiverId,
            content: content.trim()
        })
        .select(`
            *,
            sender:sender_id(name, surname, avatar_url),
            receiver:receiver_id(name, surname, avatar_url)
        `)
        .single();

    if (error) {
        console.error("Error sending message:", error);
        return { error: error.message };
    }

    // Sender name and receiver role for the notification
    const { data: senderProfile } = await supabase
        .from("user_profiles")
        .select("name, surname, role")
        .eq("id", user.id)
        .single();
        
    const { data: receiverProfile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", receiverId)
        .single();

    const senderName = senderProfile?.name || senderProfile?.surname
        ? `${senderProfile.name || ""} ${senderProfile.surname || ""}`.trim()
        : senderProfile?.role === "SUPERVISOR" ? "Your supervisor" : "Your student";

    const link = receiverProfile?.role === "SUPERVISOR" 
        ? `/dashboard/supervisor/messages/${user.id}`
        : `/dashboard/student/messages`;

    // Notify the receiver
    await insertNotification(
        supabase,
        receiverId,
        "message",
        `New message from ${senderName}`,
        content.trim().substring(0, 80),
        link
    );

    revalidatePath("/dashboard/student/messages");
    revalidatePath(`/dashboard/supervisor/messages/${user.id}`);
    revalidatePath(`/dashboard/supervisor/messages/${receiverId}`);

    return { data };
}
