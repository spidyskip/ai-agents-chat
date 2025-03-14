"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("account")
  const [isSaving, setIsSaving] = useState(false)

  // Account settings
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")

  // API settings
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  const [useOfflineMode, setUseOfflineMode] = useState(false)

  // Appearance settings
  const [darkMode, setDarkMode] = useState(false)

  // Redirect to auth page if not logged in
  if (!authLoading && !user) {
    router.push("/auth")
    return null
  }

  const handleSaveAccount = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Account updated",
        description: "Your account settings have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveApi = async () => {
    setIsSaving(true)
    try {
      // Save API URL to localStorage
      localStorage.setItem("api_url", apiUrl)
      localStorage.setItem("use_offline_mode", useOfflineMode.toString())

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "API settings updated",
        description: "Your API settings have been saved. You may need to refresh the page for changes to take effect.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update API settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAppearance = async () => {
    setIsSaving(true)
    try {
      // Save appearance settings to localStorage
      localStorage.setItem("theme", darkMode ? "dark" : "light")

      // Apply theme
      document.documentElement.classList.toggle("dark", darkMode)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Appearance updated",
        description: "Your appearance settings have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appearance settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAccount} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>Configure API connection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input
                    id="api-url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                  />
                  <p className="text-sm text-muted-foreground">The base URL for the backend API</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="offline-mode" checked={useOfflineMode} onCheckedChange={setUseOfflineMode} />
                  <Label htmlFor="offline-mode">Enable offline mode</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, the application will use mock data if the API is unavailable
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveApi} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                  <Label htmlFor="dark-mode">Dark mode</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for a more comfortable viewing experience in low light
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAppearance} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

