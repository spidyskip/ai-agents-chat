"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import type { Message, Agent } from "@/lib/types"
import { AgentAvatar } from "./agent-avatar"

interface MessageItemProps {
  message: Message
  isLastMessage?: boolean
  agent?: Agent | null
  availableAgents?: Agent[]
}

export default function MessageItem({ message, isLastMessage = false, agent, availableAgents = [] }: MessageItemProps) {
  const [copied, setCopied] = useState(false)

  // Skip rendering system messages
  if (message.role === "system") {
    return null
  }

  const isUser = message.role === "user"

  // Find the agent for this message if it has an agent_id
  const messageAgent =
    message.agent_id && availableAgents.length > 0
      ? availableAgents.find((a) => a.agent_id === message.agent_id) || null
      : agent

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format timestamp
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className={`${isUser ? "ml-2" : "mr-2"} flex-shrink-0`}>
            <AgentAvatar agent={messageAgent} size="sm" />
          </div>
        )}

        <Card className={`p-3 relative ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          {!isUser && (
            <div className="text-xs font-medium mb-1 text-muted-foreground">
              {message.agent_name || messageAgent?.name || "Assistant"}
            </div>
          )}
          <div className="mb-1">{message.content}</div>

          <div
            className={`text-xs ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"} flex justify-between items-center mt-1`}
          >
            <span>{formattedTime}</span>

            {!isUser && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={copyToClipboard}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            )}
          </div>
        </Card>

        {isUser && (
          <div className={`${isUser ? "mr-2" : "ml-2"} flex-shrink-0`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
              <AvatarImage
                src={message.user_info?.avatar || "/avatars/young-woman.svg?height=40&width=40"}
                alt={message.user_info?.username || "User"}
              />
            </Avatar>
          </div>
        )}
      </div>
    </div>
  )
}

