"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Camera } from "lucide-react"
import type { User } from "@/lib/types"

interface ProfileHeaderProps {
  user: User | null
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  if (!user) return null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={user.username} />
              <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              title="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Edit className="h-3.5 w-3.5" />
                <span className="text-xs">Edit Profile</span>
              </Button>
            </div>
            <p className="text-muted-foreground">{user.email}</p>

            {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              <div>
                <span className="text-lg font-semibold">12</span>
                <span className="text-sm text-muted-foreground ml-1">Documents</span>
              </div>
              <div>
                <span className="text-lg font-semibold">8</span>
                <span className="text-sm text-muted-foreground ml-1">Conversations</span>
              </div>
              <div>
                <span className="text-lg font-semibold">3</span>
                <span className="text-sm text-muted-foreground ml-1">Agents</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

