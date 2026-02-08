"use client";

import { useEffect, useState, useRef } from "react";
import { useMessages, type Chat } from "@/app/hooks/use-messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/app/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";
import { ConversationListItem } from "./conversation-list-item";

interface ConversationListProps {
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
}

export function ConversationList({ selectedChatId, onSelectChat }: ConversationListProps) {
    const { fetchConversations, loading } = useMessages();
    const [conversations, setConversations] = useState<Chat[]>([]);
    const { user } = useAuth();
    const channelRef = useRef<any>(null);
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
                () => {
                    // Reload conversations when any message changes
                    loadConversations(true); // Pass true for background update
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
                    loadConversations(true); // Pass true for background update
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
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
