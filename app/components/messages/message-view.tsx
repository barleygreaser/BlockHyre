"use client";

import { useEffect, useState, useRef } from "react";
import { useMessages, type Message } from "@/app/hooks/use-messages";
import { MessageBubble } from "./message-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface MessageViewProps {
    chatId: string;
}

export function MessageView({ chatId }: MessageViewProps) {
    const { user } = useAuth();
    const { fetchMessages, sendMessage, markMessagesAsRead, subscribeToChat, loading } = useMessages();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (chatId) {
            loadMessages();
            markMessagesAsRead(chatId);

            // Subscribe to real-time updates
            channelRef.current = subscribeToChat(chatId, (message) => {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();

                // Mark as read if message is from other user
                if (message.sender_id !== user?.id) {
                    markMessagesAsRead(chatId);
                }
            });

            return () => {
                if (channelRef.current) {
                    channelRef.current.unsubscribe();
                }
            };
        }
    }, [chatId, user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        const data = await fetchMessages(chatId);
        setMessages(data);
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const message = await sendMessage(chatId, newMessage);
        if (message) {
            setNewMessage("");
            // Message will be added via realtime subscription
        }
        setSending(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
        }
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "")}>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-16 w-2/3 rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-1">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center p-8">
                            <p className="text-slate-500">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isCurrentUser={message.sender_id === user?.id}
                            />
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Form */}
            <div className="border-t border-slate-200 p-4 bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-safety-orange hover:bg-orange-600"
                    >
                        {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
