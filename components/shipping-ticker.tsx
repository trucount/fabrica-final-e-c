"use client"

import { Truck } from "lucide-react"

export function ShippingTicker() {
  const messages = ["FREE SHIPPING ON ORDERS OVER $200", "30-DAY RETURNS", "AUTHENTIC ITALIAN CRAFTSMANSHIP"]

  return (
    <div className="sticky top-0 z-50 bg-foreground text-background py-1.5 overflow-hidden">
      <div className="flex gap-8">
        {/* First set for infinite scroll */}
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee-infinite">
          {messages.map((message, index) => (
            <span
              key={`set1-${index}`}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wide"
            >
              <Truck className="h-3 w-3" />
              {message}
            </span>
          ))}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee-infinite" aria-hidden="true">
          {messages.map((message, index) => (
            <span
              key={`set2-${index}`}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wide"
            >
              <Truck className="h-3 w-3" />
              {message}
            </span>
          ))}
        </div>
        {/* Third set to ensure no gaps */}
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee-infinite" aria-hidden="true">
          {messages.map((message, index) => (
            <span
              key={`set3-${index}`}
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wide"
            >
              <Truck className="h-3 w-3" />
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
