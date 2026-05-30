export type HomeContent = {
  heroTitle: string
  heroSubtitle: string
  heroVideoUrl: string
  collectionsTitle: string
  newArrivalsTitle: string
  bestSellersTitle: string
  footerTagline: string
}

const HOME_CONTENT_ID = "home"

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

export async function getHomeContent(): Promise<HomeContent> {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/site_content?id=eq.${HOME_CONTENT_ID}&select=content&limit=1`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load home content from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{ content: unknown }>

  if (!rows[0]) {
    throw new Error('Home content row was not found in Supabase. Run supabase/page-content.sql to seed id "home".')
  }

  return parseHomeContent(rows[0].content)
}

export async function saveHomeContent(content: HomeContent) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/site_content`, {
    method: "POST",
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: HOME_CONTENT_ID,
      content: parseHomeContent(content),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save home content: ${await response.text()}`)
  }
}

function parseHomeContent(content: unknown): HomeContent {
  if (!isRecord(content)) {
    throw new Error("Supabase home content is missing or invalid.")
  }

  return {
    heroTitle: getString(content, "heroTitle"),
    heroSubtitle: getString(content, "heroSubtitle"),
    heroVideoUrl: getOptionalString(content, "heroVideoUrl", "https://www.youtube.com/embed/u9FEg5qur14?autoplay=1&mute=1&loop=1&playlist=u9FEg5qur14&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"),
    collectionsTitle: getString(content, "collectionsTitle"),
    newArrivalsTitle: getString(content, "newArrivalsTitle"),
    bestSellersTitle: getString(content, "bestSellersTitle"),
    footerTagline: getString(content, "footerTagline"),
  }
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase home content field "${key}" is required.`)
  }

  return value
}

function getOptionalString(content: Record<string, unknown>, key: string, fallback: string) {
  const value = content[key]
  return typeof value === "string" && value.trim() ? value : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
