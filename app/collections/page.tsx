import { Header } from "@/components/header"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CollectionsPage() {
  const collections = [
    {
      id: "executive",
      name: "Executive Collection",
      description:
        "Bold, sophisticated pieces for the modern power dresser. Featuring rich textures and commanding colors.",
      image: "/thudarum-burgundy-evening-suit.jpg",
      items: "12 items",
    },
    {
      id: "heritage",
      name: "Heritage Collection",
      description: "Classic tailoring with timeless appeal. Traditional patterns reimagined for contemporary elegance.",
      image: "/thudarum-green-check-blazer.jpg",
      items: "8 items",
    },
    {
      id: "contemporary",
      name: "Contemporary Collection",
      description: "Modern cuts and innovative styling for the forward-thinking gentleman.",
      image: "/thudarum-sky-blue-blazer.jpg",
      items: "10 items",
    },
    {
      id: "evening",
      name: "Evening Collection",
      description: "Luxurious velvet and satin pieces designed to make a statement at formal occasions.",
      image: "/thudarum-navy-velvet-blazer.jpg",
      items: "6 items",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-24">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight">
            Collections
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-balance">
            Explore our curated collections, each telling a unique story of style, craftsmanship, and modern elegance.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/shop?collection=${collection.id}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-4">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white/80 text-xs sm:text-sm mb-2">{collection.items}</p>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-2">
                    {collection.name}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {collection.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-between text-sm sm:text-base group-hover:bg-secondary">
                View Collection
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-secondary py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">Crafted for Excellence</h2>
            <p className="text-muted-foreground mb-8 text-base sm:text-lg leading-relaxed">
              Each collection is carefully curated to offer a distinct aesthetic while maintaining the exceptional
              quality and attention to detail that defines Thudarum. From boardroom to ballroom, we have the perfect
              piece for every occasion.
            </p>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 bg-transparent">
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
