"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMessages, type Message } from "@/app/hooks/use-messages";
import { type ChatMessage } from "@/hooks/use-realtime-chat";
import { useStableTransform } from "@/hooks/use-stable-transform";
import { RealtimeChat } from "@/components/realtime-chat";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import type { RealtimeChannel } from "@supabase/supabase-js";


interface MessageViewProps {
    chatId: string;
}

export function MessageView({ chatId }: MessageViewProps) {
    const { user, userProfile } = useAuth();
    const { fetchMessages, sendMessage, markMessagesAsRead, subscribeToChat, loading } = useMessages();
    const [messages, setMessages] = useState<Message[]>([]);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const isVisibleRef = useRef(false);
    // P1: Guard against React Strict Mode double-mount
    const hasLoadedRef = useRef<string | null>(null);

    const loadMessages = useCallback(async () => {
        const data = await fetchMessages(chatId);
        setMessages(data);
    }, [chatId, fetchMessages]);

    useEffect(() => {
        if (!chatId || !user) return;

        // P1: Prevent double-execution on same chatId (React Strict Mode)
        if (hasLoadedRef.current === chatId) return;
        hasLoadedRef.current = chatId;

        loadMessages();
        markMessagesAsRead(chatId);
        isVisibleRef.current = true;

        // Subscribe to real-time updates (DB)
        channelRef.current = subscribeToChat(chatId, (message) => {
            setMessages((prev) => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });

            // Mark as read if message is from other user and chat is visible
            if (message.sender_id !== user?.id && isVisibleRef.current) {
                markMessagesAsRead(chatId);
            }
        });

        return () => {
            isVisibleRef.current = false;
            // Reset the guard so switching away and back works
            hasLoadedRef.current = null;
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId, user?.id]);

    const handlePersistentSend = useCallback(async (chatMsg: ChatMessage) => {
        await sendMessage(chatId, chatMsg.content, chatMsg.id);
    }, [chatId, sendMessage]);

    // Transform function: stable definition for useStableTransform
    const transformMessage = useCallback((msg: Message) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.created_at,
        messageType: msg.message_type || 'text',
        recipient_id: msg.recipient_id,
        senderId: msg.sender_id,
        user: {
            name: msg.sender?.full_name || 'Unknown',
            avatarUrl: msg.sender?.profile_photo_url
        }
    }), []);

    // Map DB messages to ChatMessage format
    const mappedMessages = useStableTransform(messages, transformMessage);

    // Get user details
    // P1: Use userProfile (DB data) to ensure consistency with historical messages and avoid flickering
    const userName = userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = userProfile?.profilePhotoUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    if (loading && messages.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <RealtimeChat
                roomName={chatId}
                username={userName}
                userAvatar={userAvatar}
                messages={mappedMessages}
                onSend={handlePersistentSend}
                currentUserId={user?.id}
            />
        </div>
    );
}
