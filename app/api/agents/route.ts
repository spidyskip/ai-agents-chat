import { NextResponse } from "next/server"

// Get API URL from environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET() {
  console.log(`Attempting to fetch agents from: ${API_URL}/agents`)

  try {
    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${API_URL}/agents`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)

    console.log(`Agents API response status: ${response.status}`)

    if (!response.ok) {
      // Log the error response
      const errorText = await response.text()
      console.error(`API error response: ${errorText}`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 0} agents`)

    // Ensure we always return an array
    const agents = Array.isArray(data) ? data : []

    return NextResponse.json(agents)
  } catch (error) {
    console.error("Error fetching agents:", error)

    // Return mock data in development for testing
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock agent data for development")
      return NextResponse.json([
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
      ])
    }

    // Return an empty array in production
    return NextResponse.json([])
  }
}

