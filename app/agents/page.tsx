"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import AgentDocumentReferences from "@/components/agent-document-references"
import type { Agent } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AgentsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    model_name: "gpt-4o",
    categories: "",
    keywords: "",
  })

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await apiClient.getAgents()
        if (error) {
          throw new Error(error)
        }
        if (data) {
          setAgents(data)
        }
      } catch (error) {
        console.error("Error fetching agents:", error)
        toast({
          title: "Error",
          description: "Failed to fetch agents. Using mock data.",
          variant: "destructive",
        })

        // Use mock data if API fails
        apiClient.enableMockMode()
        const { data } = await apiClient.getAgents()
        if (data) {
          setAgents(data)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [toast])

  const handleCreateAgent = async () => {
    setIsCreating(true)
    try {
      const { data, error } = await apiClient.createAgent({
        name: formData.name,
        prompt: formData.prompt,
        model_name: formData.model_name,
        categories: formData.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        tools: [],
      })

      if (error) {
        throw new Error(error)
      }

      if (data) {
        setAgents((prev) => [...prev, data])
        toast({
          title: "Agent created",
          description: `Agent "${data.name}" has been created successfully.`,
        })

        // Reset form
        setFormData({
          name: "",
          prompt: "",
          model_name: "gpt-4o",
          categories: "",
          keywords: "",
        })
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      toast({
        title: "Error",
        description: "Failed to create agent.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return

    setIsEditing(true)
    try {
      const { data, error } = await apiClient.updateAgent(selectedAgent.agent_id, {
        name: formData.name,
        prompt: formData.prompt,
        model_name: formData.model_name,
        categories: formData.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      })

      if (error) {
        throw new Error(error)
      }

      if (data) {
        setAgents((prev) => prev.map((agent) => (agent.agent_id === selectedAgent.agent_id ? data : agent)))

        toast({
          title: "Agent updated",
          description: `Agent "${data.name}" has been updated successfully.`,
        })

        // Reset form and selected agent
        setSelectedAgent(null)
        setFormData({
          name: "",
          prompt: "",
          model_name: "gpt-4o",
          categories: "",
          keywords: "",
        })
      }
    } catch (error) {
      console.error("Error updating agent:", error)
      toast({
        title: "Error",
        description: "Failed to update agent.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleEditClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setFormData({
      name: agent.name,
      prompt: agent.prompt,
      model_name: agent.model_name,
      categories: agent.categories?.join(", ") || "",
      keywords: agent.keywords?.join(", ") || "",
    })
    setActiveTab("details")
  }

  const handleAgentUpdate = (updatedAgent: Agent) => {
    setAgents((prev) => prev.map((agent) => (agent.agent_id === updatedAgent.agent_id ? updatedAgent : agent)))
    setSelectedAgent(updatedAgent)
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const { error } = await apiClient.deleteAgent(agentId)

      if (error) {
        throw new Error(error)
      }

      // Remove the agent from the list
      setAgents((prev) => prev.filter((agent) => agent.agent_id !== agentId))

      // If the deleted agent is the selected one, clear it
      if (selectedAgent?.agent_id === agentId) {
        setSelectedAgent(null)
      }

      toast({
        title: "Agent deleted",
        description: "The agent has been permanently deleted.",
      })
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast({
        title: "Error",
        description: "Failed to delete agent.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Agent Management</h1>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>Create a new AI agent with custom capabilities.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    Model
                  </Label>
                  <Select
                    value={formData.model_name}
                    onValueChange={(value) => setFormData({ ...formData, model_name: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categories" className="text-right">
                    Categories
                  </Label>
                  <Input
                    id="categories"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    placeholder="General, Programming, etc. (comma separated)"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="keywords" className="text-right">
                    Keywords
                  </Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="help, code, etc. (comma separated)"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="prompt" className="text-right">
                    Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Enter the system prompt for this agent"
                    className="col-span-3"
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateAgent} disabled={isCreating}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Agent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Agents</CardTitle>
            <CardDescription>Manage your AI agents and their capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.agent_id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell>{agent.model_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.categories?.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {agent.document_refs ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(agent.document_refs).map(([category, docIds]) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className="bg-blue-50 text-blue-800 border-blue-200"
                            >
                              {category}: {docIds.includes("*") ? "All" : docIds.length}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(agent)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                              <DialogTitle>Edit Agent: {agent.name}</DialogTitle>
                              <DialogDescription>
                                Update the agent's configuration and document references.
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Agent Details</TabsTrigger>
                                <TabsTrigger value="documents">Document References</TabsTrigger>
                              </TabsList>

                              <TabsContent value="details" className="mt-4">
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">
                                      Name
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-model" className="text-right">
                                      Model
                                    </Label>
                                    <Select
                                      value={formData.model_name}
                                      onValueChange={(value) => setFormData({ ...formData, model_name: value })}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a model" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-categories" className="text-right">
                                      Categories
                                    </Label>
                                    <Input
                                      id="edit-categories"
                                      value={formData.categories}
                                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                                      placeholder="General, Programming, etc. (comma separated)"
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-keywords" className="text-right">
                                      Keywords
                                    </Label>
                                    <Input
                                      id="edit-keywords"
                                      value={formData.keywords}
                                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                      placeholder="help, code, etc. (comma separated)"
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="edit-prompt" className="text-right">
                                      Prompt
                                    </Label>
                                    <Textarea
                                      id="edit-prompt"
                                      value={formData.prompt}
                                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                      placeholder="Enter the system prompt for this agent"
                                      className="col-span-3"
                                      rows={5}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button type="submit" onClick={handleUpdateAgent} disabled={isEditing}>
                                    {isEditing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Update Agent
                                  </Button>
                                </div>
                              </TabsContent>

                              <TabsContent value="documents" className="mt-4">
                                {selectedAgent && (
                                  <AgentDocumentReferences agent={selectedAgent} onUpdate={handleAgentUpdate} />
                                )}
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the agent "{agent.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAgent(agent.agent_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No agents found. Create your first agent to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

