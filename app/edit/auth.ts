import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { EDIT_SESSION_COOKIE } from "./constants"

export async function hasEditPageAccess() {
  const cookieStore = await cookies()

  return cookieStore.get(EDIT_SESSION_COOKIE)?.value === "authenticated" && (await isSameScopeReferer("/edit"))
}

export async function requireEditPageAccess(destination: string) {
  if (!(await hasEditPageAccess())) {
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
