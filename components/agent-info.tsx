import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { InfoIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/lib/types"

interface AgentInfoProps {
  agent: Agent
}

export default function AgentInfo({ agent }: AgentInfoProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <InfoIcon size={16} />
          <span className="sr-only">Agent information</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{agent.name}</h4>

          {agent.model_name && (
            <div className="text-xs">
              <span className="font-medium">Model:</span> {agent.model_name}
            </div>
          )}

          {agent.categories && agent.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {agent.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {agent.tools && agent.tools.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium">Capabilities:</span>
              <ul className="text-xs mt-1 space-y-1">
                {agent.tools.map((tool, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{tool.name || tool.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            <p className="line-clamp-3">{agent.prompt}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

