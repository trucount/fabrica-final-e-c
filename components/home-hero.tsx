"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { HomeContent } from "@/lib/home-content"
import type { SectionStyle } from "@/lib/client-commerce"
import { useState, useEffect } from "react"

type HomeHeroProps = {
  content: HomeContent
  style: SectionStyle
}

export function HomeHero({ content, style }: HomeHeroProps) {
  const desktopImageUrls = content.heroImageUrlsDesktop
  const mobileImageUrls = content.heroImageUrlsMobile
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const imageUrls = isMobile ? mobileImageUrls : desktopImageUrls
  const totalImages = imageUrls.length

  useEffect(() => {
    // Determine if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (style !== "image") return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages)
    }, 5000)

    return () => clearInterval(interval)
  }, [totalImages, style])

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <section className="relative w-full bg-background overflow-hidden">
      {style === "image" ? (
        <div className={`relative w-full ${isMobile ? "aspect-square" : "aspect-video"}`}>
          {/* Carousel Images */}
          {imageUrls.map((imageUrl, index) => (
            <div
              key={`image-${imageUrl}-${index}`}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={imageUrl}
                alt={`Hero carousel image ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {imageUrls.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => goToImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <iframe
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
              src={content.heroVideoUrl}
              title="Background video"
              allow="autoplay; encrypted-media"
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

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
        </div>
      )}
    </section>
  )
}
