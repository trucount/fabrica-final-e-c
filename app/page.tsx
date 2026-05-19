import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ProductGrid } from "@/components/product-grid"
import { CollectionsCarousel } from "@/components/collections-carousel"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black overflow-hidden">
        {/* YouTube video background */}
        <div className="absolute inset-0 w-full h-full">
          <iframe
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
            src="https://www.youtube.com/embed/u9FEg5qur14?autoplay=1&mute=1&loop=1&playlist=u9FEg5qur14&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            title="Background video"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: "none" }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-4 text-white">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 sm:mb-6 tracking-tight text-balance drop-shadow-lg">
            Refined Simplicity
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-balance drop-shadow-md text-white/90">
            Discover timeless pieces crafted for the modern wardrobe
          </p>
          <Button asChild size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
            <Link href="/shop">Explore Collection</Link>
          </Button>
        </div>
      </section>

      {/* Collections Slider */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">Collections</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/collections">View All</Link>
          </Button>
        </div>
        <CollectionsCarousel />
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">New Arrivals</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/shop">View All</Link>
          </Button>
        </div>
        <ProductGrid />
      </section>

      {/* About Section - Our Story */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded with a vision to redefine modern menswear, Thudarum represents the perfect marriage of
                traditional craftsmanship and contemporary design. Our name, derived from the Tamil word meaning
                "continuation," embodies our commitment to carrying forward the legacy of fine tailoring into the modern
                era.
              </p>
              <p>
                Every piece in our collection is meticulously crafted using premium Italian fabrics and constructed by
                master tailors who have honed their craft over decades. We believe that true luxury lies not in excess,
                but in the perfect balance of form, function, and timeless style.
              </p>
              <p>
                Our double-breasted suits and blazers are designed for the discerning gentleman who appreciates quality,
                understands elegance, and values garments that will remain relevant for years to come.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-secondary overflow-hidden rounded-lg">
            <Image src="/thudarum-taupe-suit-detail.jpg" alt="Thudarum craftsmanship" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* About Section - Our Values */}
      <section className="bg-secondary py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-4">Craftsmanship</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every garment is constructed with meticulous attention to detail by skilled artisans who take pride in
                their work.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-4">Quality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We source only the finest materials from renowned Italian mills, ensuring durability and comfort in
                every piece.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-4">Timelessness</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our designs transcend fleeting trends, offering styles that remain elegant and relevant season after
                season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">Experience Thudarum</h2>
          <p className="text-muted-foreground mb-8 text-base sm:text-lg">
            Discover our latest collection of meticulously crafted suits and blazers designed for the modern gentleman.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link href="/shop">Explore Collection</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">THUDARUM</h3>
              <p className="text-sm text-muted-foreground">Contemporary fashion for the discerning individual.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/shop">All Products</Link>
                </li>
                <li>
                  <Link href="/collections">Collections</Link>
                </li>
                <li>
                  <Link href="/new">New Arrivals</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/shipping">Shipping</Link>
                </li>
                <li>
                  <Link href="/returns">Returns</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 THUDARUM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
