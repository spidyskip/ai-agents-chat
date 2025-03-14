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
import { MessageSquare, FileText, User, LogOut, Settings } from "lucide-react"

export default function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

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
                  <User className="mr-2 h-4 w-4" />
                  Agents
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

        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/single-person-1.png?height=32&width=32"} alt={user.username} />
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

