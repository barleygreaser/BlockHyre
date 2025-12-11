"use client";

import { supabase } from "@/lib/supabase";

/**
 * Find or create a conversation between a renter and tool owner
 * Uses the upsert_conversation RPC function to ensure proper linking
 * @param toolId - The listing/tool ID
 * @returns The chat ID or null if failed
 */
export async function upsertConversation(toolId: string): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Not authenticated");
        }

        // Call the RPC function
        const { data, error } = await supabase.rpc('upsert_conversation', {
            p_tool_id: toolId,
            p_renter_id: user.id
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error upserting conversation:', error);
        return null;
    }
}

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use upsertConversation instead
 */
export async function getOrCreateChat(
    listingId: string,
    otherUserId: string
): Promise<string | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Ensure user_one_id < user_two_id for consistency
        const [userOneId, userTwoId] = [user.id, otherUserId].sort();

        // Check if chat already exists
        const { data: existingChat } = await supabase
            .from('chats')
            .select('id')
            .eq('listing_id', listingId)
            .eq('user_one_id', userOneId)
            .eq('user_two_id', userTwoId)
            .single();

        if (existingChat) {
            return existingChat.id;
        }

        // Create new chat
        const { data: newChat, error } = await supabase
            .from('chats')
            .insert({
                listing_id: listingId,
                user_one_id: userOneId,
                user_two_id: userTwoId,
            })
            .select('id')
            .single();

        if (error) throw error;
        return newChat.id;
    } catch (error) {
        console.error('Error getting or creating chat:', error);
        return null;
    }
}
