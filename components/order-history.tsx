"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Package, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { type CustomerOrder, getCurrentUser, getOrders, orderStatuses } from "@/lib/client-commerce"

export function OrderHistory() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    setOrders(getOrders().filter((order) => !user || order.userEmail === user.email))
  }, [])

  if (!orders.length) {
    return (
      <div className="text-center py-16 border border-border">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-serif text-2xl font-semibold mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6">When you place orders, they will appear here.</p>
        <Button asChild><Link href="/shop">Start Shopping</Link></Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Order History</h2>
      {orders.map((order) => {
        const status = orderStatuses.find((item) => item.value === order.status)?.label ?? order.status
        return (
          <Link key={order.id} href={`/order/${order.id}`} className="group block border border-border p-4 sm:p-6 hover:bg-secondary/40 transition-colors">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium">{order.id}</h3>
                <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                <p className="mt-1 text-sm text-muted-foreground">{order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize">{status}</span>
                <span className="font-medium">{formatCurrency(order.totals.total)}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
