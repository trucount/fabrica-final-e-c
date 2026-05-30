import { NextResponse } from "next/server"
import { createCommerceOrder, getCommerceOrders, updateCommerceOrderStatus } from "@/lib/commerce-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    return NextResponse.json(await getCommerceOrders(searchParams.get("email") ?? undefined, searchParams.get("id") ?? undefined))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load orders." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { order, userId } = await request.json()
    await createCommerceOrder(order, userId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save order." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()
    await updateCommerceOrderStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update order." }, { status: 500 })
  }
}
