// "use client"
// 
// import { useState } from "react"
// import { Check, User, UserCircle, UserCog, UserRound, Users } from 'lucide-react'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { useAuth } from "@/contexts/auth-context"
// import { useToast } from "@/hooks/use-toast"
// 
// // Avatar options
// const avatarOptions = [
//   { id: "default", src: "/avatars/default.png", icon: <User /> },
//   { id: "avatar1", src: "/avatars/avatar1.png", icon: <UserRound /> },
//   { id: "avatar2", src: "/avatars/avatar2.png", icon: <UserCircle /> },
//   { id: "avatar3", src: "/avatars/avatar3.png", icon: <UserCog /> },
//   { id: "avatar4", src: "/avatars/avatar4.png", icon: <Users /> },
// ]
// 
// export function AvatarSelector() {
//   const { user, updateUserProfile } = useAuth()
//   const { toast } = useToast()
//   const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "default")
//   const [isOpen, setIsOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
// 
//   const handleSaveAvatar = async () => {
//     if (!user) return
//     
//     setIsLoading(true)
//     try {
//       // Get the selected avatar URL
//       const avatarSrc = avatarOptions.find(a => a.id === selectedAvatar)?.src || "/avatars/default.png"
//       
//       // Update user profile
//       const success = await updateUserProfile({ avatar: avatarSrc })
//       
//       if (success) {
//         toast({
//           title: "Avatar updated",
//           description: "Your profile avatar has been updated successfully.",
//         })
//         setIsOpen(false)
//       } else {
//         throw new Error("Failed to update avatar")
//       }
//     } catch (error) {
//       console.error("Error updating avatar:", error)
//       toast({
//         title: "Error",
//         description: "Failed to update avatar. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }
// 
//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
//           <Avatar className="h-8 w-8">
//             <AvatarImage 
//               src={user?.avatar || "/placeholder.svg?height=32&width=32"} 
//               alt={user?.username || "User"} 
//             />
//             <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
//           </Avatar>
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Choose Avatar</DialogTitle>
//           <DialogDescription>
//             Select an avatar for your profile.
//           </DialogDescription>
//         </DialogHeader>
//         <div className="grid grid-cols-5 gap-4 py-4">
//           {avatarOptions.map((avatar) => (
//             <div 
//               key={avatar.id}
//               className={`relative cursor-pointer rounded-full p-1 ${
//                 selectedAvatar === avatar.id ? "ring-2 ring-primary" : ""
//               }`}
//               onClick={() => setSelectedAvatar(avatar.id)}
//             >
//               <Avatar className="h-12 w-12">
//                 {avatar.src ? (
//                   <AvatarImage src={avatar.src} alt={`Avatar ${avatar.id}`} />
//                 ) : (
//                   <AvatarFallback>{avatar.icon}</AvatarFallback>
//                 )}
//               </Avatar>
//               {selectedAvatar === avatar.id && (
//                 <div className="absolute bottom-0 right-0 rounded-full bg-primary p-1">
//                   <Check className="h-3 w-3 text-primary-foreground" />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//         <DialogFooter>
//           <Button onClick={handleSaveAvatar} disabled={isLoading}>
//             {isLoading ? "Saving..." : "Save changes"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
