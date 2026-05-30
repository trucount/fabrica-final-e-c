import type { ProductSummary } from "@/lib/products-data"
import { ProductCard } from "./product-card"

type ProductCardData = Pick<ProductSummary, "id" | "name" | "price" | "image" | "category">

export function ProductGrid({ products = [] }: { products?: ProductCardData[] }) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center sm:p-12">
        <h2 className="font-serif text-2xl font-semibold">No products found</h2>
        <p className="mt-2 text-sm text-muted-foreground">Try another search or collection filter.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
