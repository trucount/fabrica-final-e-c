import { ProductCard } from "./product-card"

const products = [
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

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
