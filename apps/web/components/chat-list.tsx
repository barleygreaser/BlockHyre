'use client'

import { memo } from 'react'
import { ChatMessageItem } from '@/components/chat-message'
import { SystemMessage } from "@/app/components/messages/system-message"
import { ChatMessage } from '@/hooks/use-realtime-chat'

interface ChatListProps {
  messages: ChatMessage[]
  currentUserId?: string
  username: string
}

export const ChatList = memo(({ messages, currentUserId, username }: ChatListProps) => {
  if (messages.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        No messages yet. Start the conversation!
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null
        const showHeader = !prevMessage || prevMessage.user.name !== message.user.name

        // 1. ROBUST CHECK: Handle both camelCase and snake_case
        const isSystemMessage =
          message.messageType === 'system' ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (message as any).message_type === 'system';

        // Render system messages differently
        if (isSystemMessage) {
          // Filter: Only render if message is for this user OR is a broadcast (null)
          if (message.recipient_id && message.recipient_id !== currentUserId) {
            return null; // Skip this message
          }

          return (
            <SystemMessage
              key={message.id}
              content={message.content}
            />
          )
        }

        // --- FIX: Use ID comparison instead of username comparison ---
        // Prioritize ID comparison. Fallback to name comparison for optimistic messages
        // that might not have senderId attached yet (though they should).
        const isOwnMessage = (currentUserId && message.senderId)
          ? message.senderId === currentUserId
          : message.user.name === username;

        return (
          <ChatMessageItem
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showHeader={showHeader}
          />
        )
      })}
    </div>
  )
})

ChatList.displayName = 'ChatList'
