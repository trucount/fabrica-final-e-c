import { NextResponse } from "next/server"
import { supabaseRecoverPassword } from "@/lib/commerce-server"

export async function POST(request: Request) {
  try {
    const { email, redirectTo } = await request.json()
    await supabaseRecoverPassword(email, redirectTo)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send reset email." }, { status: 500 })
  }
}
