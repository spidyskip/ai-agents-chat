export interface Agent {
  agent_id: string
  name: string
  prompt: string
  model_name: string
  tools?: any[]
  categories?: string[]
  keywords?: string[]
  additional_query?: any
  document_refs?: any
}

export interface Conversation {
  id: string
  agent_id: string
  user_id?: string
  title: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  role: "user" | "assistant" | "system" // Include system role but filter it out in UI
  content: string
  created_at: string
  user_id?: string
  user_info?: Record<string, any>
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  isAuthenticated: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme?: string
  language?: string
  notifications?: boolean
  [key: string]: any
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  email: string
}

export interface ChatRequest {
  query: string
  agent_id?: string
  thread_id?: string
  user_id?: string
  user_info?: Record<string, any>
  additional_prompts?: Record<string, any>
  include_history?: boolean
  include_documents?: boolean
}

export interface ChatResponse {
  response: string
  agent_id: string
  agent_name: string
  thread_id: string
  confidence: number
}

