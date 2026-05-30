import crypto from "node:crypto"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay secret is not configured." }, { status: 500 })
  }

  const body = (await request.json()) as {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
  }

  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: "Missing Razorpay verification fields." }, { status: 400 })
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest("hex")

  if (expectedSignature !== body.razorpay_signature) {
    return NextResponse.json({ error: "Razorpay payment verification failed." }, { status: 400 })
  }

  return NextResponse.json({ verified: true, paymentId: body.razorpay_payment_id })
}
