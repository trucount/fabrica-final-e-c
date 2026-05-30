import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductGridCustom } from "@/components/product-grid-custom"
import { CollectionsCarousel } from "@/components/collections-carousel"
import { AboutSections } from "@/components/about-sections"
import { getAboutContent } from "@/lib/about-content"
import { getHomeContent } from "@/lib/home-content"
import { getSiteContent } from "@/lib/site-content"
import { getCollections } from "@/lib/collections-data"
import { getProducts } from "@/lib/products-data"

export default async function Home() {
  const [aboutContent, homeContent, siteContent, collections, newArrivals, bestSellers] = await Promise.all([
    getAboutContent(),
    getHomeContent(),
    getSiteContent(),
    getCollections(),
    getProducts({ section: "new_arrivals", limit: 4 }),
    getProducts({ section: "best_sellers", limit: 4 }),
  ])

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black overflow-hidden">
        {/* YouTube video background */}
        <div className="absolute inset-0 w-full h-full">
          <iframe
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
            src={homeContent.heroVideoUrl}
            title="Background video"
            allow="autoplay; encrypted-media"
            style={{ pointerEvents: "none" }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-4 text-white">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 sm:mb-6 tracking-tight text-balance drop-shadow-lg">
            {homeContent.heroTitle}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-balance drop-shadow-md text-white/90">
            {homeContent.heroSubtitle}
          </p>
          <Button asChild size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
            <Link href="/collections">Explore Collection</Link>
          </Button>
        </div>
      </section>

      {/* Collections Slider */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">{homeContent.collectionsTitle}</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/collections">View All</Link>
          </Button>
        </div>
        <CollectionsCarousel collections={collections} />
      </section>

      {/* New Arrivals */}
      <section id="new-arrivals" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">{homeContent.newArrivalsTitle}</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/shop">View All</Link>
          </Button>
        </div>
        <ProductGridCustom products={newArrivals} />
      </section>

      {/* Best Sellers */}
      <section id="best-sellers" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 scroll-mt-20">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold">{homeContent.bestSellersTitle}</h2>
          <Button variant="ghost" asChild className="text-sm sm:text-base">
            <Link href="/shop">View All</Link>
          </Button>
        </div>
        <ProductGridCustom products={bestSellers} />
      </section>

      {/* About Sections */}
      <AboutSections content={aboutContent} roundedImage showHero={false} />

      {/* Footer */}
      <footer className="border-t border-border mt-16 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">{siteContent.brandName}</h3>
              <p className="text-sm text-muted-foreground">{homeContent.footerTagline}</p>
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
                  <Link href="/#new-arrivals">{homeContent.newArrivalsTitle}</Link>
                </li>
                <li>
                  <Link href="/#best-sellers">{homeContent.bestSellersTitle}</Link>
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
            <p>Powered by Sparrow AI Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
