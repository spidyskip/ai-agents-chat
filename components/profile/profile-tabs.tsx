"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PersonalInfoTab from "./tabs/personal-info-tab"
import DocumentsTab from "./tabs/documents-tab"
import ActivityTab from "./tabs/activity-tab"
import SettingsTab from "./tabs/settings-tab"
import { User, FileText, Activity, Settings } from "lucide-react"
import type { User as UserType } from "@/lib/types"

interface ProfileTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: UserType | null
}

export default function ProfileTabs({ activeTab, setActiveTab, user }: ProfileTabsProps) {
  if (!user) return null

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Personal Info</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <PersonalInfoTab user={user} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsTab user={user} />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityTab user={user} />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab user={user} />
      </TabsContent>
    </Tabs>
  )
}

