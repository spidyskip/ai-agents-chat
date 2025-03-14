"use client"

import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import RenameDialog from "./rename-dialog"
import type { Conversation } from "@/lib/types"

interface ConversationListProps {
  conversations: Conversation[] | null | undefined
  currentConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onRenameConversation: (id: string, newTitle: string) => Promise<void>
}

export default function ConversationList({
  conversations,
  currentConversation,
  onSelectConversation,
  onRenameConversation,
}: ConversationListProps) {
  // Ensure conversations is always an array
  const conversationList = Array.isArray(conversations) ? conversations : []

  if (conversationList.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No conversations yet. Select an agent and start a new conversation.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversationList.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "w-full rounded-md hover:bg-accent transition-colors flex items-center justify-between",
            currentConversation?.id === conversation.id && "bg-accent",
          )}
        >
          <button className="flex-1 text-left p-3 flex items-center" onClick={() => onSelectConversation(conversation)}>
            <MessageSquare size={18} className="mr-2 text-primary" />
            <div className="truncate">{conversation.title}</div>
          </button>
          <div className="pr-2">
            <RenameDialog conversation={conversation} onRename={onRenameConversation} />
          </div>
        </div>
      ))}
    </div>
  )
}

