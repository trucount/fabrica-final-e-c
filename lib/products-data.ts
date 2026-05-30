export type ProductSection = "general" | "new_arrivals" | "best_sellers"

export type ProductSummary = {
  id: string
  name: string
  price: number
  image: string
  category: string
  section: ProductSection
  collectionIds: string[]
  sortOrder: number
  isActive: boolean
}

export type ProductDetailData = ProductSummary & {
  images: string[]
  description: string
  details: string[]
  sizes: string[]
}

export type ProductInput = {
  id: string
  name: string
  price: number
  mainImage: string
  galleryImages: string[]
  categoryLabel: string
  description: string
  details: string[]
  sizes: string[]
  section: ProductSection
  collectionIds: string[]
  sortOrder: number
  isActive: boolean
}

type ProductRow = {
  id: string
  name: string
  price: number
  main_image_url: string
  gallery_image_urls: unknown
  category_label: string | null
  description: string
  details: unknown
  sizes: unknown
  section: string
  collection_ids: unknown
  sort_order: number
  is_active: boolean
}

export const PRODUCT_SECTIONS: ProductSection[] = ["general", "new_arrivals", "best_sellers"]
export const FEATURED_PRODUCT_LIMIT = 4

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel.")
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
  }
}

export async function getProducts(options: { section?: ProductSection; collection?: string; search?: string; includeInactive?: boolean; limit?: number } = {}) {
  const config = getSupabaseConfig()
  const params = new URLSearchParams()
  params.set("select", "*")
  params.set("order", "sort_order.asc,name.asc")

  if (options.limit) {
    params.set("limit", String(options.limit))
  }

  if (!options.includeInactive) {
    params.set("is_active", "eq.true")
  }

  if (options.section) {
    params.set("section", `eq.${options.section}`)
  }

  if (options.collection) {
    params.set("collection_ids", `cs.{${escapeArrayValue(options.collection)}}`)
  }

  if (options.search) {
    const search = escapeFilterValue(options.search)
    params.set("or", `(name.ilike.*${search}*,description.ilike.*${search}*,category_label.ilike.*${search}*)`)
  }

  const response = await fetch(`${config.url}/rest/v1/products?${params.toString()}`, {
    headers: getSupabaseHeaders(config.serviceRoleKey),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load products from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as ProductRow[]
  return rows.map(parseProductRow)
}

export async function getProduct(id: string) {
  const config = getSupabaseConfig()
  const response = await fetch(
    `${config.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}&is_active=eq.true&select=*&limit=1`,
    {
      headers: getSupabaseHeaders(config.serviceRoleKey),
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to load product from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as ProductRow[]
  return rows[0] ? parseProductRow(rows[0]) : null
}


export async function upsertProduct(product: ProductInput) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/products`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(config.serviceRoleKey),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: product.id,
      name: product.name,
      price: product.price,
      main_image_url: product.mainImage,
      gallery_image_urls: product.galleryImages,
      category_label: product.categoryLabel || null,
      description: product.description,
      details: product.details,
      sizes: product.sizes,
      section: product.section,
      collection_ids: product.collectionIds,
      sort_order: product.sortOrder,
      is_active: product.isActive,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save product: ${await response.text()}`)
  }
}

export async function deleteProduct(id: string) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getSupabaseHeaders(config.serviceRoleKey),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete product: ${await response.text()}`)
  }
}

export async function uploadProductImage(file: File, productId: string, slot: string) {
  const config = getSupabaseConfig()
  const extension = getFileExtension(file.name)
  const objectPath = `products/${productId}/${slot}-${Date.now()}${extension}`
  const response = await fetch(`${config.url}/storage/v1/object/pic/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload product image: ${await response.text()}`)
  }

  return `${config.url}/storage/v1/object/public/pic/${objectPath}`
}

function parseProductRow(row: ProductRow): ProductDetailData {
  const galleryImages = getStringArray(row.gallery_image_urls)
  const mainImage = getString(row, "main_image_url")
  const categoryLabel = typeof row.category_label === "string" ? row.category_label.trim() : ""

  return {
    id: getString(row, "id"),
    name: getString(row, "name"),
    price: getNumber(row, "price"),
    image: mainImage,
    images: [mainImage, ...galleryImages.filter((image) => image !== mainImage)],
    category: categoryLabel || "Product",
    description: getString(row, "description"),
    details: getStringArray(row.details),
    sizes: getStringArray(row.sizes),
    section: getProductSection(row.section),
    collectionIds: getStringArray(row.collection_ids),
    sortOrder: getNumber(row, "sort_order"),
    isActive: Boolean(row.is_active),
  }
}

function getSupabaseHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  }
}

function getProductSection(value: string): ProductSection {
  if (PRODUCT_SECTIONS.includes(value as ProductSection)) {
    return value as ProductSection
  }

  throw new Error(`Supabase products field "section" is invalid.`)
}

function getFileExtension(fileName: string) {
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : ""
  return extension.replace(/[^a-zA-Z0-9.]/g, "")
}

function getString(row: Record<string, unknown>, key: string) {
  const value = row[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase products field "${key}" is required.`)
  }

  return value
}

function getNumber(row: Record<string, unknown>, key: string) {
  const value = row[key]

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Supabase products field "${key}" must be a number.`)
  }

  return value
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : []
}

function escapeArrayValue(value: string) {
  return value.replace(/["\\]/g, "")
}

function escapeFilterValue(value: string) {
  return value.replace(/[*,()]/g, "").trim()
}
