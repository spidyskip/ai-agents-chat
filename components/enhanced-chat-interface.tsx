"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMessages } from "@/contexts/message-context"
import { useAuth } from "@/contexts/auth-context"
import type { Agent, Conversation } from "@/lib/types"
import AgentInfo from "./agent-info"
import ExportButton from "./export-button"
import MessageItem from "./message-item"

interface EnhancedChatInterfaceProps {
  conversation: Conversation | null
  selectedAgent: Agent | null
  availableAgents: Agent[]
  offlineMode?: boolean
  onError?: (error: string) => void
}

export default function EnhancedChatInterface({
  conversation,
  selectedAgent,
  availableAgents,
  offlineMode = false,
  onError,
}: EnhancedChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [agentForMessage, setAgentForMessage] = useState<Agent | null>(null)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const { messages, isLoading, sendMessage, loadMessages } = useMessages()

  // Set the default agent when selectedAgent changes
  useEffect(() => {
    setAgentForMessage(selectedAgent)
  }, [selectedAgent])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      loadMessages(conversation.id)
    }
  }, [conversation, loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !conversation || !user) return

    setError(null)

    try {
      // Use the selected agent for this message if one is chosen
      const success = await sendMessage(input, conversation, agentForMessage || undefined)

      if (success) {
        setInput("")
        // Reset agent selection after sending
        setAgentForMessage(selectedAgent)
        setShowAgentSelector(false)
      } else {
        throw new Error("Failed to send message")
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
            messages.map((message, index) => (
              <MessageItem key={message.id} message={message} isLastMessage={index === messages.length - 1} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <div className="flex-1 flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={offlineMode ? "Type your message (offline mode)..." : "Type your message..."}
              className="flex-1"
              disabled={isLoading || !conversation}
            />

            {/* Agent selector for this message */}
            <Select
              value={agentForMessage?.agent_id || ""}
              onValueChange={(value) => {
                const agent = availableAgents.find((a) => a.agent_id === value)
                setAgentForMessage(agent || null)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.agent_id} value={agent.agent_id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading || !input.trim() || !conversation}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

