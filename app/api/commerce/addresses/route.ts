import { NextResponse } from "next/server"
import { getCommerceAddresses, saveCommerceAddresses } from "@/lib/commerce-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const userEmail = searchParams.get("userEmail") ?? undefined
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 })
    return NextResponse.json(await getCommerceAddresses(userId, userEmail))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load addresses." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, userEmail, addresses } = await request.json()
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 })
    return NextResponse.json(await saveCommerceAddresses(userId, addresses, userEmail))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save addresses." }, { status: 500 })
  }
}
