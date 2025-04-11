"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Upload, FolderPlus, Trash2, Eye, Edit, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"

interface Document {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
  user_id: string
}

interface DocumentsTabProps {
  user: User
}

export default function DocumentsTab({ user }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    category: "general",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch user's documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API
        // const { data, error } = await apiClient.getUserDocuments(user.id);

        // For demo purposes, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mockDocuments: Document[] = [
          {
            id: "1",
            title: "Project Requirements",
            content: "This document outlines the requirements for the new project...",
            category: "work",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: user.id,
          },
          {
            id: "2",
            title: "Meeting Notes",
            content: "Notes from the team meeting on product strategy...",
            category: "notes",
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: user.id,
          },
          {
            id: "3",
            title: "Research Paper",
            content: "Abstract: This research explores the impact of AI on modern workflows...",
            category: "research",
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: user.id,
          },
          {
            id: "4",
            title: "Personal Notes",
            content: "Ideas for weekend projects and personal goals...",
            category: "personal",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: user.id,
          },
        ]

        setDocuments(mockDocuments)
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

    fetchDocuments()
  }, [user.id, toast])

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would call your API
      // const { data, error } = await apiClient.createDocument({
      //   ...newDocument,
      //   user_id: user.id,
      // });

      // For demo purposes, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newDoc: Document = {
        id: `new-${Date.now()}`,
        title: newDocument.title,
        content: newDocument.content,
        category: newDocument.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      }

      setDocuments((prev) => [newDoc, ...prev])
      setNewDocument({
        title: "",
        content: "",
        category: "general",
      })
      setShowAddDialog(false)

      toast({
        title: "Document Added",
        description: "Your document has been successfully added",
      })
    } catch (error) {
      console.error("Error adding document:", error)
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      // In a real app, you would call your API
      // const { error } = await apiClient.deleteDocument(id);

      // For demo purposes, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setDocuments((prev) => prev.filter((doc) => doc.id !== id))

      toast({
        title: "Document Deleted",
        description: "Your document has been successfully deleted",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setShowViewDialog(true)
  }

  // Filter documents based on search query
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Documents</CardTitle>
        <CardDescription>Manage your documents and knowledge base</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                  <DialogDescription>Add a new document to your collection</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newDocument.title}
                      onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input
                      id="category"
                      value={newDocument.category}
                      onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                      className="col-span-3"
                      placeholder="e.g., work, personal, research"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="content" className="text-right">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      value={newDocument.content}
                      onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                      placeholder="Enter document content"
                      className="col-span-3"
                      rows={10}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleAddDocument} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Document
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-primary" />
                      {doc.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(doc.category)}>
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>{formatDate(doc.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery
              ? "No documents match your search"
              : "No documents found. Create your first document to get started."}
          </div>
        )}

        {/* Document View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            {selectedDocument && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle>{selectedDocument.title}</DialogTitle>
                    <Badge variant="outline" className={getCategoryColor(selectedDocument.category)}>
                      {selectedDocument.category}
                    </Badge>
                  </div>
                  <DialogDescription>
                    Created: {formatDate(selectedDocument.created_at)} • Last updated:{" "}
                    {formatDate(selectedDocument.updated_at)}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 border rounded-md p-4 bg-muted/30">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{selectedDocument.content}</pre>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}