'use client';

import { useState, useEffect } from 'react';
import { File, Upload, Trash2, Search, FileText, Loader2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    category: 'general',
  });
  const { toast } = useToast();

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiClient.getDocuments();
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.title || !newDocument.content) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const { data, error } = await apiClient.createDocument({
        title: newDocument.title,
        content: newDocument.content,
        category: newDocument.category,
      });
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setDocuments(prev => [...prev, data]);
        setNewDocument({
          title: '',
          content: '',
          category: 'general',
        });
        setShowAddDialog(false);
        
        toast({
          title: 'Document Added',
          description: 'Document has been successfully added',
        });
      }
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: 'Error',
        description: 'Failed to add document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await apiClient.deleteDocument(id);
      
      if (error) {
        throw new Error(error);
      }
      
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: 'Document Deleted',
        description: 'Document has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Read file content
      const content = await readFileContent(file);
      
      // Create document with file content
      const { data, error } = await apiClient.createDocument({
        title: file.name,
        content,
        category: 'uploaded',
      });
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setDocuments(prev => [...prev, data]);
        
        toast({
          title: 'File Uploaded',
          description: 'File has been successfully uploaded and converted to a document',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            Upload, create, and manage documents for your AI agents to use
          </CardDescription>
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
                    <DialogDescription>
                      Add a new document that can be used by AI agents
                    </DialogDescription>
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
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="knowledge">Knowledge Base</SelectItem>
                          <SelectItem value="instructions">Instructions</SelectItem>
                          <SelectItem value="reference">Reference</SelectItem>
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
              
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json,.csv"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
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
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(doc.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No documents match your search' : 'No documents found. Add your first document to get started.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
