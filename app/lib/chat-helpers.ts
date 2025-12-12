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

        console.log('Calling upsert_conversation with:', { toolId, userId: user.id });

        // Call the RPC function
        const { data, error } = await supabase.rpc('upsert_conversation', {
            p_listing_id: toolId,
            p_renter_id: user.id
        });

        console.log('RPC response:', { data, error });

        if (error) {
            console.log('Raw error object:', error);
            console.log('Error type:', typeof error);
            console.log('Error keys:', Object.keys(error));
            console.log('Error.message:', error.message);
            console.log('Error.details:', error.details);
            console.log('Error.code:', error.code);
            throw error;
        }

        console.log('RPC success, chat_id:', data);
        return data;
    } catch (error: any) {
        console.error('Error upserting conversation:', {
            message: error?.message,
            details: error?.details,
            code: error?.code,
            fullError: JSON.stringify(error),
            stack: error?.stack
        });
        throw error;
    }
}


