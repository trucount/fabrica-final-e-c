"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { type CustomerOrder, loadOrders, orderStatuses } from "@/lib/client-commerce"
import type { SiteContent } from "@/lib/site-content"
import { Download, Printer } from "lucide-react"
import { generateOrderPdfHtml } from "@/lib/pdf-generator"

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>()
  const [order, setOrder] = useState<CustomerOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [brandName, setBrandName] = useState("")

  useEffect(() => {
    loadOrders({ id: params.id })
      .then((orders) => {
        setOrder(orders[0] ?? null)
        setError("")
      })
      .catch((error) => setError(error instanceof Error ? error.message : "Order could not be loaded."))
      .finally(() => setIsLoading(false))

    fetch("/api/site-content")
      .then((response) => response.ok ? response.json() as Promise<SiteContent> : null)
      .then((content) => setBrandName(content?.brandName ?? ""))
      .catch(() => undefined)
  }, [params.id])

  const printOrder = () => window.print()
  const downloadPdf = () => {
    if (!order) return

    const htmlContent = generateOrderPdfHtml(order, brandName || "Store", statusLabel)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.print()
      setTimeout(() => printWindow.close(), 250)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen"><div className="print:hidden"><Header /></div><main className="container mx-auto px-4 py-16">Loading order...</main></div>
  }

  if (error) {
    return <div className="min-h-screen"><Header /><main className="container mx-auto px-4 py-16"><h1 className="font-serif text-4xl font-semibold">Order unavailable</h1><p className="mt-3 text-sm text-destructive">{error}</p><Button asChild className="mt-6"><Link href="/profile?tab=orders">Back to Orders</Link></Button></main></div>
  }

  if (!order) {
    return <div className="min-h-screen"><Header /><main className="container mx-auto px-4 py-16"><h1 className="font-serif text-4xl font-semibold">Order not found</h1><Button asChild className="mt-6"><Link href="/profile?tab=orders">Back to Orders</Link></Button></main></div>
  }

  const statusLabel = orderStatuses.find((status) => status.value === order.status)?.label ?? order.status

  return (
    <div className="min-h-screen bg-secondary/20 print:bg-white">
      <div className="print:hidden"><Header /></div>
      <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-10 print:max-w-none print:px-0 print:py-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Receipt</p>
            <h1 className="font-serif text-3xl font-semibold sm:text-5xl">Order Summary</h1>
            <p className="mt-1 text-sm text-muted-foreground">{order.id}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" onClick={printOrder}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button onClick={downloadPdf}><Download className="mr-2 h-4 w-4" />Download PDF</Button>
          </div>
        </div>

        <section id="order-receipt" className="overflow-hidden rounded-2xl border bg-background shadow-sm print:rounded-none print:border-0 print:shadow-none">
          <div className="bg-foreground p-5 text-background sm:p-8 print:bg-white print:text-black">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-serif text-3xl font-semibold">{brandName || "Store"}</p>
                <p className="mt-2 text-sm opacity-80">Thank you for your order. Keep this receipt for your records.</p>
              </div>
              <div className="rounded-xl bg-background/10 p-4 text-sm print:border print:bg-white">
                <p className="opacity-70">Order ID</p>
                <p className="font-semibold">{order.id}</p>
                <p className="mt-3 opacity-70">Placed on</p>
                <p className="font-semibold">{new Date(order.date).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="p-5 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoCard label="Status" value={statusLabel} />
                <InfoCard label="Payment" value={`${order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"} · ${order.paymentVerified ? "Verified" : "Pending"}`} />
                <InfoCard label="Items" value={`${order.items.reduce((sum, item) => sum + item.quantity, 0)} total`} />
              </div>

              <div className="mt-8">
                <h2 className="font-serif text-2xl font-semibold">Order Items</h2>
                <div className="mt-4 divide-y rounded-xl border">
                  {order.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 p-4">
                      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary print:hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Size {item.size} · Qty {item.quantity} · {formatCurrency(item.price)} each</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="border-t bg-secondary/40 p-5 sm:p-8 lg:border-l lg:border-t-0 print:bg-white">
              <h2 className="font-serif text-2xl font-semibold">Ship To</h2>
              <div className="mt-4 rounded-xl border bg-background p-4 text-sm leading-6">
                <p className="font-semibold text-foreground">{order.shipping.firstName} {order.shipping.lastName}</p>
                <p>{order.shipping.phone}</p>
                <p>{order.shipping.address}</p>
                {order.shipping.apartment ? <p>{order.shipping.apartment}</p> : null}
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}</p>
                <p>{order.shipping.country}</p>
              </div>

              <h2 className="mt-8 font-serif text-2xl font-semibold">Totals</h2>
              <div className="mt-4 space-y-3 rounded-xl border bg-background p-4 text-sm">
                <SummaryRow label="Subtotal" value={formatCurrency(order.totals.subtotal)} />
                <SummaryRow label="Discount" value={`-${formatCurrency(order.totals.discount)}`} />
                <SummaryRow label="Shipping" value={order.totals.shipping === 0 ? "Free" : formatCurrency(order.totals.shipping)} />
                <SummaryRow label="Tax" value={formatCurrency(order.totals.tax)} />
                <div className="border-t pt-3">
                  <SummaryRow label="Total" value={formatCurrency(order.totals.total)} strong />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-secondary/40 p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? "font-serif text-xl font-semibold" : ""}`}><span className="text-muted-foreground">{label}</span><span>{value}</span></div>
}



