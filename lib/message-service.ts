import type { Message, User, ChatRequest, Agent } from "./types"
import apiClient from "./api-client"

class MessageService {
  /**
   * Send a message to the chat API
   */
  async sendMessage(content: string, conversationId: string, agentId: string, user: User): Promise<Message | null> {
    try {
      // Prepare user info from user object
      const userInfo = {
        username: user.username,
        preferences: user.preferences || {},
      }

      // Create chat request with user ID automatically included
      const chatRequest: ChatRequest = {
        query: content,
        agent_id: agentId,
        thread_id: conversationId,
        user_id: user.id, // Automatically use the logged-in user's ID
        user_info: userInfo,
        include_history: true,
        include_documents: true,
      }

      // Send the request to the API
      const { data, error } = await apiClient.chat(chatRequest)

      if (error || !data) {
        console.error("Error sending message:", error)
        return null
      }

      // Create user message with user ID automatically included
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        conversation_id: conversationId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
        user_id: user.id, // Automatically use the logged-in user's ID
        user_info: userInfo,
      }

      // Create assistant message from response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversation_id: conversationId,
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      }

      // Store messages in the conversation
      await this.storeMessage(userMessage)
      await this.storeMessage(assistantMessage)

      return assistantMessage
    } catch (error) {
      console.error("Error in sendMessage:", error)
      return null
    }
  }

  /**
   * Send a message to a specific agent
   */
  async sendMessageToAgent(content: string, conversationId: string, agent: Agent, user: User): Promise<Message | null> {
    return this.sendMessage(content, conversationId, agent.agent_id, user)
  }

  /**
   * Store a message in the database
   */
  async storeMessage(message: Message): Promise<boolean> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just simulate success
      console.log("Storing message:", message)
      return true
    } catch (error) {
      console.error("Error storing message:", error)
      return false
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await apiClient.getMessages(conversationId)

      if (error || !data) {
        console.error("Error fetching messages:", error)
        return []
      }

      // Filter out system messages
      return data.filter((message) => message.role !== "system")
    } catch (error) {
      console.error("Error in getMessages:", error)
      return []
    }
  }

  /**
   * Format messages for display
   */
  formatMessagesForDisplay(messages: Message[]): Message[] {
    // Filter out system messages and sort by creation time
    return messages
      .filter((message) => message.role !== "system")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }
}

// Create a singleton instance
const messageService = new MessageService()
export default messageService

