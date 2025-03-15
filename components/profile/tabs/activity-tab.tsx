"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, FileText, User, Clock, Loader2, ChevronRight } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface Activity {
  id: string
  type: "conversation" | "document" | "login" | "agent"
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ActivityTabProps {
  user: UserType
}

export default function ActivityTab({ user }: ActivityTabProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityType, setActivityType] = useState("all")

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API
        // const { data } = await apiClient.getUserActivities(user.id);

        // For demo purposes, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const now = new Date()
        const mockActivities: Activity[] = [
          {
            id: "1",
            type: "conversation",
            title: "Chat with General Assistant",
            description: "You had a conversation with the General Assistant agent",
            timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
            metadata: {
              agent_id: "general-assistant",
              agent_name: "General Assistant",
              conversation_id: "conv-123",
            },
          },
          {
            id: "2",
            type: "document",
            title: "Created Project Requirements",
            description: "You created a new document",
            timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
            metadata: {
              document_id: "doc-456",
              category: "work",
            },
          },
          {
            id: "3",
            type: "login",
            title: "Logged in",
            description: "You logged in to your account",
            timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
            metadata: {
              ip: "192.168.1.1",
              device: "Desktop - Chrome",
            },
          },
          {
            id: "4",
            type: "agent",
            title: "Created Code Helper Agent",
            description: "You created a new AI agent",
            timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
            metadata: {
              agent_id: "code-helper",
              model: "gpt-4o",
            },
          },
          {
            id: "5",
            type: "conversation",
            title: "Chat with Code Helper",
            description: "You had a conversation about React components",
            timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
            metadata: {
              agent_id: "code-helper",
              agent_name: "Code Helper",
              conversation_id: "conv-789",
            },
          },
        ]

        setActivities(mockActivities)
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [user.id])

  // Filter activities based on selected type
  const filteredActivities =
    activityType === "all" ? activities : activities.filter((activity) => activity.type === activityType)

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "document":
        return <FileText className="h-5 w-5 text-green-500" />
      case "login":
        return <User className="h-5 w-5 text-purple-500" />
      case "agent":
        return <User className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>Track your recent activities and interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activityType} onValueChange={setActivityType} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="conversation">Conversations</TabsTrigger>
            <TabsTrigger value="document">Documents</TabsTrigger>
            <TabsTrigger value="login">Logins</TabsTrigger>
            <TabsTrigger value="agent">Agents</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mr-4 mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <h3 className="font-medium">{activity.title}</h3>
                    <Badge variant="outline" className="w-fit">
                      {formatDate(activity.timestamp)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-center mt-6">
              <Button variant="outline">Load More</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No activities found for the selected filter.</div>
        )}
      </CardContent>
    </Card>
  )
}

