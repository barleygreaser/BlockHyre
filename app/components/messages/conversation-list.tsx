"use client";

import { useEffect, useState } from "react";
import { useMessages, type Chat } from "@/app/hooks/use-messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ConversationListProps {
    selectedChatId: string | null;
    onSelectChat: (chatId: string) => void;
}

export function ConversationList({ selectedChatId, onSelectChat }: ConversationListProps) {
    const { fetchConversations, loading } = useMessages();
    const [conversations, setConversations] = useState<Chat[]>([]);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        const data = await fetchConversations();
        setConversations(data);
    };

    if (loading) {
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
            <div className="p-2">
                {conversations.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                            "w-full p-3 rounded-lg mb-1 transition-colors text-left hover:bg-slate-50",
                            selectedChatId === chat.id && "bg-slate-100"
                        )}
                    >
                        <div className="flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {chat.other_user_photo ? (
                                    <img
                                        src={chat.other_user_photo}
                                        alt={chat.other_user_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                                        {chat.other_user_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-semibold text-slate-900 truncate">
                                        {chat.other_user_name}
                                    </h3>
                                    {(chat.unread_count ?? 0) > 0 && (
                                        <Badge className="bg-safety-orange hover:bg-safety-orange text-white ml-2 flex-shrink-0">
                                            {chat.unread_count}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-1 truncate">
                                    {chat.listing_title}
                                </p>
                                {chat.last_message_content && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-slate-600 truncate flex-1 [&_p]:inline [&_p]:m-0 prose prose-sm max-w-none prose-p:text-slate-600 prose-strong:text-slate-900">
                                            <ReactMarkdown
                                                allowedElements={['p', 'strong', 'em', 'span', 'b', 'i']}
                                                unwrapDisallowed
                                                components={{
                                                    p: (props: any) => <span {...props} />
                                                }}
                                            >
                                                {chat.last_message_content?.replace(/\n/g, ' ') || ''}
                                            </ReactMarkdown>
                                        </div>
                                        {chat.last_message_time && (
                                            <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                                                {formatDistanceToNow(new Date(chat.last_message_time), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
    );
}
