import type { Agent, Conversation, Message, User, LoginCredentials, RegisterData } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_TIMEOUT = 15000 // 15 seconds

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

interface ChatRequest {
  query: string
  agent_id?: string
  thread_id?: string
  user_id?: string
  include_history?: boolean
}

interface ChatResponse {
  response: string
  agent_id?: string
  agent_name?: string
  thread_id?: string
  confidence?: number
}

class ApiClient {
  private token: string | null = null
  private mockMode = false

  constructor() {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Try to get token from localStorage
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  enableMockMode() {
    console.log("API Client: Mock mode enabled")
    this.mockMode = true
  }

  disableMockMode() {
    console.log("API Client: Mock mode disabled")
    this.mockMode = false
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          ...(options.headers || {}),
        },
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private async request<T>(endpoint: string, method = "GET", body?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`API ${method} request to ${endpoint}`)

      // If in mock mode, return mock data
      if (this.mockMode) {
        return this.getMockResponse<T>(endpoint, method, body)
      }

      const response = await this.fetchWithTimeout(`${API_URL}${endpoint}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      })

      console.log(`API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API error response: ${errorText}`)
        return { data: null, error: `API error: ${response.status} ${errorText}` }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error(`API request error: ${error}`)
      return { data: null, error: `Request failed: ${error}` }
    }
  }

  // Mock data generator
  private getMockResponse<T>(endpoint: string, method: string, body?: any): ApiResponse<T> {
    console.log(`Generating mock response for ${method} ${endpoint}`)

    // Health check
    if (endpoint === "/health" && method === "GET") {
      return {
        data: { status: "healthy", version: "1.0.0" } as unknown as T,
        error: null,
      }
    }

    // Agents endpoints
    if (endpoint === "/agents" && method === "GET") {
      return {
        data: [
          {
            agent_id: "mock-agent-1",
            name: "General Assistant",
            prompt: "You are a helpful assistant",
            model_name: "gpt-4o",
            tools: [],
            categories: ["General"],
            keywords: ["help", "assistant"],
          },
          {
            agent_id: "mock-agent-2",
            name: "Code Helper",
            prompt: "You are a coding assistant",
            model_name: "gpt-4o",
            tools: [],
            categories: ["Programming"],
            keywords: ["code", "programming"],
          },
        ] as unknown as T,
        error: null,
      }
    }

    // Conversations endpoints
    if (endpoint.startsWith("/conversations?user_id") && method === "GET") {
      return {
        data: [
          {
            id: "mock-conv-1",
            agent_id: "mock-agent-1",
            title: "Mock Conversation 1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as unknown as T,
        error: null,
      }
    }

    if (endpoint === "/conversations" && method === "POST" && body) {
      return {
        data: {
          id: `mock-conv-${Date.now()}`,
          agent_id: body.agent_id || null,
          title: body.title || "New Conversation",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as unknown as T,
        error: null,
      }
    }

    if (endpoint.startsWith("/conversations/") && method === "GET") {
      const id = endpoint.split("/")[2]
      return {
        data: {
          id,
          agent_id: "mock-agent-1",
          title: "Mock Conversation",
          user_id: "mock-user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [
            {
              id: "mock-msg-1",
              conversation_id: id,
              role: "user",
              content: "Hello, how are you?",
              created_at: new Date().toISOString(),
            },
            {
              id: "mock-msg-2",
              conversation_id: id,
              role: "assistant",
              content: "I'm doing well, thank you for asking! How can I help you today?",
              created_at: new Date().toISOString(),
            },
          ],
        } as unknown as T,
        error: null,
      }
    }

    if (endpoint.startsWith("/conversations/") && endpoint.includes("/messages") && method === "GET") {
      const id = endpoint.split("/")[2]
      return {
        data: [
          {
            id: "mock-msg-1",
            conversation_id: id,
            role: "user",
            content: "Hello, how are you?",
            created_at: new Date().toISOString(),
          },
          {
            id: "mock-msg-2",
            conversation_id: id,
            role: "assistant",
            content: "I'm doing well, thank you for asking! How can I help you today?",
            created_at: new Date().toISOString(),
          },
        ] as unknown as T,
        error: null,
      }
    }

    // Chat endpoint
    if (endpoint === "/chat" && method === "POST") {
      return {
        data: {
          response: "This is a mock response from the AI assistant.",
          agent_id: body?.agent_id || "mock-agent-1",
          agent_name: "Mock Agent",
          thread_id: body?.thread_id || `mock-thread-${Date.now()}`,
          confidence: 1.0,
        } as unknown as T,
        error: null,
      }
    }

    // Auth endpoints
    if (endpoint === "/auth/login" && method === "POST") {
      return {
        data: {
          user: {
            id: "mock-user-1",
            username: body?.username || "mockuser",
            email: "mock@example.com",
            isAuthenticated: true,
          },
          token: "mock-token-12345",
        } as unknown as T,
        error: null,
      }
    }

    if (endpoint === "/auth/register" && method === "POST") {
      return {
        data: {
          user: {
            id: "mock-user-1",
            username: body?.username || "mockuser",
            email: body?.email || "mock@example.com",
            isAuthenticated: true,
          },
          token: "mock-token-12345",
        } as unknown as T,
        error: null,
      }
    }

    // Add this to the getMockResponse method for document endpoints
    if (endpoint === "/documents" && method === "GET") {
      return {
        data: [
          {
            id: "doc-1",
            title: "Company Policies",
            content: "This document outlines the company policies...",
            category: "knowledge",
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "doc-2",
            title: "Product Documentation",
            content: "User guide for our main product...",
            category: "reference",
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "doc-3",
            title: "Coding Standards",
            content: "Our team's coding standards and best practices...",
            category: "instructions",
            created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ] as unknown as T,
        error: null,
      }
    }

    // Default fallback
    return {
      data: null,
      error: "No mock data available for this endpoint",
    }
  }

  // API Methods
  async getHealth(): Promise<ApiResponse<any>> {
    return this.request("/health")
  }

  // Agent methods
  async getAgents(): Promise<ApiResponse<Agent[]>> {
    return this.request<Agent[]>("/agents")
  }

  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    return this.request<Agent>(`/agents/${id}`)
  }

  async createAgent(agentData: {
    agent_id?: string
    name: string
    prompt: string
    model_name: string
    tools?: any[]
    categories?: string[]
    keywords?: string[]
  }): Promise<ApiResponse<Agent>> {
    return this.request<Agent>("/agent", "POST", agentData)
  }

  async updateAgent(id: string, data: Partial<Agent>): Promise<ApiResponse<Agent>> {
    return this.request<Agent>(`/agents/${id}`, "PATCH", data)
  }

  // Conversation methods
  async getConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    return this.request<Conversation[]>(`/conversations?user_id=${userId}`)
  }

  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${id}`)
  }

