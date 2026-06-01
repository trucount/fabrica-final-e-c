import { NextResponse } from "next/server"
import { getShippoShippingRates } from "@/lib/commerce-server"

export async function POST(request: Request) {
  try {
    const { address, items, userEmail } = await request.json()
    if (!address || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Address and cart items are required for shipping rates." }, { status: 400 })
    }

    return NextResponse.json(await getShippoShippingRates(address, items, userEmail))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load shipping rates." }, { status: 500 })
  }
}
