import { NextResponse } from "next/server"
import { supabaseAuthSignUp, upsertCommerceUser } from "@/lib/commerce-server"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password, redirectTo } = await request.json()
    const auth = await supabaseAuthSignUp({ id: crypto.randomUUID(), firstName, lastName, email, phone }, password, redirectTo)
    const user = await upsertCommerceUser({ id: auth.id, firstName, lastName, email, phone })
    return NextResponse.json({ user, emailVerified: auth.emailVerified })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 500 })
  }
}
