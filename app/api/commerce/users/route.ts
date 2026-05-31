import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCommerceUsers, inviteCommerceUser, upsertCommerceUser } from "@/lib/commerce-server"
import { ADMIN_SESSION_COOKIE } from "@/app/admin/constants"

async function requireAdminApiAccess() {
  const cookieStore = await cookies()
  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== "authenticated") {
    throw new Error("Admin access is required.")
  }
}

export async function GET() {
  try {
    await requireAdminApiAccess()
    return NextResponse.json(await getCommerceUsers())
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load users." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiAccess()
    const origin = request.headers.get("origin") ?? undefined
    const input = await request.json()
    return NextResponse.json(await inviteCommerceUser({ ...input, redirectTo: origin ? `${origin}/login` : undefined }))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to invite user." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await request.json()
    return NextResponse.json(await upsertCommerceUser(user))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update profile." }, { status: 500 })
  }
}
