import { NextResponse } from "next/server"
import { getCommerceUserByEmail, supabaseAuthSignUp, upsertCommerceUser } from "@/lib/commerce-server"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password, redirectTo } = await request.json()
    const generatedId = crypto.randomUUID()
    const auth = await supabaseAuthSignUp({ id: generatedId, firstName, lastName, email, phone }, password, redirectTo)
    const existingUser = auth.id ? null : await getCommerceUserByEmail(email)
    const user = existingUser ?? await upsertCommerceUser({ id: auth.id ?? generatedId, firstName, lastName, email, phone })

    return NextResponse.json({
      user,
      emailVerified: auth.emailVerified,
      pendingVerification: !auth.emailVerified,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 500 })
  }
}
