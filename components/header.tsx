"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, FileText, User, LogOut, Settings, MenuIcon, Users, FileBox } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Update the Header component to remove AvatarSelector
export default function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="font-bold text-xl">
            AI Chat
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md ${isActive("/") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <span className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </span>
              </Link>
              <Link
                href="/agents"
                className={`px-3 py-2 rounded-md ${isActive("/agents") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <span className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Agents
                </span>
              </Link>
              <Link
                href="/documents"
                className={`px-3 py-2 rounded-md ${isActive("/documents") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <span className="flex items-center">
                  <FileBox className="mr-2 h-4 w-4" />
                  Documents
                </span>
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-md ${isActive("/settings") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <span className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </span>
              </Link>
              <Link
                href="/docs"
                className={`px-3 py-2 rounded-md ${isActive("/docs") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <span className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Documentation
                </span>
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile Menu */}
          {user && (
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link
                      href="/"
                      className={`px-3 py-2 rounded-md ${isActive("/") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat
                      </span>
                    </Link>
                    <Link
                      href="/agents"
                      className={`px-3 py-2 rounded-md ${isActive("/agents") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Agents
                      </span>
                    </Link>
                    <Link
                      href="/documents"
                      className={`px-3 py-2 rounded-md ${isActive("/documents") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center">
                        <FileBox className="mr-2 h-5 w-5" />
                        Documents
                      </span>
                    </Link>
                    <Link
                      href="/settings"
                      className={`px-3 py-2 rounded-md ${isActive("/settings") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center">
                        <Settings className="mr-2 h-5 w-5" />
                        Settings
                      </span>
                    </Link>
                    <Link
                      href="/docs"
                      className={`px-3 py-2 rounded-md ${isActive("/docs") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Documentation
                      </span>
                    </Link>
                    <Link
                      href="/profile"
                      className={`px-3 py-2 rounded-md ${isActive("/profile") ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                    >
                      <span className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        Profile
                      </span>
                    </Link>
                    <Button variant="ghost" className="justify-start px-3 py-2 h-auto font-normal" onClick={logout}>
                      <LogOut className="mr-2 h-5 w-5" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {user ? (
            <div className="flex items-center">
              {/* User Dropdown (desktop) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/avatars/young-woman.svg?height=32&width=32"} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild>
              <Link href="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

