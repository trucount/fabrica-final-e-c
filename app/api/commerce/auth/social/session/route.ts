import { NextResponse } from "next/server"
import { completeSupabaseSocialLogin } from "@/lib/commerce-server"

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json()
    if (typeof accessToken !== "string" || !accessToken) {
      return NextResponse.json({ error: "Missing social login access token." }, { status: 400 })
    }

    const user = await completeSupabaseSocialLogin(accessToken)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to finish social login." }, { status: 401 })
  }
}
