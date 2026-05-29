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

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroTitle: "About Thudarum",
  heroSubtitle: "Crafting timeless elegance for the modern gentleman",
  storyTitle: "Our Story",
  storyParagraphs: [
    'Founded with a vision to redefine modern menswear, Thudarum represents the perfect marriage of traditional craftsmanship and contemporary design. Our name, derived from the Tamil word meaning "continuation," embodies our commitment to carrying forward the legacy of fine tailoring into the modern era.',
    "Every piece in our collection is meticulously crafted using premium Italian fabrics and constructed by master tailors who have honed their craft over decades. We believe that true luxury lies not in excess, but in the perfect balance of form, function, and timeless style.",
    "Our double-breasted suits and blazers are designed for the discerning gentleman who appreciates quality, understands elegance, and values garments that will remain relevant for years to come.",
  ],
  valuesTitle: "Our Values",
  values: [
    {
      title: "Craftsmanship",
      description:
        "Every garment is constructed with meticulous attention to detail by skilled artisans who take pride in their work.",
    },
    {
      title: "Quality",
      description:
        "We source only the finest materials from renowned Italian mills, ensuring durability and comfort in every piece.",
    },
    {
      title: "Timelessness",
      description:
        "Our designs transcend fleeting trends, offering styles that remain elegant and relevant season after season.",
    },
  ],
  ctaTitle: "Experience Thudarum",
  ctaDescription:
    "Discover our latest collection of meticulously crafted suits and blazers designed for the modern gentleman.",
}

const ABOUT_CONTENT_ID = "about"

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
  }
}

function normalizeAboutContent(content: Partial<AboutContent> | null | undefined): AboutContent {
  return {
    ...DEFAULT_ABOUT_CONTENT,
    ...content,
    storyParagraphs: content?.storyParagraphs?.length
      ? content.storyParagraphs
      : DEFAULT_ABOUT_CONTENT.storyParagraphs,
    values: DEFAULT_ABOUT_CONTENT.values.map((defaultValue, index) => ({
      ...defaultValue,
      ...content?.values?.[index],
    })),
  }
}

export async function getAboutContent(): Promise<AboutContent> {
  const config = getSupabaseConfig()

  if (!config) {
    return DEFAULT_ABOUT_CONTENT
  }

  try {
    const response = await fetch(
      `${config.url}/rest/v1/site_content?id=eq.${ABOUT_CONTENT_ID}&select=content&limit=1`,
      {
        headers: {
          apikey: config.serviceRoleKey,
          Authorization: `Bearer ${config.serviceRoleKey}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("Failed to load about content from Supabase", await response.text())
      return DEFAULT_ABOUT_CONTENT
    }

    const rows = (await response.json()) as Array<{ content: Partial<AboutContent> }>

    return normalizeAboutContent(rows[0]?.content)
  } catch (error) {
    console.error("Failed to load about content", error)
    return DEFAULT_ABOUT_CONTENT
  }
}

export async function saveAboutContent(content: AboutContent) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel.")
  }

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
      content,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save about content: ${await response.text()}`)
  }
}
