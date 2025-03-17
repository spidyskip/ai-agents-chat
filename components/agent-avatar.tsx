"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Agent } from "@/lib/types"

// Map of agent types to avatar images
const agentAvatarMap: Record<string, string> = {
  "general": "/avatars/inegneer.svg",
  "programming": "/avatars/software-developer-green.svg",
  "creative": "/avatars/artist-avatar.svg",
  "coach": "/avatars/young-men.svg",
  "math": "/avatars/young-professor.svg",
  "writing": "/avatars/agent-writing.png",
  "science": "/avatars/scientist-avatar-green.svg",
  "doctor": "/avatars/doctor-woman.svg",
  "nutrition": "/avatars/woman-avatar-avatar.svg",
  "dpms": "/avatars/dpms.png"
}

interface AgentAvatarProps {
  agent: Agent | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AgentAvatar({ agent, size = "md", className = "" }: AgentAvatarProps) {
  // Determine avatar source based on agent category or name
  const getAvatarSrc = () => {
    if (!agent) return "/avatars/default.svg"
    
    // Check if agent has categories
    if (agent.categories && agent.categories.length > 0) {
      // Try to find a matching avatar for the first category
      const category = agent.categories[0].toLowerCase()
      
      // Check for partial matches in the avatar map keys
      for (const [key, src] of Object.entries(agentAvatarMap)) {
        if (category.includes(key)) {
          return src
        }
      }
    }
    
    // Fallback to agent name matching
    const agentName = agent.name.toLowerCase()
    for (const [key, src] of Object.entries(agentAvatarMap)) {
      if (agentName.includes(key)) {
        return src
      }
    }
    
    // Default avatar
    return "/avatars/default.svg"
  }
  
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }
  
  const avatarSrc = getAvatarSrc()
  const initials = agent?.name.charAt(0).toUpperCase() || "A"
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={avatarSrc} alt={agent?.name || "Agent"} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
