import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { AboutContent } from "@/lib/about-content"

type AboutSectionsProps = {
  content: AboutContent
  roundedImage?: boolean
  showHero?: boolean
}

export function AboutSections({ content, roundedImage = false, showHero = true }: AboutSectionsProps) {
  return (
    <>
      {showHero ? (
        <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center bg-secondary">
          <div className="absolute inset-0 bg-[url('/thudarum-burgundy-evening-suit.jpg')] bg-cover bg-center opacity-80" />
          <div className="relative z-10 text-center px-4">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 tracking-tight">
              {content.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">{content.heroSubtitle}</p>
          </div>
        </section>
      ) : null}

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">{content.storyTitle}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {content.storyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className={`relative aspect-[4/5] bg-secondary overflow-hidden${roundedImage ? " rounded-lg" : ""}`}>
            <Image src="/thudarum-taupe-suit-detail.jpg" alt="Thudarum craftsmanship" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-12 text-center">
            {content.valuesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {content.values.map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-4">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">{content.ctaTitle}</h2>
          <p className="text-muted-foreground mb-8 text-base sm:text-lg">{content.ctaDescription}</p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link href="/shop">Explore Collection</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
