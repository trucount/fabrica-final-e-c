export type ShopContent = {
  title: string
}

const SHOP_CONTENT_ID = "shop"

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

export async function getShopContent(): Promise<ShopContent> {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/site_content?id=eq.${SHOP_CONTENT_ID}&select=content&limit=1`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load shop content from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{ content: unknown }>

  if (!rows[0]) {
    throw new Error('Shop content row was not found in Supabase. Run supabase/page-content.sql to seed id "shop".')
  }

  return parseShopContent(rows[0].content)
}

export async function saveShopContent(content: ShopContent) {
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
      id: SHOP_CONTENT_ID,
      content: parseShopContent(content),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save shop content: ${await response.text()}`)
  }
}

function parseShopContent(content: unknown): ShopContent {
  if (!isRecord(content)) {
    throw new Error("Supabase shop content is missing or invalid.")
  }

  return {
    title: getString(content, "title"),
  }
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase shop content field "${key}" is required.`)
  }

  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
