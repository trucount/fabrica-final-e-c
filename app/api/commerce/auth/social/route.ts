import { NextResponse } from "next/server"
import { getSupabaseSocialAuthUrl, type SupabaseSocialProvider } from "@/lib/commerce-server"

const socialProviders = new Set<SupabaseSocialProvider>(["clerk", "google", "github"])

function cleanNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/profile"
  return value
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const provider = requestUrl.searchParams.get("provider")?.toLowerCase() as SupabaseSocialProvider | null

    if (!provider || !socialProviders.has(provider)) {
      return NextResponse.redirect(new URL("/login?error=unsupported-social-provider", requestUrl.origin))
    }

    const next = cleanNext(requestUrl.searchParams.get("next"))
    const callbackUrl = new URL("/auth/callback", requestUrl.origin)
    callbackUrl.searchParams.set("next", next)

    return NextResponse.redirect(getSupabaseSocialAuthUrl(provider, callbackUrl.toString()))
  } catch (error) {
    const requestUrl = new URL(request.url)
    const loginUrl = new URL("/login", requestUrl.origin)
    loginUrl.searchParams.set("error", error instanceof Error ? error.message : "Unable to start social login.")
    return NextResponse.redirect(loginUrl)
  }
}
