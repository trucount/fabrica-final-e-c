"use client"

import { Header } from "@/components/header"
import { CheckoutForm } from "@/components/checkout-form"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/currency"
import { calculateTotals, emptyPolicies, getCurrentUser, loadPolicies } from "@/lib/client-commerce"

export default function CheckoutPage() {
  const { items, total } = useCart()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [policies, setPolicies] = useState(emptyPolicies)
  const [policiesError, setPoliciesError] = useState("")
  const couponCode = typeof window !== "undefined" ? localStorage.getItem("appliedCouponCode") ?? undefined : undefined
  const totals = calculateTotals(total, policies, couponCode)

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/login?next=/checkout")
      return
    }

    loadPolicies()
      .then((nextPolicies) => {
        setPolicies(nextPolicies)
        setPoliciesError("")
        setReady(true)
      })
      .catch((error) => {
        setPoliciesError(error instanceof Error ? error.message : "Order policies could not be loaded.")
        setReady(true)
      })
  }, [router])

  if (!ready) return <div className="min-h-screen"><Header /><main className="container mx-auto px-4 py-16">Loading checkout...</main></div>

  if (policiesError) return <div className="min-h-screen"><Header /><main className="container mx-auto px-4 py-16"><h1 className="font-serif text-4xl font-semibold">Checkout unavailable</h1><p className="mt-3 text-sm text-destructive">{policiesError}</p><Button asChild className="mt-6"><Link href="/cart">Back to Cart</Link></Button></main></div>

  if (items.length === 0) {
    return (
      <div className="min-h-screen"><Header /><div className="container mx-auto px-4 md:px-6 py-16 md:py-24"><div className="max-w-2xl mx-auto text-center"><h1 className="font-serif text-4xl font-semibold mb-4">Checkout</h1><p className="text-muted-foreground mb-8">Your cart is empty</p><Button asChild size="lg"><Link href="/shop">Continue Shopping</Link></Button></div></div></div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <Button variant="ghost" asChild className="mb-4"><Link href="/cart"><ArrowLeft className="h-4 w-4 mr-2" />Back to Cart</Link></Button>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 sm:mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="order-2 lg:order-1"><CheckoutForm totals={totals} /></div>
          <div className="order-1 lg:order-2">
            <div className="border border-border p-4 sm:p-6 lg:sticky lg:top-24 rounded-none">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Order Summary</h2>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <div className="relative w-14 sm:w-16 h-16 sm:h-20 bg-secondary flex-shrink-0 overflow-hidden"><Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" /></div>
                    <div className="flex-1 min-w-0"><h3 className="text-sm font-medium mb-1 truncate">{item.name}</h3><p className="text-xs text-muted-foreground">Size: {item.size}</p><p className="text-xs text-muted-foreground">Qty: {item.quantity}</p><p className="text-sm font-medium mt-1">{formatCurrency(item.price * item.quantity)}</p></div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 sm:pt-4 space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatCurrency(totals.subtotal)}</span></div>
                {totals.discount ? <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span className="font-medium">-{formatCurrency(totals.discount)}</span></div> : null}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-medium">{formatCurrency(totals.tax)}</span></div>
              </div>
              <div className="border-t border-border pt-3 sm:pt-4"><div className="flex justify-between font-serif text-lg sm:text-xl font-semibold"><span>Total</span><span>{formatCurrency(totals.total)}</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
