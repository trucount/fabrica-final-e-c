import { NextResponse } from "next/server"
import { getSiteContent } from "@/lib/site-content"

export async function GET() {
  const siteContent = await getSiteContent()

  return NextResponse.json(siteContent)
}
