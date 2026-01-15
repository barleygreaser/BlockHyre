'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import {
  type ChatMessage,
  useRealtimeChat,
} from '@/hooks/use-realtime-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'

interface RealtimeChatProps {
  roomName: string
  username: string
  userAvatar?: string
  onMessage?: (messages: ChatMessage[]) => void
  onSend?: (message: ChatMessage) => void
  messages?: ChatMessage[]
  currentUserId?: string
}

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param onMessage - The callback function to handle the messages. Useful if you want to store the messages in a database.
 * @param messages - The messages to display in the chat. Useful if you want to display messages from a database.
 * @returns The chat component
 */
export const RealtimeChat = ({
  roomName,
  username,
  userAvatar,
  onMessage,
  onSend,
  messages: initialMessages = [],
  currentUserId,
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll()
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
  } = useRealtimeChat({
    roomName,
    username,
  })
  const [newMessage, setNewMessage] = useState('')

  // Merge realtime messages with initial messages
  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    // Remove duplicates based on message id using Map for O(N) performance
    const uniqueMessagesMap = new Map<string, ChatMessage>()

    // Using a Map ensures we only keep the first occurrence of each message ID
    // which matches the behavior of the original filter/findIndex implementation
    // but with O(N) complexity instead of O(N^2)
    for (const message of mergedMessages) {
      if (!uniqueMessagesMap.has(message.id)) {
        uniqueMessagesMap.set(message.id, message)
      }
    }

    const uniqueMessages = Array.from(uniqueMessagesMap.values())

    // Sort by creation date
    // Optimization: Use direct string comparison instead of localeCompare for ISO dates
    const sortedMessages = uniqueMessages.sort((a, b) =>
      a.createdAt > b.createdAt ? 1 : a.createdAt < b.createdAt ? -1 : 0
    )

    return sortedMessages
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    if (onMessage) {
      onMessage(allMessages)
    }
  }, [allMessages, onMessage])

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected) return

      // Keep reference to input element
      const inputElement = inputRef.current

      // Store message and clear input immediately
      const messageToSend = newMessage
      setNewMessage('')

      // Send the message
      const message = await sendMessage(messageToSend, userAvatar)
      if (message && onSend) {
        onSend(message)
      }


      // Refocus after a brief delay to allow iOS to reset autocapitalization
      // but still keep keyboard open
      setTimeout(() => {
        if (inputElement) {
          inputElement.focus()
        }
      }, 50)
    },
    [newMessage, isConnected, sendMessage, userAvatar, onSend]
  )

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <ChatList
          messages={allMessages}
          currentUserId={currentUserId}
          username={username}
        />
      </div>

      <form onSubmit={handleSendMessage} className="flex w-full gap-2 border-t border-border p-4">
        <Input
          ref={inputRef}
          className={cn(
            'rounded-full bg-background text-base transition-all duration-300',
            isConnected && newMessage.trim() ? 'w-[calc(100%-36px)]' : 'w-full'
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          enterKeyHint="send"
          autoCapitalize="sentences"
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  )
}
