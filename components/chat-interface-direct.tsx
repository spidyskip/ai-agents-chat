"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import type { Agent, Conversation, Message } from "@/lib/types"
import AgentInfo from "./agent-info"
import ExportButton from "./export-button"

interface ChatInterfaceDirectProps {
  conversation: Conversation | null
  messages: Message[]
  setMessages: (messages: Message[]) => void
  selectedAgent: Agent | null
  offlineMode?: boolean
  onError?: (error: string) => void
}

export default function ChatInterfaceDirect({
  conversation,
  messages,
  setMessages,
  selectedAgent,
  offlineMode = false,
  onError,
}: ChatInterfaceDirectProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !conversation) return

    // Add user message to the UI immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, userMessage])
    setInput("")
    setError(null)
    setIsLoading(true)
    try {
      // Send the message to the backend API
      const { data, error } = await apiClient.chat({
        query: input,
        agent_id: selectedAgent?.agent_id,
        thread_id: conversation.id,
        include_history: true,
      })

      if (error) {
        throw new Error(error)
      }

      if (data) {
        // Add assistant response to the UI
        const assistantMessage: Message = {
          id: `response-${Date.now()}`,
          conversation_id: conversation.id,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString(),
        }

        setMessages([...messages, userMessage, assistantMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")

      if (onError) {
        onError("Failed to send message")
      }

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!conversation && !selectedAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to AI Chat</h2>
          <p className="text-muted-foreground mb-6">
            Select an agent from the sidebar and start a new conversation to begin chatting.
          </p>
        </div>
      </div>
    )
  }

  if (!conversation && selectedAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold mb-4">Agent Selected: {selectedAgent.name}</h2>
          <p className="text-muted-foreground mb-6">
            Click "New" in the sidebar to start a conversation with this agent.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-full border-0 rounded-none">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle>{conversation?.title || "New Conversation"}</CardTitle>
          {offlineMode && (
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {conversation && <ExportButton conversation={conversation} messages={messages} />}
          {selectedAgent && <AgentInfo agent={selectedAgent} />}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {offlineMode
                ? "You are in offline mode. Messages will be processed using direct API integration."
                : "Start the conversation by sending a message."}
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start max-w-[80%]">
                  {message.role !== "user" && (
                    <Avatar className="mr-2">
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/single-person-2.png?height=40&width=40" />
                    </Avatar>
                  )}
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="ml-2">
                      <AvatarFallback>U</AvatarFallback>
                      <AvatarImage src="/single-person-1.png?height=40&width=40" />
                    </Avatar>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={offlineMode ? "Type your message (offline mode)..." : "Type your message..."}
            className="flex-1"
            disabled={isLoading || !conversation}
          />
          <Button type="submit" disabled={isLoading || !input.trim() || !conversation}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

