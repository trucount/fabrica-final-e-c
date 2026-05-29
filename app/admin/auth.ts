import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_SESSION_COOKIE } from "./constants"

export async function hasAdminPageAccess() {
  const cookieStore = await cookies()

  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === "authenticated" && (await isSameScopeReferer("/admin"))
}

export async function requireAdminPageAccess(destination = "/admin?error=auth") {
  if (!(await hasAdminPageAccess())) {
    redirect(destination)
  }
}

async function isSameScopeReferer(scopePath: string) {
  const headerStore = await headers()
  const referer = headerStore.get("referer")

  if (!referer) {
    return false
  }

  try {
    const refererUrl = new URL(referer)
    const currentHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host")

    if (currentHost && refererUrl.host !== currentHost) {
      return false
    }

    return refererUrl.pathname === scopePath || refererUrl.pathname.startsWith(`${scopePath}/`)
  } catch {
    return false
  }
}
