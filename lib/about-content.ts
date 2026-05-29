export type AboutValueContent = {
  title: string
  description: string
}

export type AboutContent = {
  heroTitle: string
  heroSubtitle: string
  storyTitle: string
  storyParagraphs: string[]
  valuesTitle: string
  values: AboutValueContent[]
  ctaTitle: string
  ctaDescription: string
}

const ABOUT_CONTENT_ID = "about"

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

function parseAboutContent(content: unknown): AboutContent {
  if (!isRecord(content)) {
    throw new Error("Supabase about content is missing or invalid.")
  }

  const parsedContent = {
    heroTitle: getString(content, "heroTitle"),
    heroSubtitle: getString(content, "heroSubtitle"),
    storyTitle: getString(content, "storyTitle"),
    storyParagraphs: getStringArray(content, "storyParagraphs"),
    valuesTitle: getString(content, "valuesTitle"),
    values: getValues(content, "values"),
    ctaTitle: getString(content, "ctaTitle"),
    ctaDescription: getString(content, "ctaDescription"),
  }

  if (!parsedContent.storyParagraphs.length) {
    throw new Error("Supabase about content must include at least one story paragraph.")
  }

  if (!parsedContent.values.length) {
    throw new Error("Supabase about content must include at least one value item.")
  }

  return parsedContent
}

export async function getAboutContent(): Promise<AboutContent> {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/site_content?id=eq.${ABOUT_CONTENT_ID}&select=content&limit=1`, {
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to load about content from Supabase: ${await response.text()}`)
  }

  const rows = (await response.json()) as Array<{ content: unknown }>

  if (!rows[0]) {
    throw new Error('About content row was not found in Supabase. Run supabase/about-content.sql to seed id "about".')
  }

  return parseAboutContent(rows[0].content)
}

export async function saveAboutContent(content: AboutContent) {
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
      id: ABOUT_CONTENT_ID,
      content: parseAboutContent(content),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save about content: ${await response.text()}`)
  }
}

function getString(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Supabase about content field "${key}" is required.`)
  }

  return value
}

function getStringArray(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`Supabase about content field "${key}" must be a non-empty string array.`)
  }

  return value
}

function getValues(content: Record<string, unknown>, key: string) {
  const value = content[key]

  if (!Array.isArray(value)) {
    throw new Error(`Supabase about content field "${key}" must be an array.`)
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Supabase about content value item ${index + 1} is invalid.`)
    }

    return {
      title: getString(item, "title"),
      description: getString(item, "description"),
    }
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
