"use client"

import { useState } from "react"
import { Check, User, UserCircle, UserCog, UserRound, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import type { User as UserType } from "@/lib/types"

// Avatar options
const avatarOptions = [
  { id: "default", src: "/avatars/default.svg", icon: <User /> },
  { id: "avatar1", src: "/avatars/young-woman.svg", icon: <UserRound /> },
  { id: "avatar2", src: "/avatars/single-person-1.png", icon: <UserCircle /> },
  { id: "avatar3", src: "/avatars/single-person-2.png", icon: <UserCog /> },
  { id: "avatar4", src: "/avatars/young-professor.svg", icon: <Users /> },
]

interface AvatarSelectorProps {
  user: UserType
  onAvatarChange: (avatarSrc: string) => Promise<boolean>
}

export function AvatarSelector({ user, onAvatarChange }: AvatarSelectorProps) {
  const { toast } = useToast()
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "default")
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveAvatar = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get the selected avatar URL
      const avatarSrc = avatarOptions.find((a) => a.id === selectedAvatar)?.src || "/avatars/default.png"

      // Update user profile using the provided callback
      const success = await onAvatarChange(avatarSrc)

      if (success) {
        toast({
          title: "Avatar updated",
          description: "Your profile avatar has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update avatar")
      }
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.avatar || "/avatars/young-woman.svg?height=96&width=96"} alt={user?.username || "User"} />
          <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
      </div>

      <div className="grid grid-cols-5 gap-4 py-4">
        {avatarOptions.map((avatar) => (
          <div
            key={avatar.id}
            className={`relative cursor-pointer rounded-full p-1 ${
              selectedAvatar === avatar.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedAvatar(avatar.id)}
          >
            <Avatar className="h-12 w-12">
              {avatar.src ? (
                <AvatarImage src={avatar.src} alt={`Avatar ${avatar.id}`} />
              ) : (
                <AvatarFallback>{avatar.icon}</AvatarFallback>
              )}
            </Avatar>
            {selectedAvatar === avatar.id && (
              <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSaveAvatar} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Avatar"}
        </Button>
      </div>
    </div>
  )
}

