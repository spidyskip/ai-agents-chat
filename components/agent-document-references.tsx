"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Loader2, Save, Filter } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"
import type { Agent } from "@/lib/types"

interface Document {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
}

interface AgentDocumentReferencesProps {
  agent: Agent
  onUpdate?: (agent: Agent) => void
}

export default function AgentDocumentReferences({ agent, onUpdate }: AgentDocumentReferencesProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Extract document references from agent metadata
  const documentRefs = agent.document_refs || {}

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments()
  }, [])

  // Initialize selected documents based on agent's document_refs
  useEffect(() => {
    const initialSelection: Record<string, boolean> = {}

    documents.forEach((doc) => {
      // Check if this document's category exists in document_refs
      if (documentRefs[doc.category]) {
        // Check if this document is referenced (either by specific ID or wildcard)
        const isSelected = documentRefs[doc.category].includes(doc.id) || documentRefs[doc.category].includes("*")

        if (isSelected) {
          initialSelection[doc.id] = true
        }
      }
    })

    setSelectedDocuments(initialSelection)
  }, [documents, documentRefs])

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await apiClient.getDocuments()

      if (error) {
        throw new Error(error)
      }

      if (data) {
        setDocuments(data)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((doc) => doc.category)))
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDocumentReferences = async () => {
    setIsSaving(true)

    try {
      // Organize selected documents by category
      const newDocumentRefs: Record<string, string[]> = {}

      // First, identify categories with all documents selected
      const categoryCounts: Record<string, { total: number; selected: number }> = {}

      // Count total documents per category
      documents.forEach((doc) => {
        if (!categoryCounts[doc.category]) {
          categoryCounts[doc.category] = { total: 0, selected: 0 }
        }
        categoryCounts[doc.category].total += 1
      })

      // Count selected documents per category
      documents.forEach((doc) => {
        if (selectedDocuments[doc.id]) {
          if (!categoryCounts[doc.category]) {
            categoryCounts[doc.category] = { total: 0, selected: 0 }
          }
          categoryCounts[doc.category].selected += 1
        }
      })

      // Create the document_refs object
      Object.entries(categoryCounts).forEach(([category, counts]) => {
        if (counts.selected > 0) {
          // If all documents in a category are selected, use wildcard
          if (counts.selected === counts.total) {
            newDocumentRefs[category] = ["*"]
          } else {
            // Otherwise, list specific document IDs
            newDocumentRefs[category] = documents
              .filter((doc) => doc.category === category && selectedDocuments[doc.id])
              .map((doc) => doc.id)
          }
        }
      })

      // Update the agent with new document references
      const updatedAgent = {
        ...agent,
        document_refs: newDocumentRefs,
      }

      // Call API to update agent
      const { data, error } = await apiClient.updateAgent(agent.agent_id, {
        document_refs: newDocumentRefs,
      })

      if (error) {
        throw new Error(error)
      }

      if (onUpdate && data) {
        onUpdate(data)
      }

      toast({
        title: "Document references updated",
        description: "The agent will now use the selected documents for context.",
      })
    } catch (error) {
      console.error("Error updating document references:", error)
      toast({
        title: "Error",
        description: "Failed to update document references",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle selection of a document
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }))
  }

  // Toggle selection of all documents in a category
  const toggleCategorySelection = (category: string, selected: boolean) => {
    const newSelection = { ...selectedDocuments }

    documents
      .filter((doc) => doc.category === category)
      .forEach((doc) => {
        newSelection[doc.id] = selected
      })

    setSelectedDocuments(newSelection)
  }

  // Toggle selection of all visible documents
  const toggleAllVisible = (selected: boolean) => {
    const newSelection = { ...selectedDocuments }

    filteredDocuments.forEach((doc) => {
      newSelection[doc.id] = selected
    })

    setSelectedDocuments(newSelection)
  }

  // Filter documents based on search query and selected category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get count of selected documents
  const selectedCount = Object.values(selectedDocuments).filter(Boolean).length

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "work":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "personal":
        return "bg-green-100 text-green-800 border-green-200"
      case "research":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "notes":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "knowledge":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "instructions":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "reference":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document References</CardTitle>
        <CardDescription>Select documents that this agent can access for additional context</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category selection section */}
        {categories.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Quick Category Selection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => {
                const docsInCategory = documents.filter((doc) => doc.category === category)
                const selectedInCategory = docsInCategory.filter((doc) => selectedDocuments[doc.id]).length
                const allSelected = selectedInCategory === docsInCategory.length && docsInCategory.length > 0
                const someSelected = selectedInCategory > 0 && selectedInCategory < docsInCategory.length

                return (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Checkbox
                        id={`category-${category}`}
                        checked={allSelected}
                        indeterminate={someSelected}
                        onCheckedChange={(checked) => toggleCategorySelection(category, !!checked)}
                      />
                      <Label htmlFor={`category-${category}`} className="flex items-center overflow-hidden">
                        <Badge variant="outline" className={`mr-2 ${getCategoryColor(category)} whitespace-nowrap`}>
                          {category}
                        </Badge>
                        <span className="truncate">
                          {docsInCategory.length} doc{docsInCategory.length !== 1 ? "s" : ""}
                        </span>
                      </Label>
                    </div>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {selectedInCategory}/{docsInCategory.length}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Category selection section */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Checkbox
                        checked={!!selectedDocuments[doc.id]}
                        onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{doc.title}</span>
                      </div>
                      {/* Show category on mobile only */}
                      <div className="sm:hidden mt-1">
                        <Badge variant="outline" className={getCategoryColor(doc.category)}>
                          {doc.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className={getCategoryColor(doc.category)}>
                        {doc.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(doc.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || selectedCategory !== "all"
              ? "No documents match your search criteria"
              : "No documents found. Add documents in the document management section."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
