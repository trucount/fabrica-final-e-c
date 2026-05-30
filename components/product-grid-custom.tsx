import type { ProductSummary } from "@/lib/products-data"
import { ProductCard } from "./product-card"

type ProductCardData = Pick<ProductSummary, "id" | "name" | "price" | "image" | "category">

interface ProductGridCustomProps {
  products: ProductCardData[]
}

export function ProductGridCustom({ products }: ProductGridCustomProps) {
  if (!products.length) {
    return <p className="text-sm text-muted-foreground">No products have been added to this section yet.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
