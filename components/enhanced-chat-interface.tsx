"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Loader2, WifiOff, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useMessages } from "@/contexts/message-context"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Agent, Conversation } from "@/lib/types"
import AgentInfo from "./agent-info"
import ExportButton from "./export-button"
import MessageItem from "./message-item"
import { AgentAvatar } from "./agent-avatar"

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
  const [activeAgentId, setActiveAgentId] = useState<string | "multi">(selectedAgent?.agent_id || "multi")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const { messages, isLoading, sendMessage, loadMessages } = useMessages()
  
  // Update activeAgentId when selectedAgent changes
  useEffect(() => {
    if (selectedAgent) {
      setActiveAgentId(selectedAgent.agent_id)
    }
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
      // If activeAgentId is "multi", pass null as the agent to let the backend choose
      // Otherwise, find the selected agent from availableAgents
      const agentToUse = activeAgentId === "multi" 
        ? null 
        : availableAgents.find(a => a.agent_id === activeAgentId) || null
      console.log("agentToUse", agentToUse)
      const success = await sendMessage(input, conversation, agentToUse)

      if (success) {
        setInput("")
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

  // Get the active agent name for display
  const getActiveAgentName = () => {
    if (activeAgentId === "multi") {
      return "Multi Agent"
    }
    
    const agent = availableAgents.find(a => a.agent_id === activeAgentId)
    return agent?.name || "Agent"
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
          <h2 className="text-2xl font-bold mb-4">Agent: {selectedAgent.name}</h2>
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
          <CardTitle>{conversation?.title}</CardTitle>
          {offlineMode && (
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Agent selector */}
          {availableAgents.length > 1 && (
            <Select value={activeAgentId} onValueChange={setActiveAgentId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multi" className="flex items-center">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Multi Agent</span>
                  </div>
                </SelectItem>
                
                {availableAgents.map(agent => (
                  <SelectItem key={agent.agent_id} value={agent.agent_id}>
                    <div className="flex items-center">
                      <AgentAvatar agent={agent} size="sm" className="mr-2" />
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {conversation && <ExportButton conversation={conversation} messages={messages} />}
          {activeAgentId !== "multi" && (
            <AgentInfo agent={availableAgents.find(a => a.agent_id === activeAgentId) || null} />
          )}
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
                : activeAgentId === "multi"
                  ? "Start the conversation to chat with all available agents."
                  : "Start the conversation by sending a message."}
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                isLastMessage={index === messages.length - 1}
                agent={selectedAgent}
                availableAgents={availableAgents}
              />
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
            placeholder={activeAgentId === "multi" 
              ? "Ask any question (the system will choose the best agent)..." 
              : `Ask ${getActiveAgentName()} a question...`}
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
