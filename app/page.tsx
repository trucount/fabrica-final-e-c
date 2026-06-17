import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { HomeHero } from "@/components/home-hero"
import Link from "next/link"
import { ProductGridCustom } from "@/components/product-grid-custom"
import { CollectionsCarousel } from "@/components/collections-carousel"
import { AboutSections } from "@/components/about-sections"
import { getAboutContent } from "@/lib/about-content"
import { getHomeContent } from "@/lib/home-content"
import { getSiteContent } from "@/lib/site-content"
import { getCollections } from "@/lib/collections-data"
import { getProducts } from "@/lib/products-data"
import { getCommercePolicies } from "@/lib/commerce-server"

export default async function Home() {
  const [aboutContent, homeContent, siteContent, collections, newArrivals, bestSellers, policies] = await Promise.all([
    getAboutContent(),
    getHomeContent(),
    getSiteContent(),
    getCollections(),
    getProducts({ section: "new_arrivals", limit: 4 }),
    getProducts({ section: "best_sellers", limit: 4 }),
    getCommercePolicies(),
  ])

  return (
    <div className="min-h-screen">
      <Header />

      <HomeHero content={homeContent} style={policies.themeSettings.sectionStyles.homeHero} />

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
              <h3 className="flex items-center gap-2 font-serif text-xl font-semibold mb-4">

                <span>{siteContent.brandName}</span>
              </h3>
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
