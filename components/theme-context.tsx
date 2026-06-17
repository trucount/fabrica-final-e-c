"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { loadPolicies, loadThemes, type Theme, type OrderPolicies } from "@/lib/client-commerce"

type ThemeContextType = {
  activeTheme: Theme | null
  themes: Theme[]
  isLoading: boolean
  refresh: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = async () => {
    try {
      const [allThemes, policies] = await Promise.all([loadThemes(), loadPolicies()])
      setThemes(allThemes)
      const active = allThemes.find((t) => t.name === policies.activeThemeName) || allThemes.find((t) => t.name === "default") || allThemes[0] || null
      setActiveTheme(active)
    } catch (error) {
      console.error("Failed to load themes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (activeTheme) {
      const root = document.documentElement
      const colors = activeTheme.colors
      Object.entries(colors).forEach(([key, value]) => {
        const cssKey = key.replace(/_/g, "-")
        root.style.setProperty(`--${cssKey}`, value)
      })
    }
  }, [activeTheme])

  return (
    <ThemeContext.Provider value={{ activeTheme, themes, isLoading, refresh }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
