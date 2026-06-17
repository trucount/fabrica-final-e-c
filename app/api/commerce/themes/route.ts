import { NextResponse } from "next/server"
import { getCommerceThemes, saveCommerceTheme, deleteCommerceTheme } from "@/lib/commerce-server"

export async function GET() {
  try {
    return NextResponse.json(await getCommerceThemes())
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load themes." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const theme = await request.json()
    return NextResponse.json(await saveCommerceTheme(theme))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save theme." }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) throw new Error("Theme ID is required.")
    await deleteCommerceTheme(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete theme." }, { status: 500 })
  }
}
