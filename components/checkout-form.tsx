"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useCart } from "./cart-provider"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Lock } from "lucide-react"

interface CheckoutFormProps {
  total: number
}

export function CheckoutForm({ total }: CheckoutFormProps) {
  const router = useRouter()
  const { clearCart } = useCart()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    // Contact
    email: "",
    // Shipping
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    country: "",
    state: "",
    zipCode: "",
    phone: "",
    // Payment
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Save order to localStorage (in production, this would be an API call)
    const order = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      total,
      status: "processing",
      shipping: formData,
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    localStorage.setItem("orders", JSON.stringify([order, ...existingOrders]))

    clearCart()
    toast({
      title: "Order placed successfully!",
      description: `Order #${order.id}`,
    })

    router.push("/profile?tab=orders")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Contact Information */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Contact Information</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Shipping Address</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm">
              Address
            </Label>
            <Input
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="apartment" className="text-sm">
              Apartment, suite, etc. (optional)
            </Label>
            <Input
              id="apartment"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="city" className="text-sm">
                City
              </Label>
              <Input id="city" name="city" required value={formData.city} onChange={handleChange} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="state" className="text-sm">
                State / Province
              </Label>
              <Input
                id="state"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="country" className="text-sm">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="zipCode" className="text-sm">
                ZIP / Postal Code
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                required
                value={formData.zipCode}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Payment Information</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="cardNumber" className="text-sm">
              Card Number
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="cardNumber"
                name="cardNumber"
                required
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="cardName" className="text-sm">
              Name on Card
            </Label>
            <Input
              id="cardName"
              name="cardName"
              required
              value={formData.cardName}
              onChange={handleChange}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="expiryDate" className="text-sm">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                required
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                maxLength={5}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="cvv" className="text-sm">
                CVV
              </Label>
              <Input
                id="cvv"
                name="cvv"
                required
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="border-t border-border pt-4 sm:pt-6">
        <Button type="submit" size="lg" className="w-full h-12 sm:h-14 text-sm sm:text-base" disabled={isProcessing}>
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Complete Order - ${total.toFixed(2)}
            </span>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Your payment information is secure and encrypted
        </p>
      </div>
    </form>
  )
}
