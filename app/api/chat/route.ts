import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const maxDuration = 30

export async function POST(req: Request) {
  console.log("Chat API request received")

  try {
    const { messages, agent_id, thread_id } = await req.json()

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1]
    console.log(`Processing chat message: "${lastUserMessage.content.substring(0, 50)}..."`)

    // Prepare the request to the backend API
    const apiRequest = {
      query: lastUserMessage.content,
      agent_id: agent_id,
      thread_id: thread_id,
      include_history: true,
    }

    // If we have a backend API and it's enabled, use it
    if (process.env.USE_BACKEND_API === "true") {
      console.log(`Sending chat request to backend: ${API_URL}/chat`)

      try {
        // Add timeout to the fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(apiRequest),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log(`Chat API response status: ${response.status}`)

        if (!response.ok) {
          // Log the error response
          const errorText = await response.text()
          console.error(`API error response: ${errorText}`)
          throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Successfully received chat response from backend")

        // Use AI SDK to stream the response
        const result = streamText({
          model: openai("gpt-4o"),
          messages: [
            ...messages.slice(0, -1),
            {
              role: "user",
              content: lastUserMessage.content,
            },
            {
              role: "assistant",
              content: data.response,
            },
          ],
        })

        return result.toDataStreamResponse()
      } catch (error) {
        console.error("Error using backend API for chat:", error)
        console.log("Falling back to direct OpenAI")

        // Fall back to direct OpenAI
        const result = streamText({
          model: openai("gpt-4o"),
          messages,
        })

        return result.toDataStreamResponse()
      }
    }
    // Use direct OpenAI if backend is not enabled
    else {
      console.log("Using direct OpenAI for chat (backend API not enabled)")
      const result = streamText({
        model: openai("gpt-4o"),
        messages,
      })

      return result.toDataStreamResponse()
    }
  } catch (error) {
    console.error("Error in chat route:", error)

    // Fallback to direct OpenAI if there's an error
    try {
      const { messages } = await req.json()

      console.log("Falling back to direct OpenAI due to error")
      const result = streamText({
        model: openai("gpt-4o"),
        messages,
      })

      return result.toDataStreamResponse()
    } catch (fallbackError) {
      console.error("Error in fallback chat handling:", fallbackError)

      // If all else fails, return a simple error message
      return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
}

