"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";

export function useUnreadCount() {
    const { user } = useAuth();
    const userId = user?.id;
    // Optimization: Track userId with count to avoid stale data on user switch
    const [state, setState] = useState<{ userId: string | null; count: number }>({ userId: null, count: 0 });

    // Use a ref to store the timeout ID so we can clear it on unmount or re-render
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!userId) {
            return;
        }

        // 1. Fetch initial count
        const fetchInitialCount = async () => {
            const { count, error } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("is_read", false)
                .neq("sender_id", userId); // Valid because RLS ensures we only see messages in our chats

            if (!error && count !== null) {
                setState({ userId, count });
            }
        };

        fetchInitialCount();

        // 2. Subscribe to new messages
        // Use a unique channel per hook instance to prevent collisions if used multiple times
        const channelName = `unread_count:${userId}:${Math.random().toString(36).substring(7)}`;
        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    const newMessage = payload.new as any;
                    // If sender is not me, it's a new unread message
                    if (newMessage.sender_id !== userId) {
                        setState((prev) => ({ ...prev, count: prev.count + 1 }));
                    }
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
                    // const oldMessage = payload.old as any; // Unused
                    const newMessage = payload.new as any;

                    // If message was unread and became read
                    // Logic: If is_read changed from false to true
                    if (newMessage.is_read === true && newMessage.sender_id !== userId) {
                        // Debounce the re-fetch to avoid N+1 queries when marking multiple messages as read
                        if (debounceTimeoutRef.current) {
                            clearTimeout(debounceTimeoutRef.current);
                        }

                        debounceTimeoutRef.current = setTimeout(() => {
                            fetchInitialCount();
                        }, 1000);
                    }
                }
            )
            .subscribe();

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Optimization: Derive return value to avoid cascading renders on logout/login
    // Only return count if it belongs to the current user
    return (userId && state.userId === userId) ? state.count : 0;
}
