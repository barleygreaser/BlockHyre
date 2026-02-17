"use client";

import { memo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatShortRelativeTime } from "@/lib/date-utils";
import type { Chat } from "@/app/hooks/use-messages";

interface ConversationListItemProps {
    chat: Chat;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export const ConversationListItem = memo(({ chat, isSelected, onSelect }: ConversationListItemProps) => {
    return (
        <button
            onClick={() => onSelect(chat.id)}
            className={cn(
                "w-full p-4 transition-colors text-left hover:bg-slate-50",
                isSelected && "bg-slate-100"
            )}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {chat.other_user_photo ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                                src={chat.other_user_photo}
                                alt={chat.other_user_name || "User"}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        </div>
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
                    {chat.last_message_content && (
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-slate-600 flex-1 min-w-0 truncate">
                                {chat.last_message_content?.replace(/\n/g, ' ').replace(/\*\*/g, '').substring(0, 60) || ''}
                                {(chat.last_message_content?.length || 0) > 60 ? '...' : ''}
                            </p>
                            {chat.last_message_time && (
                                <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap ml-auto">
                                    {formatShortRelativeTime(chat.last_message_time)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
});

ConversationListItem.displayName = 'ConversationListItem';
