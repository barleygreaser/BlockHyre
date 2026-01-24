"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/context/auth-context";

export function useUnreadCount() {
    const { user } = useAuth();
    const userId = user?.id;
    // Optimization: Track userId with count to avoid stale data on user switch
    const [state, setState] = useState<{ userId: string | null; count: number }>({ userId: null, count: 0 });

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
        const channel = supabase
            .channel("global_unread_count")
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
                    // Note: payload.old might handle checking previous state if using full replica identity, 
                    // but often only ID is sent. 
                    // However, we can check if new state is read=true.
                    // We assume the user reading it triggered the update.

                    // Logic: If is_read changed from false to true
                    if (newMessage.is_read === true && newMessage.sender_id !== userId) {
                        // We can't strictly know if it was ALREADY read without 'old' context containing is_read
                        // securely, but typically we decrement if we see an update to 'true'.
                        // To be safe, we might re-fetch or optimistically decrement.
                        // Let's re-fetch to be accurate.
                        fetchInitialCount();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    // Optimization: Derive return value to avoid cascading renders on logout/login
    // Only return count if it belongs to the current user
    return (userId && state.userId === userId) ? state.count : 0;
}
