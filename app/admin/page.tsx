import type { ReactNode } from "react"
import Image from "next/image"
import { LogOut, Plus, Save, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCollections, type CollectionItem } from "@/lib/collections-data"
import { getHomeContent } from "@/lib/home-content"
import { FEATURED_PRODUCT_LIMIT, getProducts, type ProductDetailData, type ProductSection } from "@/lib/products-data"
import {
  createAdminCollection,
  createAdminProduct,
  deleteAdminCollection,
  deleteAdminProduct,
  loginToAdmin,
  logoutFromAdmin,
  updateAdminCollection,
  updateAdminProduct,
} from "./actions"
import { hasAdminPageAccess } from "./auth"
import { AdminOrdersPanel, AdminPoliciesPanel } from "@/components/admin-policies-orders"

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const productTabs: Array<{ section: ProductSection; fallbackLabel: string; description: string }> = [
  { section: "general", fallbackLabel: "Normal Product", description: "Products that only appear in Shop / All Products unless filtered by collection." },
  { section: "new_arrivals", fallbackLabel: "Section 1", description: `Home section products. Maximum ${FEATURED_PRODUCT_LIMIT} active products.` },
  { section: "best_sellers", fallbackLabel: "Section 2", description: `Home section products. Maximum ${FEATURED_PRODUCT_LIMIT} active products.` },
]

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {}

  if (!(await hasAdminPageAccess())) {
    return <AdminLoginPage error={params.error === "1" || params.error === "auth"} />
  }

  const [collections, homeContent, allProducts] = await Promise.all([
    getCollections(),
    getHomeContent(),
    getProducts({ includeInactive: true }),
  ])
  const saved = typeof params.saved === "string" ? params.saved : ""
  const error = typeof params.error === "string" ? params.error : ""
  const defaultTab = params.tab === "products" ? "products" : "collections"
  const defaultProductTab = productTabs.some((tab) => tab.section === params.productTab) ? String(params.productTab) : "general"
  const sectionLabels: Record<ProductSection, string> = {
    general: "Normal Product",
    new_arrivals: homeContent.newArrivalsTitle,
    best_sellers: homeContent.bestSellersTitle,
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">Manage collection cards and Supabase products.</p>
            {saved ? <p className="mt-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">Change saved: {saved}.</p> : null}
            {error ? <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          </div>
          <form action={logoutFromAdmin}>
            <Button type="submit" variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        <Tabs defaultValue={defaultTab} className="gap-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4 lg:inline-grid lg:w-auto">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="space-y-8">
            <CollectionsAdmin collections={collections} />
          </TabsContent>

          <TabsContent value="products" className="space-y-8">
            <Tabs defaultValue={defaultProductTab} className="gap-6">
              <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3 lg:inline-grid lg:w-auto">
                {productTabs.map((tab) => (
                  <TabsTrigger key={tab.section} value={tab.section}>{sectionLabels[tab.section] || tab.fallbackLabel}</TabsTrigger>
                ))}
              </TabsList>
              {productTabs.map((tab) => (
                <TabsContent key={tab.section} value={tab.section} className="space-y-8">
                  <ProductSectionAdmin
                    collections={collections}
                    description={tab.description}
                    label={sectionLabels[tab.section] || tab.fallbackLabel}
                    products={allProducts.filter((product) => product.section === tab.section)}
                    section={tab.section}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="policies" className="space-y-8">
            <AdminPoliciesPanel />
          </TabsContent>

          <TabsContent value="orders" className="space-y-8">
            <AdminOrdersPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function CollectionsAdmin({ collections }: { collections: CollectionItem[] }) {
  return (
    <>
      <section className="rounded-lg border p-4 sm:p-6">
        <h2 className="font-serif text-2xl font-semibold mb-4">Add Collection</h2>
        <form action={createAdminCollection} encType="multipart/form-data" className="grid gap-4 lg:grid-cols-6">
          <Field label="ID / slug" className="lg:col-span-2">
            <Input name="id" placeholder="executive" required />
          </Field>
          <Field label="Name" className="lg:col-span-2">
            <Input name="name" placeholder="Executive Collection" required />
          </Field>
          <Field label="Items label" className="lg:col-span-1">
            <Input name="items" placeholder="12 items" required />
          </Field>
          <Field label="Sort" className="lg:col-span-1">
            <Input name="sortOrder" type="number" defaultValue="0" required />
          </Field>
          <Field label="Image URL" className="lg:col-span-3">
            <Input name="image" placeholder="https://... or /image.jpg" />
          </Field>
          <Field label="Or upload image to Supabase bucket pic" className="lg:col-span-3">
            <Input name="imageFile" type="file" accept="image/*" />
          </Field>
          <Field label="Description" className="lg:col-span-6">
            <Textarea name="description" placeholder="Collection description" className="min-h-24" required />
          </Field>
          <div className="lg:col-span-6">
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Collection
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border p-3 sm:p-6">
        <h2 className="font-serif text-2xl font-semibold mb-4">Collections Table</h2>
        <div className="w-full overflow-x-auto rounded-md border md:border-0">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    <div className="relative h-20 w-16 overflow-hidden rounded bg-secondary">
                      <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="min-w-64 whitespace-normal">
                    <form id={`collection-${collection.id}`} action={updateAdminCollection} encType="multipart/form-data" className="space-y-3">
                      <input type="hidden" name="originalId" defaultValue={collection.id} />
                      <Label className="text-xs text-muted-foreground">ID / slug</Label>
                      <Input name="id" defaultValue={collection.id} required />
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input name="name" defaultValue={collection.name} required />
                      <Label className="text-xs text-muted-foreground">Items label</Label>
                      <Input name="items" defaultValue={collection.items} required />
                    </form>
                  </TableCell>
                  <TableCell className="min-w-80 whitespace-normal">
                    <Textarea form={`collection-${collection.id}`} name="description" defaultValue={collection.description} className="min-h-32" required />
                  </TableCell>
                  <TableCell className="min-w-80 whitespace-normal">
                    <div className="space-y-3">
                      <Input form={`collection-${collection.id}`} name="image" defaultValue={collection.image} required />
                      <Input form={`collection-${collection.id}`} name="imageFile" type="file" accept="image/*" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input form={`collection-${collection.id}`} name="sortOrder" type="number" defaultValue={collection.sortOrder} className="w-24" required />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button form={`collection-${collection.id}`} type="submit" size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <form action={deleteAdminCollection}>
                        <input type="hidden" name="id" defaultValue={collection.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  )
}

function ProductSectionAdmin({ collections, description, label, products, section }: { collections: CollectionItem[]; description: string; label: string; products: ProductDetailData[]; section: ProductSection }) {
  const activeProductCount = products.filter((product) => product.isActive).length
  const featuredLimitReached = section !== "general" && activeProductCount >= FEATURED_PRODUCT_LIMIT

  return (
    <>
      <section className="rounded-lg border p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-semibold">Add {label}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          {section !== "general" ? (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Active products: {activeProductCount}/{FEATURED_PRODUCT_LIMIT}
            </p>
          ) : null}
        </div>
        {featuredLimitReached ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This home section already has {FEATURED_PRODUCT_LIMIT} active products. Deactivate or delete one before adding another active product.
          </div>
        ) : (
          <ProductForm collections={collections} formId={`new-product-${section}`} section={section} />
        )}
      </section>

      <section className="rounded-lg border p-3 sm:p-6">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-semibold">{label} Table</h2>
          <p className="text-sm text-muted-foreground">{products.length} product{products.length === 1 ? "" : "s"}</p>
        </div>
        <div className="w-full overflow-x-auto rounded-md border md:border-0">
          <Table className="min-w-[1180px]">
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Collections</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-24 w-20 overflow-hidden rounded bg-secondary">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="min-w-72 whitespace-normal">
                    <ProductForm collections={collections} formId={`product-${product.id}`} product={product} section={section} compact canActivate={section === "general" || product.isActive || activeProductCount < FEATURED_PRODUCT_LIMIT} />
                  </TableCell>
                  <TableCell className="min-w-80 whitespace-normal">
                    <ProductImageFields formId={`product-${product.id}`} product={product} />
                  </TableCell>
                  <TableCell className="min-w-64 whitespace-normal">
                    <CollectionCheckboxes collections={collections} formId={`product-${product.id}`} selectedIds={product.collectionIds} />
                  </TableCell>
                  <TableCell className="min-w-80 whitespace-normal">
                    <ProductTextAreas formId={`product-${product.id}`} product={product} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button form={`product-${product.id}`} type="submit" size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <form action={deleteAdminProduct}>
                        <input type="hidden" name="id" defaultValue={product.id} />
                        <Button type="submit" size="sm" variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  )
}

function ProductForm({ canActivate = true, collections, compact = false, formId, product, section }: { canActivate?: boolean; collections: CollectionItem[]; compact?: boolean; formId: string; product?: ProductDetailData; section: ProductSection }) {
  return (
    <form id={formId} action={product ? updateAdminProduct : createAdminProduct} encType="multipart/form-data" className={compact ? "space-y-3" : "grid gap-4 lg:grid-cols-6"}>
      {product ? <input type="hidden" name="originalId" defaultValue={product.id} /> : null}
      <input type="hidden" name="section" value={section} />
      <Field label="ID / slug" className={compact ? undefined : "lg:col-span-2"}>
        <Input name="id" defaultValue={product?.id} placeholder="classic-suit" required />
      </Field>
      <Field label="Name" className={compact ? undefined : "lg:col-span-2"}>
        <Input name="name" defaultValue={product?.name} placeholder="Classic Suit" required />
      </Field>
      <Field label="Price" className={compact ? undefined : "lg:col-span-1"}>
        <Input name="price" type="number" step="0.01" defaultValue={product?.price ?? 0} required />
      </Field>
      <Field label="Sort" className={compact ? undefined : "lg:col-span-1"}>
        <Input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} required />
      </Field>
      <Field label="Display category label" className={compact ? undefined : "lg:col-span-3"}>
        <Input name="categoryLabel" defaultValue={product?.category === "Product" ? "" : product?.category} placeholder="Suits" />
      </Field>
      <Field label="Active" className={compact ? undefined : "lg:col-span-3"}>
        <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
          <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} disabled={!canActivate} />
          Show this product on the site
        </label>
        {!canActivate ? <p className="mt-1 text-xs text-destructive">Limit reached. Deactivate another active product first.</p> : null}
      </Field>
      {!compact ? (
        <>
          <ProductImageFields formId={formId} product={product} inline />
          <Field label="Tagged collections" className="lg:col-span-6">
            <CollectionCheckboxes collections={collections} selectedIds={product?.collectionIds ?? []} />
          </Field>
          <ProductTextAreas formId={formId} product={product} inline />
          <div className="lg:col-span-6">
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </>
      ) : null}
    </form>
  )
}

function ProductImageFields({ formId, inline = false, product }: { formId?: string; inline?: boolean; product?: ProductDetailData }) {
  const className = inline ? "lg:col-span-6 grid gap-4 lg:grid-cols-2" : "space-y-3"
  return (
    <div className={className}>
      <Field label="Main image URL">
        <Input form={formId} name="mainImage" defaultValue={product?.image} placeholder="https://... or /image.jpg" />
      </Field>
      <Field label="Or upload main image">
        <Input form={formId} name="mainImageFile" type="file" accept="image/*" />
      </Field>
      <Field label="Gallery image URLs (one per line)">
        <Textarea form={formId} name="galleryImages" defaultValue={product?.images.slice(1).join("\n")} className="min-h-24" />
      </Field>
      <Field label="Upload gallery images">
        <Input form={formId} name="galleryImageFiles" type="file" accept="image/*" multiple />
      </Field>
    </div>
  )
}

function ProductTextAreas({ formId, inline = false, product }: { formId?: string; inline?: boolean; product?: ProductDetailData }) {
  const className = inline ? "lg:col-span-6 grid gap-4 lg:grid-cols-3" : "space-y-3"
  return (
    <div className={className}>
      <Field label="Description">
        <Textarea form={formId} name="description" defaultValue={product?.description} className="min-h-28" required />
      </Field>
      <Field label="Details (one per line)">
        <Textarea form={formId} name="details" defaultValue={product?.details.join("\n")} className="min-h-28" required />
      </Field>
      <Field label="Sizes (one per line or comma separated)">
        <Textarea form={formId} name="sizes" defaultValue={product?.sizes.join("\n")} className="min-h-28" placeholder="S\nM\nL" required />
      </Field>
    </div>
  )
}

function CollectionCheckboxes({ collections, formId, selectedIds }: { collections: CollectionItem[]; formId?: string; selectedIds: string[] }) {
  if (!collections.length) {
    return <p className="text-sm text-muted-foreground">No collections yet. Products can stay untagged.</p>
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {collections.map((collection) => (
        <label key={collection.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <input form={formId} name="collectionIds" type="checkbox" value={collection.id} defaultChecked={selectedIds.includes(collection.id)} />
          {collection.name}
        </label>
      ))}
    </div>
  )
}

function AdminLoginPage({ error }: { error: boolean }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold mb-2">Admin</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter the admin password to manage collections and products.</p>
          <form action={loginToAdmin} className="space-y-4">
            <div>
              <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              {error ? <p className="mt-2 text-sm text-destructive">Incorrect password. Please try again.</p> : null}
            </div>
            <Button type="submit" className="w-full">
              Unlock Admin
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

function Field({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}
