// filepath: c:\Users\anton\Projects\ai-chat-interface\components\theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class">
      {children}
    </NextThemesProvider>
  )
}