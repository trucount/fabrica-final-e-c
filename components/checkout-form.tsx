"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useCart } from "./cart-provider"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"
import {
  type OrderTotals,
  type PaymentMethod,
  type SavedAddress,
  MAX_SAVED_ADDRESSES,
  consumeOneTimeCoupon,
  getAddresses,
  getCurrentUser,
  getOrders,
  saveAddresses,
  saveOrders,
} from "@/lib/client-commerce"
import { Lock } from "lucide-react"


declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

async function loadRazorpay() {
  if (window.Razorpay) return true
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

async function runRazorpayPayment(amount: number) {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!key) {
    return `rzp_mock_${Date.now()}`
  }

  const loaded = await loadRazorpay()
  if (!loaded || !window.Razorpay) {
    throw new Error("Razorpay could not load. Please try COD or retry online payment.")
  }

  return new Promise<string>((resolve, reject) => {
    const RazorpayCheckout = window.Razorpay
    if (!RazorpayCheckout) {
      reject(new Error("Razorpay could not load. Please try COD or retry online payment."))
      return
    }
    const razorpay = new RazorpayCheckout({
      key,
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "Order Payment",
      description: "Secure online payment",
      handler: (response: { razorpay_payment_id?: string }) => resolve(response.razorpay_payment_id ?? `rzp_${Date.now()}`),
      modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
    })
    razorpay.open()
  })
}

const blankAddress = { label: "", firstName: "", lastName: "", phone: "", address: "", apartment: "", city: "", state: "", zipCode: "", country: "India", isDefault: false }

export function CheckoutForm({ totals }: { totals: OrderTotals }) {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("new")
  const [saveNewAddress, setSaveNewAddress] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [formData, setFormData] = useState(blankAddress)
  const user = getCurrentUser()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) return
    const saved = getAddresses(currentUser.email)
    setAddresses(saved)
    const defaultAddress = saved.find((address) => address.isDefault) ?? saved[0]
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id)
      setFormData(defaultAddress)
    } else {
      setFormData({ ...blankAddress, firstName: currentUser.firstName, lastName: currentUser.lastName, phone: currentUser.phone })
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddressId("new")
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const selectAddress = (id: string) => {
    setSelectedAddressId(id)
    const address = addresses.find((item) => item.id === id)
    if (address) setFormData(address)
  }

  const saveAddressIfNeeded = () => {
    if (!user || selectedAddressId !== "new" || !saveNewAddress) return formData as SavedAddress
    if (addresses.length >= MAX_SAVED_ADDRESSES) {
      throw new Error("You already have 3 saved addresses. Delete one from Profile before saving a new address.")
    }
    const newAddress: SavedAddress = { ...formData, id: crypto.randomUUID(), isDefault: !addresses.length }
    const nextAddresses = [...addresses, newAddress]
    saveAddresses(nextAddresses, user.email)
    return newAddress
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push("/login?next=/checkout")
      return
    }

    setIsProcessing(true)
    try {
      const shipping = saveAddressIfNeeded()
      let razorpayPaymentId: string | undefined
      let paymentVerified = paymentMethod === "cod"

      if (paymentMethod === "razorpay") {
        razorpayPaymentId = await runRazorpayPayment(totals.total)
        paymentVerified = true
      }

      const order = {
        id: `ORD-${Date.now()}`,
        userEmail: user.email,
        date: new Date().toISOString(),
        items,
        shipping,
        status: "placed" as const,
        paymentMethod,
        paymentVerified,
        razorpayPaymentId,
        totals,
      }

      saveOrders([order, ...getOrders()])
      consumeOneTimeCoupon(totals.coupon?.code)
      localStorage.removeItem("appliedCouponCode")
      clearCart()
      toast({ title: "Order placed successfully", description: `Order ${order.id} has been placed.` })
      router.push(`/order/${order.id}`)
    } catch (error) {
      toast({ title: "Checkout error", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Shipping Address</h2>
        {addresses.length ? (
          <div className="mb-4 space-y-2">
            <Label>Select saved address</Label>
            <Select value={selectedAddressId} onValueChange={selectAddress}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {addresses.map((address) => <SelectItem key={address.id} value={address.id}>{address.label} - {address.city}</SelectItem>)}
                <SelectItem value="new">Add new address</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"><Field label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} /><Field label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} /></div>
          <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
          <Field label="Address label" name="label" value={formData.label} onChange={handleChange} placeholder="Home / Office" />
          <Field label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
          <Field label="Apartment, suite, etc. (optional)" name="apartment" value={formData.apartment} onChange={handleChange} required={false} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"><Field label="City" name="city" value={formData.city} onChange={handleChange} /><Field label="State / Province" name="state" value={formData.state} onChange={handleChange} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"><Field label="Country" name="country" value={formData.country} onChange={handleChange} /><Field label="ZIP / Postal Code" name="zipCode" value={formData.zipCode} onChange={handleChange} /></div>
          {selectedAddressId === "new" ? <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={saveNewAddress} onChange={(event) => setSaveNewAddress(event.target.checked)} /> Save this address to my profile</label> : null}
          {selectedAddressId === "new" && addresses.length >= MAX_SAVED_ADDRESSES ? <p className="text-sm text-destructive">You have 3 saved addresses. Uncheck save or delete one in Profile first.</p> : null}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Payment Method</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-md border p-4"><input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Cash on Delivery</label>
          <label className="flex items-center gap-3 rounded-md border p-4"><input type="radio" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} /> Online via Razorpay</label>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Set NEXT_PUBLIC_RAZORPAY_KEY_ID in Vercel to enable live Razorpay checkout. Without it, the app uses a mock verified payment for testing.</p>
      </div>

      <div className="border-t border-border pt-4 sm:pt-6">
        <Button type="submit" size="lg" className="w-full h-12 sm:h-14 text-sm sm:text-base" disabled={isProcessing}>
          <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {isProcessing ? "Placing Order..." : `Place Order - ${formatCurrency(totals.total)}`}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, name, value, onChange, placeholder, required = true, type = "text" }: { label: string; name: string; value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; type?: string }) {
  return <div><Label htmlFor={name} className="text-sm">{label}</Label><Input id={name} name={name} type={type} required={required} value={value} onChange={onChange} placeholder={placeholder} className="mt-1.5" /></div>
}
