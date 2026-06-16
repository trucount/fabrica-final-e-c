import { Truck } from "lucide-react"
import { getSiteContent } from "@/lib/site-content"

export async function ShippingTicker() {
  const { tickerMessages } = await getSiteContent()

  return (
    <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-1.5 overflow-hidden">
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
                className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium uppercase tracking-wide"
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
