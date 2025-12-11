"use client";

import { supabase } from "@/lib/supabase";

/**
 * Get or create a chat between two users for a specific listing
 * @param listingId - The listing ID
 * @param otherUserId - The other user's ID (owner or renter)
 * @returns The chat ID
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
