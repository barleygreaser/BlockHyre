'use client'

import { supabase } from '@/lib/supabase'
import { useCallback, useEffect, useState, useRef } from 'react'

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
  // Use global supabase instance instead of creating a new one per component
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Reuse global supabase client
    const channel = supabase.channel(roomName)
    channelRef.current = channel

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
      setIsConnected(false)
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [roomName])

  const sendMessage = useCallback(
    async (content: string, avatarUrl?: string) => {
      const channel = channelRef.current
      if (!channel) return

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
    [username]
  )

  return { messages, sendMessage, isConnected }
}
