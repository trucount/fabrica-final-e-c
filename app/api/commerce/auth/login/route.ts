import { NextResponse } from "next/server"
import { getCommerceUserByEmail, supabaseAuthLogin, upsertCommerceUser } from "@/lib/commerce-server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const authUser = await supabaseAuthLogin(email, password)
    const existing = await getCommerceUserByEmail(email)
    const user = existing ?? await upsertCommerceUser({ id: authUser?.id ?? crypto.randomUUID(), email, firstName: "Customer", lastName: "", phone: "" })
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to login." }, { status: 401 })
  }
}
