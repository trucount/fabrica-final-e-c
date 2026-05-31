import { NextResponse } from "next/server"
import { getAboutContent } from "@/lib/about-content"
import { getInfoPageContent, INFO_PAGE_SLUGS } from "@/lib/info-page-content"
import { getSiteContent } from "@/lib/site-content"

const MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "openrouter/owl-alpha",
  "deepseek/deepseek-v4-flash:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
]

type ChatMessage = { role: "user" | "assistant" | "system"; content: string }

type StoreContext = Awaited<ReturnType<typeof loadStoreContext>>

function flattenContext(data: StoreContext) {
  const lines = [
    `Business: ${data.site.brandName}`,
    `About: ${data.about.heroTitle}. ${data.about.heroSubtitle}. ${data.about.storyTitle}: ${data.about.storyParagraphs.join(" ")}`,
    `About values: ${data.about.values.map((value) => `${value.title}: ${value.description}`).join(" | ")}`,
    ...data.pages.map(({ slug, content }) => `${slug}: ${content.title}. ${content.description}. ${content.body.join(" ")}${content.contact ? ` Contact links: Instagram ${content.contact.instagram}, WhatsApp ${content.contact.whatsapp}, Facebook ${content.contact.facebook}, phone ${content.contact.phone}, email ${content.contact.email}.` : ""}`),
  ]

  return lines.join("\n")
}

async function loadStoreContext() {
  const [site, about, pages] = await Promise.all([
    getSiteContent(),
    getAboutContent(),
    Promise.all(INFO_PAGE_SLUGS.map(async (slug) => ({ slug, content: await getInfoPageContent(slug) }))),
  ])

  return { site, about, pages }
}

async function askOpenRouter(messages: ChatMessage[], context: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.")

  const system = `You are the helpful ecommerce assistant for this business. Use only the store context below. Format replies clearly with short paragraphs, bullets, and markdown links when contact URLs are relevant. Only answer questions about about information, policies, shipping, returns, privacy, terms, and contact options. Do not answer product or catalog questions; instead, say you can help with store information and contact options.\n\nSTORE CONTEXT:\n${context}`
  let lastError = "OpenRouter request failed."

  for (const model of MODELS) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Store information assistant",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, ...messages.slice(-10)],
        temperature: 0.4,
      }),
    })

    if (response.ok) {
      const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
      const content = payload.choices?.[0]?.message?.content?.trim()
      if (content) return { content, model }
    } else {
      lastError = await response.text()
    }
  }

  throw new Error(lastError)
}

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages?: ChatMessage[] }
    const safeMessages = Array.isArray(messages) ? messages.filter((message) => message.role !== "system" && typeof message.content === "string") : []
    const context = flattenContext(await loadStoreContext())
    return NextResponse.json(await askOpenRouter(safeMessages, context))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The assistant is unavailable right now." }, { status: 500 })
  }
}
