"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    message_type?: 'text' | 'system';
}

interface MessageContextType {
    unreadCount: number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    // Track userId to prevent stale state across logins
    const [state, setState] = useState<{ userId: string | null; count: number }>({ userId: null, count: 0 });
    const channelRef = useRef<RealtimeChannel | null>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user) {
            return;
        }

        const userId = user.id;

        // 1. Fetch initial count
        const fetchUnreadCount = async () => {
            const { count, error } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("is_read", false)
                .neq("sender_id", userId);

            if (!error && count !== null) {
                setState({ userId, count });
            }
        };

        fetchUnreadCount();

        // 2. Subscribe to messages
        // Use a unique channel per hook instance to prevent collisions
        const channelName = `global_messages:${userId}:${Math.random().toString(36).substring(7)}`;
        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                async (payload) => {
                    const newMessage = payload.new as Message;

                    // Ignore own messages
                    if (newMessage.sender_id === userId) {
                        return;
                    }

                    // Increment unread count
                    setState((prev) => ({ ...prev, count: prev.count + 1 }));

                    // Show Toast Notification
                    // Fetch the chat to verify the user is a participant
                    const { data: chat } = await supabase
                        .from('chats')
                        .select('id, owner_id, renter_id')
                        .eq('id', newMessage.chat_id)
                        .single();

                    // Only show notification if user is part of this chat
                    if (!chat || (chat.owner_id !== userId && chat.renter_id !== userId)) {
                        return;
                    }

                    // Fetch sender details
                    const { data: sender } = await supabase
                        .from('users')
                        .select('full_name, profile_photo_url')
                        .eq('id', newMessage.sender_id)
                        .single();

                    const senderName = sender?.full_name || 'Someone';

                    toast(
                        <div className="flex flex-col gap-1">
                            <div className="font-semibold text-slate-900">{senderName}</div>
                            <div className="text-sm text-slate-600 line-clamp-2">{newMessage.content}</div>
                        </div>,
                        {
                            duration: 5000,
                            action: {
                                label: 'View Message',
                                onClick: () => {
                                    router.push(`/messages?id=${newMessage.chat_id}`);
                                },
                            },
                            closeButton: true,
                        }
                    );
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    // If message was unread and became read
                    if (newMessage.is_read === true && newMessage.sender_id !== userId) {
                        // Debounce the re-fetch to avoid N+1 queries when marking multiple messages as read
                        if (debounceTimeoutRef.current) {
                            clearTimeout(debounceTimeoutRef.current);
                        }

                        debounceTimeoutRef.current = setTimeout(() => {
                            fetchUnreadCount();
                        }, 1000);
                    }
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [user, router]);

    // Derived unread count: returns 0 if no user or if state belongs to a different user
    const unreadCount = (user && state.userId === user.id) ? state.count : 0;

    return (
        <MessageContext.Provider value={{ unreadCount }}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessageContext() {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error("useMessageContext must be used within a MessageProvider");
    }
    return context;
}
