"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { CollectionItem } from "@/lib/collections-data"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CollectionsCarousel({ collections }: { collections: CollectionItem[] }) {
  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {collections.map((collection) => (
          <CarouselItem key={collection.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
            <Link href={`/shop?collection=${collection.id}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-4 rounded-lg">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white/80 text-xs sm:text-sm mb-2">{collection.items}</p>
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {collection.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-between text-xs sm:text-sm group-hover:bg-secondary">
                View
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-12 lg:-left-16" />
      <CarouselNext className="hidden md:flex -right-12 lg:-right-16" />
    </Carousel>
  )
}
