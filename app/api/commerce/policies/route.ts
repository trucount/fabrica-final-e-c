import { NextResponse } from "next/server"
import { getCommercePolicies, saveCommercePolicies } from "@/lib/commerce-server"

export async function GET() {
  try {
    return NextResponse.json(await getCommercePolicies())
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load policies." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const policies = await request.json()
    await saveCommercePolicies(policies)
    return NextResponse.json(await getCommercePolicies())
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save policies." }, { status: 500 })
  }
}
