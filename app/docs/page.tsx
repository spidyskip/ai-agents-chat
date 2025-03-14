"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Interface</CardTitle>
              <CardDescription>An overview of the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The AI Chat Interface is a powerful platform that allows you to interact with multiple AI agents, each
                specialized in different domains. You can create conversations, ask questions, and get intelligent
                responses tailored to your needs.
              </p>
              <h3 className="text-lg font-semibold mt-4">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Multiple specialized AI agents</li>
                <li>Conversation management</li>
                <li>Real-time messaging</li>
                <li>Conversation history</li>
                <li>Export functionality</li>
                <li>Responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Agents</CardTitle>
              <CardDescription>Understanding the different AI agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Agents are specialized AI assistants configured for specific tasks or domains. Each agent has its own
                personality, knowledge base, and capabilities.
              </p>
              <h3 className="text-lg font-semibold mt-4">Agent Properties</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Name:</strong> The identifier for the agent
                </li>
                <li>
                  <strong>Prompt:</strong> The system instructions that define the agent's behavior
                </li>
                <li>
                  <strong>Model:</strong> The underlying AI model used by the agent
                </li>
                <li>
                  <strong>Tools:</strong> Special capabilities the agent can use
                </li>
                <li>
                  <strong>Categories:</strong> The domains the agent specializes in
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Managing your conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Conversations allow you to interact with agents and keep track of your discussions. Each conversation is
                tied to a specific agent and contains a history of messages.
              </p>
              <h3 className="text-lg font-semibold mt-4">Conversation Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Create:</strong> Start a new conversation with any available agent
                </li>
                <li>
                  <strong>Rename:</strong> Change the title of your conversations for better organization
                </li>
                <li>
                  <strong>History:</strong> Access your complete message history
                </li>
                <li>
                  <strong>Export:</strong> Download your conversations as JSON files
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
              <CardDescription>Technical details for developers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The AI Chat Interface is powered by a RESTful API that provides access to all functionality. Developers
                can integrate with this API to build custom applications.
              </p>
              <h3 className="text-lg font-semibold mt-4">Key Endpoints</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">GET /agents</h4>
                  <p className="text-sm text-muted-foreground">List all available agents</p>
                </div>
                <div>
                  <h4 className="font-medium">POST /agent</h4>
                  <p className="text-sm text-muted-foreground">Create a new agent</p>
                </div>
                <div>
                  <h4 className="font-medium">POST /chat</h4>
                  <p className="text-sm text-muted-foreground">Send a message to an agent and get a response</p>
                </div>
                <div>
                  <h4 className="font-medium">GET /conversations</h4>
                  <p className="text-sm text-muted-foreground">List all conversations</p>
                </div>
                <div>
                  <h4 className="font-medium">GET /conversations/{"{id}"}</h4>
                  <p className="text-sm text-muted-foreground">Get a specific conversation with messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

