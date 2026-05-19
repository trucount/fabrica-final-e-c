import { Header } from "@/components/header"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center bg-secondary">
        <div className="absolute inset-0 bg-[url('/thudarum-burgundy-evening-suit.jpg')] bg-cover bg-center opacity-80" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 tracking-tight">
            About Thudarum
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Crafting timeless elegance for the modern gentleman
          </p>
        </div>
      </section>

      {/* Story Section */}
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
          <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
            <Image src="/thudarum-taupe-suit-detail.jpg" alt="Thudarum craftsmanship" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* Values Section */}
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

      {/* CTA Section */}
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
    </div>
  )
}
