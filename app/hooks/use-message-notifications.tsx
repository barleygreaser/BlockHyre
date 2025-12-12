"use client";

import { useEffect, useRef } from "react";
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

export function useMessageNotifications() {
    const { user } = useAuth();
    const router = useRouter();
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!user) return;

        // Subscribe to all messages where the current user is the recipient
        const channel = supabase
            .channel('message-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    const newMessage = payload.new as Message;

                    // Only show notification if user is NOT the sender
                    if (newMessage.sender_id === user.id) {
                        return;
                    }

                    // Fetch the chat to verify the user is a participant
                    const { data: chat } = await supabase
                        .from('chats')
                        .select('id, owner_id, renter_id')
                        .eq('id', newMessage.chat_id)
                        .single();

                    // Only show notification if user is part of this chat
                    if (!chat || (chat.owner_id !== user.id && chat.renter_id !== user.id)) {
                        return;
                    }

                    // Fetch sender details
                    const { data: sender } = await supabase
                        .from('users')
                        .select('full_name, profile_photo_url')
                        .eq('id', newMessage.sender_id)
                        .single();

                    const senderName = sender?.full_name || 'Someone';

                    // Show toast notification
                    toast(
                        <div className="flex flex-col gap-1" >
                            <div className="font-semibold text-slate-900" > {senderName} </div>
                            < div className="text-sm text-slate-600 line-clamp-2" > {newMessage.content} </div>
                        </div>,
                        {
                            duration: 5000,
                            action: {
                                label: 'View Message',
                                onClick: () => {
                                    router.push(`/messages/${newMessage.chat_id}`);
                                },
                            },
                            closeButton: true,
                        }
                    );
                }
            )
            .subscribe();

        channelRef.current = channel;

        // Cleanup subscription on unmount
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [user, router]);

    return null;
}
