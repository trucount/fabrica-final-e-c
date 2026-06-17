import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HomeContent } from "@/lib/home-content"
import type { SectionStyle } from "@/lib/client-commerce"

type HomeHeroProps = {
  content: HomeContent
  style: SectionStyle
}

export function HomeHero({ content, style }: HomeHeroProps) {
  const desktopImageUrls = content.heroImageUrlsDesktop.slice(0, 4)
  const mobileImageUrls = content.heroImageUrlsMobile.slice(0, 4)

  return (
    <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {style === "image" ? (
          <>
            <div className="absolute inset-0 md:hidden">
              {mobileImageUrls.map((imageUrl, index) => (
                <Image
                  key={`mobile-${imageUrl}-${index}`}
                  src={imageUrl}
                  alt="Mobile hero carousel image"
                  fill
                  priority={index === 0}
                  className="object-cover opacity-0 animate-hero-image-carousel"
                  style={{ animationDelay: `${index * 5}s` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 hidden md:block">
              {desktopImageUrls.map((imageUrl, index) => (
                <Image
                  key={`desktop-${imageUrl}-${index}`}
                  src={imageUrl}
                  alt="Desktop hero carousel image"
                  fill
                  priority={index === 0}
                  className="object-cover opacity-0 animate-hero-image-carousel"
                  style={{ animationDelay: `${index * 5}s` }}
                />
              ))}
            </div>
          </>
        ) : (
          <iframe
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
            src={content.heroVideoUrl}
            title="Background video"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: "none" }}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {style === "video" ? (
        <div className="relative z-10 text-center px-4 text-primary-foreground">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 sm:mb-6 tracking-tight text-balance drop-shadow-md text-primary-foreground">
            {content.heroTitle}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-balance text-primary-foreground/95">
            {content.heroSubtitle}
          </p>
          <Button asChild size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
            <Link href="/collections">Explore Collection</Link>
          </Button>
        </div>
      ) : null}
    </section>
  )
}
