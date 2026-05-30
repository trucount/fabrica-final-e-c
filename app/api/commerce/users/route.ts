import { NextResponse } from "next/server"
import { upsertCommerceUser } from "@/lib/commerce-server"

export async function PUT(request: Request) {
  try {
    const user = await request.json()
    return NextResponse.json(await upsertCommerceUser(user))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update profile." }, { status: 500 })
  }
}
