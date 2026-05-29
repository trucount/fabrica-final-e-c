import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { AboutSections } from "@/components/about-sections"
import { CollectionsCarousel } from "@/components/collections-carousel"
import { Header } from "@/components/header"
import { ProductGridCustom } from "@/components/product-grid-custom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getAboutContent } from "@/lib/about-content"
import { getCollectionsContent } from "@/lib/collections-content"
import { getHomeContent } from "@/lib/home-content"
import { EDIT_SESSION_COOKIE } from "./constants"
import { loginToHomeEdit, logoutFromEdit, saveEditedHomeContent } from "./actions"

type EditHomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditHomePage({ searchParams }: EditHomePageProps) {
  const cookieStore = await cookies()
  const params = (await searchParams) ?? {}
  const isAuthenticated = cookieStore.get(EDIT_SESSION_COOKIE)?.value === "authenticated"

  if (!isAuthenticated) {
    return <EditLoginPage error={params.error === "1" || params.error === "auth"} />
  }

  const [aboutContent, collectionsContent, homeContent] = await Promise.all([
    getAboutContent(),
    getCollectionsContent(),
    getHomeContent(),
  ])
  const saved = params.saved === "1"

  return (
    <div className="min-h-screen">
      <Header />

      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View Home Page
              </Link>
            </Button>
            {saved ? <p className="text-sm text-green-600">Saved. Home page is updated.</p> : null}
          </div>
          <div className="flex gap-2">
            <form action={logoutFromEdit}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
            <Button form="home-edit-form" type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Text
            </Button>
          </div>
        </div>
      </div>

      <form id="home-edit-form" action={saveEditedHomeContent}>
        <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <iframe
              className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
              src="https://www.youtube.com/embed/u9FEg5qur14?autoplay=1&mute=1&loop=1&playlist=u9FEg5qur14&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
              title="Background video"
              allow="autoplay; encrypted-media"
              style={{ pointerEvents: "none" }}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 text-center px-4 text-white w-full max-w-4xl">
            <Input
              name="heroTitle"
              defaultValue={homeContent.heroTitle}
              aria-label="Home hero title"
              className="h-auto border-dashed bg-background/75 text-center font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 sm:mb-6 tracking-tight text-balance"
            />
            <Textarea
              name="heroSubtitle"
              defaultValue={homeContent.heroSubtitle}
              aria-label="Home hero subtitle"
              className="mx-auto mb-6 sm:mb-8 max-w-2xl resize-none border-dashed bg-background/75 text-center text-base sm:text-lg md:text-xl text-muted-foreground"
              rows={2}
            />
            <Button asChild size="lg" className="h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base">
              <Link href="/shop">Explore Collection</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <Input
              name="collectionsTitle"
              defaultValue={homeContent.collectionsTitle}
              aria-label="Collections section title"
              className="h-auto max-w-sm border-dashed font-serif text-2xl sm:text-3xl md:text-4xl font-semibold"
            />
            <Button variant="ghost" asChild className="text-sm sm:text-base">
              <Link href="/collections">View All</Link>
            </Button>
          </div>
          <CollectionsCarousel collections={collectionsContent.collections} />
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <Input
              name="newArrivalsTitle"
              defaultValue={homeContent.newArrivalsTitle}
              aria-label="New arrivals section title"
              className="h-auto max-w-sm border-dashed font-serif text-2xl sm:text-3xl md:text-4xl font-semibold"
            />
            <Button variant="ghost" asChild className="text-sm sm:text-base">
              <Link href="/shop">View All</Link>
            </Button>
          </div>
          <ProductGridCustom products={newArrivalProducts} />
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <Input
              name="bestSellersTitle"
              defaultValue={homeContent.bestSellersTitle}
              aria-label="Best sellers section title"
              className="h-auto max-w-sm border-dashed font-serif text-2xl sm:text-3xl md:text-4xl font-semibold"
            />
            <Button variant="ghost" asChild className="text-sm sm:text-base">
              <Link href="/shop">View All</Link>
            </Button>
          </div>
          <ProductGridCustom products={bestSellerProducts} />
        </section>

        <AboutSections content={aboutContent} roundedImage showHero={false} />

        <footer className="border-t border-border mt-16 sm:mt-24">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <h3 className="font-serif text-xl font-semibold mb-4">THUDARUM</h3>
                <Textarea
                  name="footerTagline"
                  defaultValue={homeContent.footerTagline}
                  aria-label="Footer tagline"
                  className="min-h-20 resize-y border-dashed text-sm text-muted-foreground"
                />
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
                    <Link href="/new">{homeContent.newArrivalsTitle}</Link>
                  </li>
                  <li>
                    <Link href="/shop?section=best-sellers">{homeContent.bestSellersTitle}</Link>
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
      </form>
    </div>
  )
}

function EditLoginPage({ error }: { error: boolean }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold mb-2">Edit Home Page</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the editor password to update only the editable text on the Home page.
          </p>
          <form action={loginToHomeEdit} className="space-y-4">
            <div>
              <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              {error ? <p className="mt-2 text-sm text-destructive">Incorrect password. Please try again.</p> : null}
            </div>
            <Button type="submit" className="w-full">
              Unlock Editor
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

const newArrivalProducts = [
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
]

const bestSellerProducts = [
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
]
