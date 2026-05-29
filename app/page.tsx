import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductGridCustom } from "@/components/product-grid-custom"
import { CollectionsCarousel } from "@/components/collections-carousel"
import { AboutSections } from "@/components/about-sections"
import { getAboutContent } from "@/lib/about-content"

export default async function Home() {
  const aboutContent = await getAboutContent()

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

      {/* New Arrivals */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">New Arrivals</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/shop">View All</Link>
          </Button>
        </div>
        <ProductGridCustom products={[
          {
            id: "1",
            name: "Classic Taupe Double-Breasted Suit",
            price: 1289,
            image: "/thudarum-taupe-suit-hero.jpg",
            category: "Suits",
          },
          {
            id: "2",
            name: "Heritage Green Check Blazer",
            price: 895,
            image: "/thudarum-green-check-blazer.jpg",
            category: "Blazers",
          },
          {
            id: "3",
            name: "Luxe Burgundy Evening Suit",
            price: 1545,
            image: "/thudarum-burgundy-evening-suit.jpg",
            category: "Suits",
          },
          {
            id: "4",
            name: "Sky Blue Textured Blazer",
            price: 795,
            image: "/thudarum-sky-blue-blazer.jpg",
            category: "Blazers",
          },
        ]} />
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">Best Sellers</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/shop">View All</Link>
          </Button>
        </div>
        <ProductGridCustom products={[
          {
            id: "5",
            name: "Burgundy Blazer with Cream Trousers",
            price: 985,
            image: "/thudarum-burgundy-blazer-combo.jpg",
            category: "Separates",
          },
          {
            id: "6",
            name: "Navy Velvet Double-Breasted Jacket",
            price: 1195,
            image: "/thudarum-navy-velvet-blazer.jpg",
            category: "Blazers",
          },
          {
            id: "7",
            name: "Refined Gray Double-Breasted Suit",
            price: 1345,
            image: "/thudarum-gray-suit-refined.jpg",
            category: "Suits",
          },
          {
            id: "8",
            name: "Modern Slate Blazer Set",
            price: 1095,
            image: "/thudarum-slate-blazer-set.jpg",
            category: "Separates",
          },
        ]} />
      </section>

      {/* About Sections */}
      <AboutSections content={aboutContent} roundedImage showHero={false} />

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
