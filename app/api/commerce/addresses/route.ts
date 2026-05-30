import { NextResponse } from "next/server"
import { getCommerceAddresses, saveCommerceAddresses } from "@/lib/commerce-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 })
    return NextResponse.json(await getCommerceAddresses(userId))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load addresses." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, addresses } = await request.json()
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 })
    return NextResponse.json(await saveCommerceAddresses(userId, addresses))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save addresses." }, { status: 500 })
  }
}
