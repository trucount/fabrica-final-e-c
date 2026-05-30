"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { type CustomerOrder, getOrders, orderStatuses } from "@/lib/client-commerce"
import { Download, Printer } from "lucide-react"

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<CustomerOrder | null>(null)

  useEffect(() => {
    setOrder(getOrders().find((item) => item.id === params.id) ?? null)
  }, [params.id])

  const printOrder = () => window.print()
  const downloadPdf = () => window.print()

  if (!order) {
    return <div className="min-h-screen"><Header /><main className="container mx-auto px-4 py-16"><h1 className="font-serif text-4xl font-semibold">Order not found</h1><Button asChild className="mt-6"><Link href="/profile?tab=orders">Back to Orders</Link></Button></main></div>
  }

  const statusLabel = orderStatuses.find((status) => status.value === order.status)?.label ?? order.status

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 print:max-w-none">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div><h1 className="font-serif text-4xl font-semibold">Order Details</h1><p className="text-sm text-muted-foreground">{order.id}</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={printOrder}><Printer className="mr-2 h-4 w-4" />Print</Button><Button onClick={downloadPdf}><Download className="mr-2 h-4 w-4" />Download PDF</Button></div>
        </div>

        <section className="rounded-lg border p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Order</p><p className="font-medium">{order.id}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><p className="font-medium">{statusLabel}</p></div>
            <div><p className="text-sm text-muted-foreground">Date</p><p className="font-medium">{new Date(order.date).toLocaleString()}</p></div>
            <div><p className="text-sm text-muted-foreground">Payment</p><p className="font-medium">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"} / {order.paymentVerified ? "Verified" : "Pending"}</p></div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="font-serif text-2xl font-semibold mb-3">Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => <div key={`${item.id}-${item.size}`} className="flex justify-between gap-4 text-sm"><span>{item.name} ({item.size}) × {item.quantity}</span><span>{formatCurrency(item.price * item.quantity)}</span></div>)}
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="font-serif text-2xl font-semibold mb-3">Shipping Address</h2>
            <p className="text-sm text-muted-foreground">{order.shipping.firstName} {order.shipping.lastName}, {order.shipping.address}, {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}, {order.shipping.country}</p>
          </div>

          <div className="mt-6 border-t pt-6 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.totals.subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(order.totals.discount)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.totals.shipping === 0 ? "Free" : formatCurrency(order.totals.shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(order.totals.tax)}</span></div>
            <div className="flex justify-between border-t pt-2 font-serif text-xl font-semibold"><span>Total</span><span>{formatCurrency(order.totals.total)}</span></div>
          </div>
        </section>
      </main>
    </div>
  )
}
