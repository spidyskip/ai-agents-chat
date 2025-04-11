"use client"

import { MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import RenameDialog from "./rename-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Conversation } from "@/lib/types"

interface ConversationListProps {
  conversations: Conversation[] | null | undefined
  currentConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
  onRenameConversation: (id: string, newTitle: string) => Promise<void>
  onDeleteConversation: (id: string) => Promise<void>
}

export default function ConversationList({
  conversations,
  currentConversation,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
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
          <div className="pr-2 flex">
            <RenameDialog conversation={conversation} onRename={onRenameConversation} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="h-8 w-8 p-0 flex items-center justify-center text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                  <span className="sr-only">Delete conversation</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this conversation? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteConversation(conversation.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}

