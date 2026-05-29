import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import type { InfoPageContent } from "@/lib/info-page-content"

export function InfoPage({ content }: { content: InfoPageContent }) {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight">
            {content.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-balance">{content.description}</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
          {content.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  )
}
