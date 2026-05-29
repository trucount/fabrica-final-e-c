import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { EDIT_SESSION_COOKIE } from "./constants"

export async function hasEditPageAccess() {
  const cookieStore = await cookies()

  return cookieStore.get(EDIT_SESSION_COOKIE)?.value === "authenticated"
}

export async function requireEditPageAccess(destination: string) {
  if (!(await hasEditPageAccess())) {
    redirect(destination)
  }
}
