import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/app/admin/constants"

const DEFAULT_UMAMI_WEBSITE_ID = "c20d65b2-a78a-44f3-9d1b-62abfcb63d56"
const DEFAULT_UMAMI_ENDPOINT = "https://api.umami.is/v1"

type UmamiPoint = {
  x: string
  y: number
}

type UmamiStats = {
  pageviews?: number
  visitors?: number
  visits?: number
  bounces?: number
  totaltime?: number
}

type UmamiPageviews = {
  pageviews?: UmamiPoint[]
  sessions?: UmamiPoint[]
}

type UmamiMetric = {
  x?: string
  y?: number
}

async function requireAdminApiAccess() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== "authenticated") {
    throw new Error("Admin access is required.")
  }
}

function getUmamiConfig() {
  const apiKey = process.env.UMAMI_API_KEY
  const endpoint = (process.env.UMAMI_API_CLIENT_ENDPOINT ?? DEFAULT_UMAMI_ENDPOINT).replace(/\/$/, "")
  const websiteId = process.env.UMAMI_WEBSITE_ID ?? DEFAULT_UMAMI_WEBSITE_ID

  if (!apiKey) {
    throw new Error("UMAMI_API_KEY is not configured.")
  }

  return { apiKey, endpoint, websiteId }
}

async function umamiFetch<T>(path: string, params: URLSearchParams, config: ReturnType<typeof getUmamiConfig>) {
  const url = `${config.endpoint}${path}?${params.toString()}`
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-umami-api-key": config.apiKey,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json() as Promise<T>
}

function metricParams(startAt: number, endAt: number, type: string) {
  const params = new URLSearchParams({
    startAt: String(startAt),
    endAt: String(endAt),
    type,
    limit: "8",
  })
  return params
}

export async function GET() {
  try {
    await requireAdminApiAccess()
    const config = getUmamiConfig()
    const endAt = Date.now()
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000
    const rangeParams = new URLSearchParams({ startAt: String(startAt), endAt: String(endAt) })
    const pageviewParams = new URLSearchParams({ startAt: String(startAt), endAt: String(endAt), unit: "day", timezone: "UTC" })

    const [stats, pageviews, paths, referrers, devices, countries] = await Promise.all([
      umamiFetch<UmamiStats>(`/websites/${config.websiteId}/stats`, rangeParams, config),
      umamiFetch<UmamiPageviews>(`/websites/${config.websiteId}/pageviews`, pageviewParams, config),
      umamiFetch<UmamiMetric[]>(`/websites/${config.websiteId}/metrics`, metricParams(startAt, endAt, "path"), config),
      umamiFetch<UmamiMetric[]>(`/websites/${config.websiteId}/metrics`, metricParams(startAt, endAt, "referrer"), config),
      umamiFetch<UmamiMetric[]>(`/websites/${config.websiteId}/metrics`, metricParams(startAt, endAt, "device"), config),
      umamiFetch<UmamiMetric[]>(`/websites/${config.websiteId}/metrics`, metricParams(startAt, endAt, "country"), config),
    ])

    return NextResponse.json({ stats, pageviews, paths, referrers, devices, countries })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load Umami analytics." }, { status: 500 })
  }
}
