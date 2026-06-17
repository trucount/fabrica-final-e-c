"use client"

import { useEffect, useState } from "react"
import { Truck } from "lucide-react"
import { useTheme } from "@/components/theme-context"

export function ShippingTicker() {
  const { activeTheme, policies, isLoading: isThemeLoading } = useTheme()
  const [tickerMessages, setTickerMessages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/site-content")
      .then((response) => response.ok ? response.json() : null)
      .then((content) => {
        if (content?.tickerMessages) {
          setTickerMessages(content.tickerMessages)
        }
      })
      .catch(() => setTickerMessages([]))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading || isThemeLoading || !policies || policies.themeSettings.showTicker === false || !tickerMessages.length) return null

  const isDefaultTheme = activeTheme?.name === "default"
  const textColorClass = isDefaultTheme ? "text-white" : "text-primary-foreground"

  return (
    <div className="sticky top-0 z-50 bg-primary py-1.5 overflow-hidden">
      <div className="flex gap-8">
        {["set1", "set2", "set3"].map((setName, setIndex) => (
          <div
            key={setName}
            className="flex items-center gap-8 whitespace-nowrap animate-marquee-infinite"
            aria-hidden={setIndex === 0 ? undefined : "true"}
          >
            {tickerMessages.map((message, index) => (
              <span
                key={`${setName}-${index}`}
                className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wide ${textColorClass}`}
              >
                <Truck className="h-3 w-3" />
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
