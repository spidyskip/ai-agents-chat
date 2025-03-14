"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Conversation } from "@/lib/types"

interface NotificationProps {
  conversations: Conversation[] | null | undefined
  currentConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
}

export default function Notification({ conversations, currentConversation, onSelectConversation }: NotificationProps) {
  const [lastChecked, setLastChecked] = useState<Record<string, string>>({})
  const [newMessages, setNewMessages] = useState<Record<string, number>>({})
  const { toast } = useToast()

  // Use a ref to track previous state to avoid infinite loops
  const prevMessagesRef = useRef<Record<string, number>>({})

  // Ensure conversations is always an array
  const conversationList = Array.isArray(conversations) ? conversations : []

  // Check for new messages when conversations change
  useEffect(() => {
    const newState: Record<string, number> = {}

    conversationList.forEach((conversation) => {
      if (!conversation.messages) return

      const lastCheckedTime = lastChecked[conversation.id] || "0"
      const newCount = conversation.messages.filter(
        (msg) => msg.role === "assistant" && msg.created_at > lastCheckedTime,
      ).length

      if (newCount > 0 && conversation.id !== currentConversation?.id) {
        newState[conversation.id] = newCount

        // Show toast notification for new messages, but only if the count increased
        const prevCount = prevMessagesRef.current[conversation.id] || 0
        if (newCount > prevCount) {
          toast({
            title: `New message in ${conversation.title}`,
            description: `You have ${newCount} new message${newCount > 1 ? "s" : ""}`,
            action: (
              <button
                onClick={() => onSelectConversation(conversation)}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium"
              >
                View
              </button>
            ),
          })
        }
      }
    })

    // Update the ref with current state before setting new state
    prevMessagesRef.current = { ...newMessages }
    setNewMessages(newState)

    // Remove newMessages from the dependency array to avoid infinite loops
  }, [conversationList, currentConversation, lastChecked, toast, onSelectConversation])

  // Update last checked time when switching conversations
  useEffect(() => {
    if (currentConversation) {
      setLastChecked((prev) => ({
        ...prev,
        [currentConversation.id]: new Date().toISOString(),
      }))

      // Clear new message count for current conversation
      setNewMessages((prev) => {
        const newState = { ...prev }
        delete newState[currentConversation.id]
        return newState
      })
    }
  }, [currentConversation])

  const totalNewMessages = Object.values(newMessages).reduce((sum, count) => sum + count, 0)

  return totalNewMessages > 0 ? (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
          onClick={() => {
            // Find the conversation with new messages and select it
            const conversationWithNewMessages = conversationList.find((conv) => newMessages[conv.id] > 0)
            if (conversationWithNewMessages) {
              onSelectConversation(conversationWithNewMessages)
            }
          }}
        >
          <Bell size={20} />
        </button>
        <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {totalNewMessages}
        </span>
      </div>
    </div>
  ) : null
}

