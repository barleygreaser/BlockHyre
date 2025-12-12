"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Chat {
    id: string;
    listing_id: string;
    user_one_id: string;
    user_two_id: string;
    created_at: string;
    updated_at: string;
    listing_title?: string;
    other_user_name?: string;
    other_user_photo?: string;
    last_message_content?: string;
    last_message_time?: string;
    unread_count?: number;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender?: {
        id: string;
        full_name: string;
        profile_photo_url?: string;
    };
}

export function useMessages() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConversations = async (): Promise<Chat[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Fetch chats with related data
            const { data: chats, error: chatsError } = await supabase
                .from('chats')
                .select(`
                    *,
                    listing:tool_id(title),
                    owner:owner_id(id, full_name, profile_photo_url),
                    renter:renter_id(id, full_name, profile_photo_url)
                `)
                .or(`owner_id.eq.${user.id},renter_id.eq.${user.id}`)
                .order('updated_at', { ascending: false });

            if (chatsError) throw chatsError;

            // Fetch last message and unread count for each chat
            const enrichedChats = await Promise.all(
                (chats || []).map(async (chat) => {
                    // Get last message
                    const { data: lastMessage } = await supabase
                        .from('messages')
                        .select('content, created_at')
                        .eq('chat_id', chat.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Get unread count
                    const { count: unreadCount } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('chat_id', chat.id)
                        .eq('is_read', false)
                        .neq('sender_id', user.id);

                    // Determine the other user
                    const otherUser = chat.owner_id === user.id ? chat.renter : chat.owner;

                    return {
                        id: chat.id,
                        listing_id: chat.tool_id,
                        created_at: chat.created_at,
                        updated_at: chat.updated_at,
                        listing_title: chat.listing?.title,
                        other_user_name: otherUser?.full_name || 'Unknown User',
                        other_user_photo: otherUser?.profile_photo_url,
                        last_message_content: lastMessage?.content,
                        last_message_time: lastMessage?.created_at,
                        unread_count: unreadCount || 0,
                    };
                })
            );

            return enrichedChats;
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (chatId: string): Promise<Message[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: messagesError } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, full_name, profile_photo_url)
                `)
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true })
                .limit(100);

            if (messagesError) throw messagesError;
            return data || [];
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (chatId: string, content: string): Promise<Message | null> => {
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error: sendError } = await supabase
                .from('messages')
                .insert({
                    chat_id: chatId,
                    sender_id: user.id,
                    content: content.trim(),
                })
                .select(`
                    *,
                    sender:sender_id(id, full_name, profile_photo_url)
                `)
                .single();

            if (sendError) throw sendError;
            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const markMessagesAsRead = async (chatId: string) => {
        try {
            await supabase.rpc('mark_messages_read', { p_chat_id: chatId });
        } catch (err: any) {
            console.error('Error marking messages as read:', err);
        }
    };

    const subscribeToChat = (chatId: string, onMessage: (message: Message) => void): RealtimeChannel => {
        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                async (payload) => {
                    // Fetch sender details
                    const { data: sender } = await supabase
                        .from('users')
                        .select('id, full_name, profile_photo_url')
                        .eq('id', payload.new.sender_id)
                        .single();

                    onMessage({
                        ...payload.new as Message,
                        sender: sender || undefined,
                    });
                }
            )
            .subscribe();

        return channel;
    };

    return {
        loading,
        error,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markMessagesAsRead,
        subscribeToChat,
    };
}
