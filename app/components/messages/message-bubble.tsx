"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Message } from "@/app/hooks/use-messages";

interface MessageBubbleProps {
    message: Message;
    isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
    return (
        <div
            className={cn(
                "flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                {message.sender?.profile_photo_url ? (
                    <img
                        src={message.sender.profile_photo_url}
                        alt={message.sender.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-medium">
                        {message.sender?.full_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                )}
            </div>

            {/* Message Content */}
            <div className={cn("flex flex-col max-w-[70%]", isCurrentUser ? "items-end" : "items-start")}>
                <div
                    className={cn(
                        "rounded-2xl px-4 py-2 break-words",
                        isCurrentUser
                            ? "bg-safety-orange text-white rounded-tr-sm"
                            : "bg-slate-100 text-slate-900 rounded-tl-sm"
                    )}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-slate-400 mt-1 px-1">
                    {format(new Date(message.created_at), "h:mm a")}
                </span>
            </div>
        </div>
    );
}
