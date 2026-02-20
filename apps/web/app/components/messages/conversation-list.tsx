"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
    // P1: Guard against double-mount
    const hasLoadedRef = useRef(false);
    // P4: Debounce timer for UPDATE events to prevent cascading reloads
    const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Optimization: Use ref to access latest selectedChatId in subscription callback without re-subscribing
    const selectedChatIdRef = useRef(selectedChatId);

    useEffect(() => {
        selectedChatIdRef.current = selectedChatId;
    }, [selectedChatId]);

    const loadConversations = useCallback(async () => {
        const data = await fetchConversations();
        setConversations(data);
        if (initialLoad) {
            setInitialLoad(false);
        }
    }, [fetchConversations, initialLoad]);

    // P1: Guarded initial load — only fires once
    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
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
                    if (payload.eventType === 'INSERT') {
                        const newMsg = payload.new as any;
                        setConversations((prev) => {
                            const index = prev.findIndex((c) => c.id === newMsg.chat_id);

                            // If chat not found (new conversation), fallback to full reload
                            if (index === -1) {
                                loadConversations();
                                return prev;
                            }

                            const newConversations = [...prev];
                            const updatedChat = { ...newConversations[index] };

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
                    } else if (payload.eventType === 'UPDATE') {
                        // P4: For UPDATE events (e.g. is_read changes), optimistically
                        // update the unread count if the chat is currently selected,
                        // instead of doing a full reload every time.
                        const updatedMsg = payload.new as any;

                        // If the message was marked as read and belongs to the selected chat,
                        // just reset unread count for that chat (no network call needed).
                        if (updatedMsg.is_read === true && updatedMsg.chat_id === selectedChatIdRef.current) {
                            setConversations((prev) =>
                                prev.map((c) =>
                                    c.id === updatedMsg.chat_id
                                        ? { ...c, unread_count: 0 }
                                        : c
                                )
                            );
                            return;
                        }

                        // P4: Debounce full reload for UPDATE events to batch rapid changes
                        // (e.g. marking multiple messages read fires many UPDATEs in quick succession)
                        if (reloadTimerRef.current) {
                            clearTimeout(reloadTimerRef.current);
                        }
                        reloadTimerRef.current = setTimeout(() => {
                            loadConversations();
                        }, 1000);
                    }
                    // DELETE events are rare; ignore them or handle as needed
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
                    loadConversations();
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
            if (reloadTimerRef.current) {
                clearTimeout(reloadTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Removed selectedChatId to prevent resubscription on selection change

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
