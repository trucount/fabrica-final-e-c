export type SiteContent = {
  brandName: string
  tickerMessages: string[]
}

const SITE_CONTENT_ID = "site"

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

export async function getSiteContent(): Promise<SiteContent> {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/site_content?id=eq.${SITE_CONTENT_ID}&select=content&limit=1`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load site content from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{ content: unknown }>

  if (!rows[0]) {
    throw new Error('Site content row was not found in Supabase. Run supabase/page-content.sql to seed id "site".')
  }

  return parseSiteContent(rows[0].content)
}

export async function saveSiteContent(content: SiteContent) {
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
      id: SITE_CONTENT_ID,
      content: parseSiteContent(content),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save site content: ${await response.text()}`)
  }
}

function parseSiteContent(content: unknown): SiteContent {
  if (!isRecord(content)) {
    throw new Error("Supabase site content is missing or invalid.")
  }

  const tickerMessages = content.tickerMessages

  if (!Array.isArray(tickerMessages) || tickerMessages.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error('Supabase site content field "tickerMessages" must be a non-empty string array.')
  }

  if (!tickerMessages.length) {
    throw new Error('Supabase site content field "tickerMessages" must include at least one message.')
  }

  return {
    brandName: getString(content, "brandName"),
    tickerMessages,
  }
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase site content field "${key}" is required.`)
  }

  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
