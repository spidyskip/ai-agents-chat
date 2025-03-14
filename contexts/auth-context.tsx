"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, LoginCredentials, RegisterData } from "@/lib/types"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await apiClient.getCurrentUser()
        if (data) {
          setUser(data)
        } else {
          // If we're in development, create a mock user
          if (process.env.NODE_ENV === "development") {
            setUser({
              id: "mock-user",
              username: "Developer",
              email: "dev@example.com",
              isAuthenticated: true,
            })
            apiClient.enableMockMode()
          } else {
            setUser({
              id: "mock-user",
              username: "Developer",
              email: "dev@example.com",
              isAuthenticated: false,
            })
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    try {
      const { data, error } = await apiClient.login(credentials)

      if (error || !data) {
        toast({
          title: "Login failed",
          description: error || "An unknown error occurred",
          variant: "destructive",
        })
        return false
      }

      setUser(data.user)
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      })
      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await apiClient.register(data)

      if (response.error || !response.data) {
        toast({
          title: "Registration failed",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        })
        return false
      }

      setUser(response.data.user)
      toast({
        title: "Registration successful",
        description: `Welcome, ${response.data.user.username}!`,
      })
      return true
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

