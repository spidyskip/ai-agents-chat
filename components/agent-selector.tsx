"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Agent } from "@/lib/types"

interface AgentSelectorProps {
  agents: Agent[] | null | undefined
  selectedAgent: Agent | null
  onSelectAgent: (agent: Agent) => void
}

export default function AgentSelector({ agents, selectedAgent, onSelectAgent }: AgentSelectorProps) {
  const [open, setOpen] = useState(false)

  // Ensure agents is always an array
  const agentList = Array.isArray(agents) ? agents : []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {selectedAgent ? selectedAgent.name : "Select an agent..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search agents..." />
          <CommandList>
            <CommandEmpty>No agent found.</CommandEmpty>
            <CommandGroup>
              {agentList.map((agent) => (
                <CommandItem
                  key={agent.agent_id}
                  value={agent.agent_id}
                  onSelect={() => {
                    onSelectAgent(agent)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAgent?.agent_id === agent.agent_id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {agent.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

