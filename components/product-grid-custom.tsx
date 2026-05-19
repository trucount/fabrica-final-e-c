import { ProductCard } from "./product-card"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
}

interface ProductGridCustomProps {
  products: Product[]
}

export function ProductGridCustom({ products }: ProductGridCustomProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
