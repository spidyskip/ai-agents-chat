"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Message, Conversation, Agent } from "@/lib/types"
import messageService from "@/lib/message-service"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"

interface MessageContextType {
  messages: Message[]
  isLoading: boolean
  sendMessage: (content: string, conversation: Conversation, agent?: Agent | null) => Promise<boolean>
  loadMessages: (conversationId: string) => Promise<void>
  clearMessages: () => void
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const sendMessage = useCallback(
    async (content: string, conversation: Conversation, agent?: Agent | null): Promise<boolean> => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to send messages",
          variant: "destructive",
        })
        return false
      }

      if (!content.trim()) return false

      setIsLoading(true)

      try {
        // Create a temporary user message to show immediately
        const tempUserMessage: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: conversation.id,
          role: "user",
          content,
          created_at: new Date().toISOString(),
          user_id: user.id, // Automatically use the logged-in user's ID
        }

        // Add the user message to the UI immediately
        setMessages((prev) => [...prev, tempUserMessage])

        // Use the specified agent if provided, otherwise use the conversation's agent_id
        const agentId = agent ? agent.agent_id : null
        
        // Send the message to the API
        const assistantMessage = await messageService.sendMessage(content, conversation.id, agent, user)

        if (!assistantMessage) {
          throw new Error("Failed to get response from assistant")
        }

        // Update the messages with the assistant's response
        setMessages((prev) => [...prev, assistantMessage])

        return true
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user, toast],
  )

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoading(true)

      try {
        const fetchedMessages = await messageService.getMessages(conversationId)
        setMessages(messageService.formatMessagesForDisplay(fetchedMessages))
      } catch (error) {
        console.error("Error loading messages:", error)
        toast({
          title: "Error",
          description: "Failed to load conversation messages",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return (
    <MessageContext.Provider
      value={{
        messages,
        isLoading,
        sendMessage,
        loadMessages,
        clearMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider")
  }
  return context
}