  async createConversation(data: { agent_id?: string; title?: string; user_id?: string }): Promise<
    ApiResponse<Conversation>
  > {
    return this.request<Conversation>("/conversations", "POST", data)
  }

  async updateConversation(id: string, data: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${id}`, "PATCH", data)
  }

  // Message methods
  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(`/conversations/${conversationId}/messages`)
  }

  async sendMessage(conversationId: string, content: string): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/conversations/${conversationId}/messages`, "POST", { role: "user", content })
  }

  // Chat method
  async chat(data: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>("/chat", "POST", data)
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>("/auth/login", "POST", credentials)
    if (response.data?.token) {
      this.setToken(response.data.token)
    }
    return response
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>("/auth/register", "POST", data)
    if (response.data?.token) {
      this.setToken(response.data.token)
    }
    return response
  }

  async logout(): Promise<void> {
    this.clearToken()
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.token) {
      return { data: null, error: "Not authenticated" }
    }
    return this.request<User>("/auth/me")
  }

  // Add these methods to the ApiClient class
  async getDocuments(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/documents")
  }

  async getDocument(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/documents/${id}`)
  }

  async createDocument(documentData: {
    title: string
    content: string
    category?: string
    metadata?: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return this.request<any>("/documents", "POST", documentData)
  }

  async updateDocument(id: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request<any>(`/documents/${id}`, "PATCH", data)
  }

  async deleteDocument(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/documents/${id}`, "DELETE")
  }

  async authenticateWithAuth0(data: {
    auth0Id: string
    email: string
    name: string
    picture: string
    token: string
  }): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/auth0", "POST", data)
  }
}

// Create a singleton instance
const apiClient = new ApiClient()

export default apiClient

