"use client"

import { useTheme } from "@/components/theme-context"
import { useEffect, useState } from "react"

export function GlobalLoading() {
  const { isLoading } = useTheme()
  const [shouldRender, setShouldRender] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setIsExiting(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 500) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="font-serif text-lg animate-pulse text-foreground">Loading...</p>
      </div>
    </div>
  )
}
