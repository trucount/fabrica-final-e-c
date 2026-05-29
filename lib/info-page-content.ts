export type InfoPageSlug = "contact" | "shipping" | "returns" | "privacy" | "terms"

export type InfoPageContent = {
  title: string
  description: string
  body: string[]
}

export const INFO_PAGE_SLUGS: InfoPageSlug[] = ["contact", "shipping", "returns", "privacy", "terms"]

function getContentId(slug: InfoPageSlug) {
  return `page:${slug}`
}

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

export function parseInfoPageSlug(slug: string): InfoPageSlug {
  if (INFO_PAGE_SLUGS.includes(slug as InfoPageSlug)) {
    return slug as InfoPageSlug
  }

  throw new Error(`Unsupported editable page: ${slug}`)
}

export async function getInfoPageContent(slug: InfoPageSlug): Promise<InfoPageContent> {
  const config = getSupabaseConfig()
  const id = getContentId(slug)
  const response = await fetch(`${config.url}/rest/v1/site_content?id=eq.${id}&select=content&limit=1`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load ${slug} content from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{ content: unknown }>

  if (!rows[0]) {
    throw new Error(`${slug} content row was not found in Supabase. Run supabase/page-content.sql to seed id "${id}".`)
  }

  return parseInfoPageContent(rows[0].content)
}

export async function saveInfoPageContent(slug: InfoPageSlug, content: InfoPageContent) {
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
      id: getContentId(slug),
      content: parseInfoPageContent(content),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save ${slug} content: ${await response.text()}`)
  }
}

function parseInfoPageContent(content: unknown): InfoPageContent {
  if (!isRecord(content)) {
    throw new Error("Supabase page content is missing or invalid.")
  }

  const body = content.body

  if (!Array.isArray(body) || body.some((item) => typeof item !== "string" || !item.trim()) || !body.length) {
    throw new Error('Supabase page content field "body" must be a non-empty string array.')
  }

  return {
    title: getString(content, "title"),
    description: getString(content, "description"),
    body,
  }
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase page content field "${key}" is required.`)
  }

  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
