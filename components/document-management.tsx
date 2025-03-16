"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { FileText, Upload, Trash2, Search, Loader2, FolderPlus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/lib/api-client"

interface Document {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    category: "general",
  })
  const [uploadCategory, setUploadCategory] = useState("general")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch documents and categories on component mount
  useEffect(() => {
    fetchCategories()
    fetchDocuments()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getDocumentsCategories()
      if (response.error) {
        throw new Error(response.error)

      }
      setCategories(response.data.categories || [])

      // Set default category if available
      if (response.data?.length > 0 && !newDocument.category) {
        setNewDocument((prev) => ({ ...prev, category: response.data[0] }))
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Use default categories if API fails
      const defaultCategories = ["general", "knowledge", "instructions", "reference"]
      setCategories(defaultCategories)
    }
  }

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getDocuments()
      if (response.error) {
        throw new Error(response.error)

      }
      setDocuments(response.data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
      // Set empty documents array if API fails
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.content || !newDocument.category) {
      toast({
        title: "Validation Error",
        description: "Title, content, and category are required",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const response = await apiClient.createDocument({
            title: newDocument.title,
            content: newDocument.content,
      })

      if (!response.ok) {
        throw new Error(`Failed to add document: ${response.status}`)
      }

      const data = await response.json()
      setDocuments((prev) => [data, ...prev])

      setNewDocument({
        title: "",
        content: "",
        category: newDocument.category, // Keep the same category for next document
      })

      setShowAddDialog(false)

      toast({
        title: "Document Added",
        description: "Document has been successfully added",
      })
    } catch (error) {
      console.error("Error adding document:", error)
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (document: Document) => {
    try {
      const response = await apiClient.deleteDocument(document.id)
      if (response.error) {
        throw new Error(response.error)
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== document.id))

      toast({
        title: "Document Deleted",
        description: "Document has been successfully deleted",
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Read file content
      const content = await readFileContent(file)

      // Create document with file content
      const response = await apiClient.createDocument({
        title: file.name,
        content,
        category: uploadCategory || "general",
      })

      if (response.error) {
        throw new Error(response.error)
      }

      setDocuments((prev) => [response.data, ...prev])

      toast({
        title: "File Uploaded",
        description: "File has been successfully uploaded and converted to a document",
      })

      setShowUploadDialog(false)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        resolve(event.target?.result as string)
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsText(file)
    })
  }

  // Filter documents based on search query and selected category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory

    return matchesSearch && matchesCategory
  })

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
      case "general":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Upload, create, and manage documents for your AI agents to use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
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

              {/* Create document button */}
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Create Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                    <DialogDescription>Add a new document that can be used by AI agents</DialogDescription>
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
                      <Select
                        value={newDocument.category}
                        onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="knowledge">Knowledge Base</SelectItem>
                              <SelectItem value="instructions">Instructions</SelectItem>
                              <SelectItem value="reference">Reference</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
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
                    <Button type="submit" onClick={handleAddDocument} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Document
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Upload file button with category selection */}
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>Upload a file and select a category for it</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="upload-category" className="text-right">
                        Category
                      </Label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file-upload" className="text-right">
                        File
                      </Label>
                      <Input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        accept=".txt,.md,.json,.csv"
                        className="col-span-3"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? "No documents match your search criteria"
                : "No documents found. Add your first document to get started."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

