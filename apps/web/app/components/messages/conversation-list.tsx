"use client";

import { useEffect, useState, useRef } from "react";
import { useMessages, type Chat } from "@/app/hooks/use-messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";
import { ConversationListItem } from "./conversation-list-item";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface ConversationListProps {
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
}

export function ConversationList({ selectedChatId, onSelectChat }: ConversationListProps) {
    const { fetchConversations, loading } = useMessages();
    const [conversations, setConversations] = useState<Chat[]>([]);
    const { user } = useAuth();
    const channelRef = useRef<RealtimeChannel | null>(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const loadConversations = async (isBackgroundUpdate = false) => {
        const data = await fetchConversations();
        setConversations(data);
        if (initialLoad) {
            setInitialLoad(false);
        }
    };

    useEffect(() => {
        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!user) return;

        // Subscribe to messages table for realtime updates
        const channel = supabase
            .channel('conversation-list-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    // Optimistic update for new messages to avoid full reload storm
                    if (payload.eventType === 'INSERT') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const newMsg = payload.new as any;
                        setConversations((prev) => {
                            const index = prev.findIndex((c) => c.id === newMsg.chat_id);

                            // If chat not found (new conversation), fallback to full reload
                            if (index === -1) {
                                loadConversations(true);
                                return prev;
                            }

                            // Create a new array and object to maintain immutability
                            const newConversations = [...prev];
                            const updatedChat = { ...newConversations[index] };

                            // Update last message details
                            updatedChat.last_message_content = newMsg.content;
                            updatedChat.last_message_time = newMsg.created_at;

                            // Update unread count if message is from someone else
                            if (newMsg.sender_id !== user.id) {
                                updatedChat.unread_count = (updatedChat.unread_count || 0) + 1;
                            }

                            // Move updated chat to top
                            newConversations.splice(index, 1);
                            newConversations.unshift(updatedChat);

                            return newConversations;
                        });
                    } else {
                        // For UPDATE (read status) or DELETE, reload to be safe
                        loadConversations(true);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chats',
                },
                () => {
                    // Reload when new chat is created
                    loadConversations(true);
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (loading && initialLoad) {
        return (
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-slate-500">
                    Start a conversation by contacting a tool owner from a listing page.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="divide-y divide-slate-200">
                {conversations.map((chat) => (
                    <ConversationListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onSelect={onSelectChat}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
