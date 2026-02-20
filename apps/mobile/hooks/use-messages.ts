import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Standardized Types based on Supabase schema
export interface Chat {
    id: string;
    listing_id: string;
    created_at: string;
    updated_at: string;
    listing_title?: string;
    other_user_name?: string;
    other_user_photo?: string;
    last_message_content?: string;
    last_message_time?: string;
    unread_count?: number;
    owner_id: string;
    renter_id: string;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    message_type?: 'text' | 'system';
    recipient_id?: string;
    sender?: {
        id: string;
        full_name: string;
        profile_photo_url?: string;
    };
}

export function useMessages() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get current user ID
    const getCurrentUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id;
    };

    const fetchConversations = useCallback(async (): Promise<Chat[]> => {
        setLoading(true);
        setError(null);
        try {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            const { data: chats, error: chatsError } = await supabase
                .from('chats')
                .select(`
                    *,
                    listing:listing_id(title),
                    owner:owner_id(id, full_name, profile_photo_url),
                    renter:renter_id(id, full_name, profile_photo_url)
                `)
                .or(`owner_id.eq.${userId},renter_id.eq.${userId}`)
                .order('updated_at', { ascending: false });

            if (chatsError) {
                console.error('Chats error details:', chatsError);
                throw chatsError;
            }

            // Batch fetch unread counts to avoid N+1 queries
            const chatIds = (chats || []).map(c => c.id);
            const unreadCountsMap = new Map<string, number>();

            if (chatIds.length > 0) {
                const { data: unreadMessages } = await supabase
                    .from('messages')
                    .select('chat_id')
                    .in('chat_id', chatIds)
                    .eq('is_read', false)
                    .neq('sender_id', userId);

                if (unreadMessages) {
                    unreadMessages.forEach(msg => {
                        unreadCountsMap.set(msg.chat_id, (unreadCountsMap.get(msg.chat_id) || 0) + 1);
                    });
                }
            }

            // Fetch last message for each chat
            const enrichedChats = await Promise.all(
                (chats || []).map(async (chat) => {
                    const { data: lastMessage } = await supabase
                        .from('messages')
                        .select('content, created_at')
                        .eq('chat_id', chat.id)
                        .or(`recipient_id.is.null,recipient_id.eq.${userId}`)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    const unreadCount = unreadCountsMap.get(chat.id) || 0;

                    // The other user is the one who is NOT the current user
                    let otherUser = chat.owner;
                    if (chat.owner_id === userId) {
                        otherUser = chat.renter;
                    }

                    return {
                        id: chat.id,
                        listing_id: chat.listing_id,
                        created_at: chat.created_at,
                        updated_at: chat.updated_at,
                        owner_id: chat.owner_id,
                        renter_id: chat.renter_id,
                        // handle cases where listing might be deleted but chat remains
                        listing_title: chat.listing ? chat.listing.title : 'Listing unavailable',
                        other_user_name: otherUser ? otherUser.full_name : 'Unknown User',
                        other_user_photo: otherUser ? otherUser.profile_photo_url : undefined,
                        last_message_content: lastMessage ? lastMessage.content : undefined,
                        last_message_time: lastMessage ? lastMessage.created_at : undefined,
                        unread_count: unreadCount,
                    };
                })
            );

            // Sort by latest message, falling back to chat updated_at
            enrichedChats.sort((a, b) => {
                const timeA = new Date(a.last_message_time || a.updated_at).getTime();
                const timeB = new Date(b.last_message_time || b.updated_at).getTime();
                return timeB - timeA;
            });

            return enrichedChats;
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMessages = useCallback(async (chatId: string): Promise<Message[]> => {
        setLoading(true);
        setError(null);
        try {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            const { data, error: messagesError } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id(id, full_name, profile_photo_url)
                `)
                .eq('chat_id', chatId)
                .or(`recipient_id.is.null,recipient_id.eq.${userId}`)
                .order('created_at', { ascending: true }); // GiftedChat often wants descending, we'll map later if needed, but ASC is fine for logic

            if (messagesError) throw messagesError;
            return data as Message[] || [];
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (chatId: string, content: string): Promise<Message | null> => {
        setLoading(true);
        setError(null);
        try {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            const { data, error: sendError } = await supabase
                .from('messages')
                .insert({
                    chat_id: chatId,
                    sender_id: userId,
                    content: content.trim(),
                    message_type: 'text' // explicit type
                })
                .select()
                .single();

            if (sendError) throw sendError;
            return data as Message;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, []);

    const markMessagesAsRead = useCallback(async (chatId: string) => {
        try {
            const userId = await getCurrentUserId();
            if (!userId) return;

            // Call the RPC defined in migrations
            await supabase.rpc('mark_messages_read', { p_chat_id: chatId });
        } catch (err: any) {
            console.error('Error marking messages as read:', err);
        }
    }, []);

    const subscribeToChat = useCallback((chatId: string, onMessage: (message: Message) => void) => {
        let channel = supabase.channel(`chat:${chatId}`);

        // We get userId async inside the setup to filter recipient_id
        getCurrentUserId().then(userId => {
            if (!userId) return;

            channel = channel.on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                async (payload) => {
                    const newMessage = payload.new as Message;

                    // Filter out messages not meant for us
                    if (newMessage.recipient_id && newMessage.recipient_id !== userId) {
                        return;
                    }

                    // Fetch sender details since postgres_changes doesn't do joins
                    const { data: sender } = await supabase
                        .from('users')
                        .select('id, full_name, profile_photo_url')
                        .eq('id', newMessage.sender_id)
                        .single();

                    onMessage({
                        ...newMessage,
                        sender: sender || undefined,
                    });
                }
            ).subscribe();
        });

        // Return a cleanup function
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Create a new chat or find existing (Contextual logic)
    const upsertConversation = useCallback(async (listingId: string, ownerId: string): Promise<string | null> => {
        setLoading(true);
        setError(null);
        try {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            // Avoid chatting with oneself
            if (userId === ownerId) {
                throw new Error("You cannot start a chat with yourself.");
            }

            // Call the advanced upsert_conversation RPC.
            // Signature: public.upsert_conversation(owner_id_in uuid, renter_id_in uuid, listing_id_in uuid DEFAULT NULL)

            // Important: We must determine who is the true owner list the listing, vs the renter.
            // Usually the person clicking "Message" is the renter. 
            const { data: chatId, error } = await supabase.rpc('upsert_conversation', {
                owner_id_in: ownerId,
                renter_id_in: userId,
                listing_id_in: listingId
            });

            if (error) throw error;

            return chatId;
        } catch (err: any) {
            console.error("Error upserting conversation:", err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [])

    return {
        loading,
        error,
        fetchConversations,
        fetchMessages,
        sendMessage,
        markMessagesAsRead,
        subscribeToChat,
        upsertConversation
    };
}
