import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { getCollections } from "@/lib/collections-data"
import { getProducts } from "@/lib/products-data"
import { getShopContent } from "@/lib/shop-content"

type ShopPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) ?? {}
  const collection = typeof params.collection === "string" ? params.collection : ""
  const search = typeof params.search === "string" ? params.search : ""
  const [content, collections, products] = await Promise.all([
    getShopContent(),
    getCollections(),
    getProducts({ collection, search }),
  ])
  const activeCollection = collections.find((item) => item.id === collection)

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold">{activeCollection?.name ?? content.title}</h1>
            {activeCollection ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{activeCollection.description}</p>
            ) : null}
          </div>
          <form action="/shop" className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
            {collection ? <input type="hidden" name="collection" value={collection} /> : null}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="search" defaultValue={search} placeholder="Search products" className="pl-9" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <Button variant={!collection ? "default" : "outline"} asChild size="sm">
            <Link href={search ? `/shop?search=${encodeURIComponent(search)}` : "/shop"}>All</Link>
          </Button>
          {collections.map((item) => {
            const href = `/shop?collection=${encodeURIComponent(item.id)}${search ? `&search=${encodeURIComponent(search)}` : ""}`
            return (
              <Button key={item.id} variant={collection === item.id ? "default" : "outline"} asChild size="sm">
                <Link href={href}>{item.name}</Link>
              </Button>
            )
          })}
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  )
}
