export interface Agent {
  agent_id: string
  name: string
  prompt: string
  model_name: string
  tools?: any[]
  categories?: string[]
  keywords?: string[]
  additional_query?: any
  document_refs?: Record<string, string[]>
}

export interface Conversation {
  id: string
  agent_id: string
  title: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
  user_id?: string
  name?: string
  agent_id?: string
  user_info?: {
    username?: string
    avatar?: string
  }
}

export interface LoginCredentials {
  username?: string
  password?: string
}

export interface RegisterData {
  username?: string
  email?: string
  password?: string
}

export interface ChatRequest {
  query: string
  agent_id?: string
  name?: string
  thread_id?: string
  user_id?: string
  user_info?: {
    username?: string
    preferences?: any
  }
  include_history?: boolean
  include_documents?: boolean
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  isAuthenticated: boolean
  preferences?: {
    theme?: string
    language?: string
    emailNotifications?: boolean
    pushNotifications?: boolean
    messageNotifications?: boolean
    twoFactorEnabled?: boolean
    sessionTimeout?: string
  }
  fullName?: string
  bio?: string
  location?: string
  website?: string
  auth0Id?: string
}

