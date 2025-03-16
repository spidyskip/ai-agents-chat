"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Agent } from "@/lib/types"

interface MultiAgentSelectorProps {
  selectedAgent: Agent | null
  useAllAgents: boolean
  onToggleAllAgents: (useAll: boolean) => void
}

export function MultiAgentSelector({ selectedAgent, useAllAgents, onToggleAllAgents }: MultiAgentSelectorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Label htmlFor="use-all-agents" className="cursor-pointer flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">All Agents</span>
            </Label>
            <Switch id="use-all-agents" checked={useAllAgents} onCheckedChange={onToggleAllAgents} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {useAllAgents
              ? "Using all agents - the system will choose the best agent for each query"
              : `Using only ${selectedAgent?.name || "the selected agent"}`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

