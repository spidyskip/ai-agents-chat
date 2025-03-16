"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AvatarSelector } from "./tabs/avatar-selector"
import type { User } from "@/lib/types"

interface ProfileHeaderProps {
  user: User | null
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const { updateUserProfile } = useAuth()
  const { toast } = useToast()

  if (!user) return null

  const handleAvatarChange = async (avatarSrc: string): Promise<boolean> => {
    try {
      const success = await updateUserProfile({ avatar: avatarSrc })

      if (success) {
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        })
        setShowAvatarDialog(false)
      } else {
        throw new Error("Failed to update avatar")
      }

      return success
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || "/avatars/young-woman.svg?height=96&width=96"} alt={user.username} />
              <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  title="Change profile picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Profile Picture</DialogTitle>
                  <DialogDescription>Select a new avatar for your profile</DialogDescription>
                </DialogHeader>
                <AvatarSelector user={user} onAvatarChange={handleAvatarChange} />
              </DialogContent>
            </Dialog>
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

