export type CollectionItem = {
  id: string
  name: string
  description: string
  image: string
  items: string
  sortOrder: number
}

type CollectionRow = {
  id: string
  name: string
  description: string
  image_url: string
  item_count_label: string
  sort_order: number
}

export type CollectionInput = {
  id: string
  name: string
  description: string
  image: string
  items: string
  sortOrder: number
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to Vercel.")
  }

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
  }
}

export async function getCollections(): Promise<CollectionItem[]> {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/collections?select=*&order=sort_order.asc,name.asc`, {
    headers: getSupabaseHeaders(config.anonKey),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load collections from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as CollectionRow[]
  return rows.map(parseCollectionRow)
}

export async function upsertCollection(collection: CollectionInput) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/collections`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(config.anonKey),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      image_url: collection.image,
      item_count_label: collection.items,
      sort_order: collection.sortOrder,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save collection: ${await response.text()}`)
  }
}

export async function deleteCollection(id: string) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/collections?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getSupabaseHeaders(config.anonKey),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete collection: ${await response.text()}`)
  }
}

export async function uploadCollectionImage(file: File, collectionId: string) {
  const config = getSupabaseConfig()
  const extension = getFileExtension(file.name)
  const objectPath = `collections/${collectionId}-${Date.now()}${extension}`
  const response = await fetch(`${config.url}/storage/v1/object/pic/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload collection image: ${await response.text()}`)
  }

  return `${config.url}/storage/v1/object/public/pic/${objectPath}`
}

function parseCollectionRow(row: CollectionRow): CollectionItem {
  return {
    id: getString(row, "id"),
    name: getString(row, "name"),
    description: getString(row, "description"),
    image: getString(row, "image_url"),
    items: getString(row, "item_count_label"),
    sortOrder: getNumber(row, "sort_order"),
  }
}

function getSupabaseHeaders(anonKey: string) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  }
}

function getFileExtension(fileName: string) {
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : ""
  return extension.replace(/[^a-zA-Z0-9.]/g, "")
}

function getString(row: Record<string, unknown>, key: string) {
  const value = row[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase collections field "${key}" is required.`)
  }

  return value
}

function getNumber(row: Record<string, unknown>, key: string) {
  const value = row[key]

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Supabase collections field "${key}" must be a number.`)
  }

  return value
}
