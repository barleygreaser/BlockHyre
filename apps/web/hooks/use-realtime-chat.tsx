'use client'

import { createClient } from '@/lib/client'
import { useCallback, useEffect, useState, useMemo } from 'react'

interface UseRealtimeChatProps {
  roomName: string
  username: string
}

export interface ChatMessage {
  id: string
  content: string
  user: {
    name: string
    avatarUrl?: string
  }
  createdAt: string
  messageType?: 'text' | 'system'
  recipient_id?: string
  senderId?: string
}

const EVENT_MESSAGE_TYPE = 'message'

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const [supabase] = useState(() => createClient())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const channel = useMemo(() => supabase.channel(roomName), [supabase, roomName])

  useEffect(() => {
    channel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channel, supabase])

  const sendMessage = useCallback(
    async (content: string, avatarUrl?: string) => {
      if (!channel || !isConnected) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          name: username,
          avatarUrl,
        },
        createdAt: new Date().toISOString(),
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })

      return message
    },
    [channel, isConnected, username]
  )

  return { messages, sendMessage, isConnected }
}
