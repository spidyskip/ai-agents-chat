"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import type { Message } from "@/lib/types"

interface MessageItemProps {
  message: Message
  isLastMessage?: boolean
}

export default function MessageItem({ message, isLastMessage = false }: MessageItemProps) {
  const [copied, setCopied] = useState(false)

  // Skip rendering system messages
  if (message.role === "system") {
    return null
  }

  const isUser = message.role === "user"

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
          <Avatar className={`${isUser ? "ml-2" : "mr-2"} flex-shrink-0`}>
            <AvatarFallback>AI</AvatarFallback>
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
          </Avatar>
        )}

        <Card className={`p-3 relative ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
          <Avatar className={`${isUser ? "mr-2" : "ml-2"} flex-shrink-0`}>
            <AvatarFallback>U</AvatarFallback>
            <AvatarImage
              src={message.user_info?.avatar || "/placeholder.svg?height=40&width=40"}
              alt={message.user_info?.username || "User"}
            />
          </Avatar>
        )}
      </div>
    </div>
  )
}

