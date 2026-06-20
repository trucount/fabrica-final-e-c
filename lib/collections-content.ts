export type CollectionsContent = {
  title: string
  description: string
  featuredTitle: string
  featuredDescription: string
}

const COLLECTIONS_CONTENT_ID = "collections"

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

export async function getCollectionsContent(): Promise<CollectionsContent> {
  const config = getSupabaseConfig()
  const response = await fetch(
    `${config.url}/rest/v1/site_content?id=eq.${COLLECTIONS_CONTENT_ID}&select=content&limit=1`,
    {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
      cache: "no-store",
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to load collections content from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{ content: unknown }>

  if (!rows[0]) {
    throw new Error('Collections content row was not found in Supabase. Run supabase/page-content.sql to seed id "collections".')
  }

  return parseCollectionsContent(rows[0].content)
}

export async function saveCollectionsContent(content: CollectionsContent) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/site_content`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: COLLECTIONS_CONTENT_ID,
      content: parseCollectionsContent(content),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save collections content: ${await response.text()}`)
  }
}

function parseCollectionsContent(content: unknown): CollectionsContent {
  if (!isRecord(content)) {
    throw new Error("Supabase collections content is missing or invalid.")
  }

  const parsedContent = {
    title: getString(content, "title"),
    description: getString(content, "description"),
    featuredTitle: getString(content, "featuredTitle"),
    featuredDescription: getString(content, "featuredDescription"),
  }

  return parsedContent
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase collections content field "${key}" is required.`)
  }

  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
