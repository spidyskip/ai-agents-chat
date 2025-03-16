"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import AgentSelector from "@/components/agent-selector"
import ConversationList from "@/components/conversation-list"
import { Button } from "@/components/ui/button"
import { PlusCircle, Menu, AlertTriangle, RefreshCw, MessageSquareShare } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-mobile"
import Notification from "@/components/notification"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import apiClient from "@/lib/api-client"
// Import the enhanced chat interface
import EnhancedChatInterface from "@/components/enhanced-chat-interface"

// Types
import type { Agent, Conversation } from "@/lib/types"

export default function Home() {
  // Initialize with empty arrays to avoid "map is not a function" errors
  const [agents, setAgents] = useState<Agent[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  // Fetch agents from the API - use useCallback to avoid recreation on every render
  const fetchAgents = useCallback(async () => {
    try {
      console.log("Fetching agents...")
      const { data, error } = await apiClient.getAgents()

      if (error) {
        console.error("Error fetching agents:", error)
        throw new Error(error)
      }

      if (data) {
        console.log(`Fetched ${data.length} agents`)
        setAgents(data)

        // If we got mock data, we might be in offline mode
        if (data.length > 0 && data[0].agent_id?.startsWith("mock-")) {
          console.log("Detected mock data, switching to offline mode")
          setOfflineMode(true)
        }
      } else {
        console.error("No agent data received")
        setAgents([])
      }

      // Clear API error if successful
      setApiError(null)
    } catch (error) {
      console.error("Error fetching agents:", error)
      setApiError("Failed to connect to the API server. Using offline mode.")
      setOfflineMode(true)
      apiClient.enableMockMode()

      // Set mock agents in offline mode
      const { data } = await apiClient.getAgents()
      if (data) {
        setAgents(data)
      }
    }
  }, [])

  // Fetch conversations from the API - use useCallback to avoid recreation on every render
  const fetchConversations = useCallback(async () => {
    if (offlineMode) {
      console.log("Skipping conversation fetch in offline mode")
      const { data, error } = await apiClient.getConversations('mock-user')
      if (data) {
        setConversations(data)
      }
      return
    }

    try {
      console.log("Fetching conversations...")
      const { data, error } = await apiClient.getConversations(user?.id)
      
      if (error) {
        console.error("Error fetching conversations:", error)
        throw new Error(error)
      }

      if (data) {
        console.log(`Fetched ${data.length} conversations`)
        setConversations(data)
      } else {
        console.error("No conversation data received")
        setConversations([])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)

      // Don't set API error here as we might have already set it in fetchAgents
      // and we don't want to overwrite a more specific error message

      // If we're in offline mode, use mock conversations
      if (offlineMode) {
        const { data } = await apiClient.getConversations("mock-user")
        if (data) {
          setConversations(data)
        }
      }
    }
  }, [offlineMode])

  // Fetch agents and conversations on component mount
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      const initialize = async () => {
        setIsLoading(true)
        try {
          await fetchAgents()
          await fetchConversations()
        } catch (error) {
          console.error("Error initializing app:", error)
          toast({
            title: "Connection Error",
            description: "Failed to connect to the API server. Some features may be limited.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      initialize()
    }
  }, [fetchAgents, fetchConversations, toast, user])

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Create a new conversation - use useCallback to avoid recreation on every render
  const createConversation = useCallback(async () => {
    if (!selectedAgent) return

    try {
      const { data, error } = await apiClient.createConversation({
        agent_id: selectedAgent.agent_id,
        title: `New Conversation`,
        user_id: user?.id, // Add user ID to the conversation
      })

      if (error) {
        throw new Error(error)
      }

      if (data) {
        setConversations((prev) => [...prev, data])
        setCurrentConversation(data)

        toast({
          title: "Conversation created",
          description: `Started a new conversation with ${selectedAgent.name}`,
        })
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      })
    }
  }, [selectedAgent, toast, user])

  // Select a conversation - use useCallback to avoid recreation on every render
  const selectConversation = useCallback(
    async (conversation: Conversation) => {
      setCurrentConversation(conversation)
      if (isMobile) {
        setSidebarOpen(false)
      }

      // Fetch the full conversation with messages
      try {
        const { data, error } = await apiClient.getConversation(conversation.id)

        if (error) {
          throw new Error(error)
        }

        if (data) {
          setCurrentConversation(data)
        }
      } catch (error) {
        console.error("Error fetching conversation details:", error)
        toast({
          title: "Error",
          description: "Failed to load conversation details",
          variant: "destructive",
        })
      }
    },
    [isMobile, toast],
  )

  // Rename a conversation - use useCallback to avoid recreation on every render
  const renameConversation = useCallback(
    async (id: string, newTitle: string) => {
      try {
        const { data, error } = await apiClient.updateConversation(id, { title: newTitle })

        if (error) {
          throw new Error(error)
        }

        // Update the conversations list
        setConversations((prev) => prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv)))

        // Update current conversation if it's the one being renamed
        setCurrentConversation((prev) => (prev?.id === id ? { ...prev, title: newTitle } : prev))

        toast({
          title: "Conversation renamed",
          description: `Renamed to "${newTitle}"`,
        })

        return data
      } catch (error) {
        console.error("Error renaming conversation:", error)
        toast({
          title: "Error",
          description: "Failed to rename conversation",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast],
  )

  // Retry connection to API
  const retryConnection = async () => {
    setApiError(null)
    setOfflineMode(false)
    setIsLoading(true)
    apiClient.disableMockMode()

    try {
      await Promise.all([fetchAgents(), fetchConversations()])
      toast({
        title: "Connection restored",
        description: "Successfully connected to the API server.",
      })
    } catch (error) {
      console.error("Error retrying connection:", error)
      toast({
        title: "Connection failed",
        description: "Still unable to connect to the API server.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If auth is loading or user is not authenticated, show loading
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Loading state for app data
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your AI chat interface...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {/* API Error Alert */}
      {apiError && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Connection Error</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{apiError}</span>
            <Button variant="outline" size="sm" onClick={retryConnection} className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Mode Indicator */}
      {offlineMode && !apiError && (
        <Alert className="m-4 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Offline Mode</AlertTitle>
          <AlertDescription className="flex justify-between items-center text-yellow-700">
            <span>Running in offline mode with limited functionality.</span>
            <Button variant="outline" size="sm" onClick={retryConnection} className="ml-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Toggle for Mobile */}
        {isMobile && (
          <button
            className="fixed top-11 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-full"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MessageSquareShare size={25} />
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 fixed md:relative z-40 w-64 h-[calc(100vh-60px)] bg-card border-r border-border shadow-lg md:shadow-none md:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            {/* Agent Selector */}
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold mb-2">Select an Agent</h2>
              <AgentSelector agents={agents} selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <Button size="sm" onClick={createConversation} disabled={!selectedAgent} variant="outline">
                  <PlusCircle size={16} className="mr-1" />
                  New
                </Button>
              </div>
              <ConversationList
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={selectConversation}
                onRenameConversation={renameConversation}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Use the enhanced chat interface */}
          <EnhancedChatInterface
            conversation={currentConversation}
            selectedAgent={selectedAgent}
            availableAgents={agents} // Pass all available agents
            offlineMode={offlineMode}
            onError={(error) => {
              console.error("Chat error:", error)
              if (!offlineMode) {
                setOfflineMode(true)
                apiClient.enableMockMode()
                toast({
                  title: "Switched to offline mode",
                  description: "Connection to the API failed. Using offline mode.",
                  variant: "destructive",
                })
              }
            }}
          />
        </div>
        <Notification
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={selectConversation}
        />
      </div>
    </div>
  )
}

