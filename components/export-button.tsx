"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Conversation, Message } from "@/lib/types"

interface ExportButtonProps {
  conversation: Conversation
  messages: Message[]
}

export default function ExportButton({ conversation, messages }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportConversation = async () => {
    setIsExporting(true)

    try {
      // Combine conversation metadata with messages
      const exportData = {
        id: conversation.id,
        title: conversation.title,
        agent_id: conversation.agent_id,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
        })),
      }

      // Create a Blob with the JSON data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${conversation.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting conversation:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={exportConversation} disabled={isExporting || !messages.length}>
      <Download size={16} className="mr-2" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  )
}

