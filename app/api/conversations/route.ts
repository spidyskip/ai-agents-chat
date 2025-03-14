import { NextResponse } from "next/server"

// Get API URL from environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET() {
  console.log(`Attempting to fetch conversations from: ${API_URL}/conversations`)

  try {
    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${API_URL}/conversations`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    clearTimeout(timeoutId)

    console.log(`Conversations API response status: ${response.status}`)

    if (!response.ok) {
      // Log the error response
      const errorText = await response.text()
      console.error(`API error response: ${errorText}`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 0} conversations`)

    // Ensure we always return an array
    const conversations = Array.isArray(data) ? data : []

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)

    // Return mock data in development for testing
    if (process.env.NODE_ENV === "development") {
      console.log("Returning mock conversation data for development")
      return NextResponse.json([
        {
          id: "mock-conv-1",
          agent_id: "mock-agent-1",
          title: "Mock Conversation 1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [],
        },
      ])
    }

    // Return an empty array in production
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  console.log(`Attempting to create conversation at: ${API_URL}/conversations`)

  try {
    const body = await request.json()
    console.log("Create conversation request body:", body)

    // In development, return mock data if API is not available
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
      console.log("Returning mock response for conversation creation")
      return NextResponse.json({
        id: `mock-conv-${Date.now()}`,
        agent_id: body.agent_id,
        title: body.title || "New Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      })
    }

    // Add timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log(`Create conversation API response status: ${response.status}`)

    if (!response.ok) {
      // Log the error response
      const errorText = await response.text()
      console.error(`API error response: ${errorText}`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating conversation:", error)

    // In development, return mock data if there's an error
    if (process.env.NODE_ENV === "development") {
      const body = await request.json().catch(() => ({}))
      return NextResponse.json({
        id: `mock-conv-${Date.now()}`,
        agent_id: body.agent_id || "mock-agent-1",
        title: body.title || "New Conversation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      })
    }

    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}

