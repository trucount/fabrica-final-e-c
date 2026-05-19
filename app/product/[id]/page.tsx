import { Header } from "@/components/header"
import { ProductDetail } from "@/components/product-detail"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const products = [
  {
    id: "1",
    name: "Signature Taupe Double-Breasted Suit",
    price: 1295,
    images: ["/thudarum-taupe-suit-hero.jpg", "/thudarum-taupe-suit-detail.jpg", "/thudarum-taupe-suit-side.jpg"],
    category: "Suits",
    description:
      "An impeccably tailored double-breasted suit in refined taupe wool. Features peak lapels, matching trousers, and superior Italian craftsmanship. The perfect choice for the discerning gentleman.",
    details: ["100% Italian wool", "Double-breasted closure", "Peak lapels", "Made in Italy", "Complete with trousers"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "2",
    name: "Heritage Green Houndstooth Blazer",
    price: 895,
    images: ["/thudarum-green-check-blazer.jpg", "/thudarum-green-check-detail.jpg", "/thudarum-green-check-side.jpg"],
    category: "Blazers",
    description:
      "Distinguished double-breasted blazer in classic green houndstooth pattern. Crafted from premium wool with gold-tone buttons and cream trousers for sophisticated contrast.",
    details: ["Premium wool houndstooth", "Double-breasted design", "Gold-tone buttons", "Made in England"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "3",
    name: "Luxe Burgundy Evening Suit",
    price: 1495,
    images: [
      "/thudarum-burgundy-evening-suit.jpg",
      "/thudarum-burgundy-suit-detail.jpg",
      "/thudarum-burgundy-suit-side.jpg",
    ],
    category: "Suits",
    description:
      "Sophisticated burgundy double-breasted suit perfect for evening occasions. Rich wool construction with elegant drape and timeless silhouette.",
    details: [
      "Fine Italian wool",
      "Double-breasted style",
      "Tone-on-tone buttons",
      "Made in Italy",
      "Full suit ensemble",
    ],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "4",
    name: "Sky Blue Textured Blazer",
    price: 795,
    images: ["/thudarum-sky-blue-blazer.jpg", "/thudarum-sky-blue-detail.jpg", "/thudarum-sky-blue-side.jpg"],
    category: "Blazers",
    description:
      "Contemporary sky blue double-breasted blazer with subtle texture. Features distinctive gold buttons and refined tailoring for a modern yet timeless look.",
    details: ["Textured wool blend", "Double-breasted cut", "Gold button details", "Made in Italy"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "5",
    name: "Regal Burgundy Blazer Combination",
    price: 945,
    images: [
      "/thudarum-burgundy-blazer-combo.jpg",
      "/thudarum-burgundy-combo-detail.jpg",
      "/thudarum-burgundy-combo-side.jpg",
    ],
    category: "Blazers",
    description:
      "Striking burgundy double-breasted blazer with cream trousers and pocket square. A bold statement piece for the fashion-forward gentleman.",
    details: ["Premium wool construction", "Double-breasted design", "Gold-tone buttons", "Made in Italy"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "6",
    name: "Midnight Navy Velvet Blazer",
    price: 1095,
    images: ["/thudarum-navy-velvet-blazer.jpg", "/thudarum-navy-velvet-detail.jpg", "/thudarum-navy-velvet-side.jpg"],
    category: "Blazers",
    description:
      "Luxurious navy velvet double-breasted blazer with ivory trousers. Perfect for elevated evening wear with exceptional texture and sheen.",
    details: ["Italian cotton velvet", "Double-breasted style", "Silver-tone buttons", "Made in Italy"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "7",
    name: "Metropolitan Gray Suit",
    price: 1195,
    images: ["/thudarum-gray-suit-refined.jpg", "/thudarum-gray-suit-detail.jpg", "/thudarum-gray-suit-side.jpg"],
    category: "Suits",
    description:
      "Refined gray double-breasted suit with contemporary slim fit. Features peak lapels and superior construction for the modern professional.",
    details: ["Super 120s wool", "Double-breasted closure", "Peak lapels", "Made in Italy", "Complete suit"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
  {
    id: "8",
    name: "Executive Slate Blazer Set",
    price: 875,
    images: ["/thudarum-slate-blazer-set.jpg", "/thudarum-slate-blazer-detail.jpg", "/thudarum-slate-blazer-side.jpg"],
    category: "Blazers",
    description:
      "Sophisticated slate gray double-breasted blazer with navy trousers. Timeless elegance meets contemporary styling for the discerning dresser.",
    details: ["Premium wool blend", "Double-breasted design", "Classic buttons", "Made in England"],
    sizes: ["38", "40", "42", "44", "46", "48"],
  },
]

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <Button variant="ghost" asChild>
          <Link href="/shop">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
        </Button>
      </div>
      <ProductDetail product={product} />
    </div>
  )
}
