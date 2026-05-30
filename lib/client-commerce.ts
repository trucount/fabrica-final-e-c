import type { CartItem } from "@/components/cart-provider"

export type CouponKind = "universal" | "one_time"
export type DiscountType = "percent" | "amount"
export type PaymentMethod = "cod" | "razorpay"
export type OrderStatus = "placed" | "packed" | "in_transit" | "delivered"

export type CommerceUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  password: string
}

export type SavedAddress = {
  id: string
  label: string
  firstName: string
  lastName: string
  phone: string
  address: string
  apartment: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export type Coupon = {
  code: string
  label: string
  type: CouponKind
  discountType: DiscountType
  discountValue: number
  active: boolean
}

export type OrderPolicies = {
  shippingAmount: number
  freeShippingThreshold: number
  taxRate: number
  coupons: Coupon[]
}

export type OrderTotals = {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  coupon?: Coupon
}

export type CustomerOrder = {
  id: string
  userEmail: string
  date: string
  items: CartItem[]
  shipping: SavedAddress
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentVerified: boolean
  razorpayPaymentId?: string
  totals: OrderTotals
}

export const MAX_SAVED_ADDRESSES = 3

export const defaultPolicies: OrderPolicies = {
  shippingAmount: 15,
  freeShippingThreshold: 200,
  taxRate: 8,
  coupons: [
    { code: "WELCOME10", label: "Welcome 10%", type: "universal", discountType: "percent", discountValue: 10, active: true },
    { code: "SAVE20", label: "Save ₹20", type: "universal", discountType: "amount", discountValue: 20, active: true },
    { code: "LUXURY15", label: "Luxury 15%", type: "one_time", discountType: "percent", discountValue: 15, active: true },
  ],
}

export const orderStatuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "placed", label: "Placed" },
  { value: "packed", label: "Packed" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
]

export function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function safeWrite<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

export function getCurrentUser() {
  return safeRead<CommerceUser | null>("currentUser", null)
}

export function getUsers() {
  return safeRead<CommerceUser[]>("commerceUsers", [])
}

export function saveCurrentUser(user: CommerceUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    safeWrite("currentUser", user)
    window.localStorage.setItem("userProfile", JSON.stringify(user))
  } else {
    window.localStorage.removeItem("currentUser")
  }
}

export function getPolicies() {
  return safeRead<OrderPolicies>("orderPolicies", defaultPolicies)
}

export function savePolicies(policies: OrderPolicies) {
  safeWrite("orderPolicies", policies)
}

export function getAddresses(userEmail?: string) {
  const key = userEmail ? `addresses:${userEmail}` : "addresses"
  return safeRead<SavedAddress[]>(key, [])
}

export function saveAddresses(addresses: SavedAddress[], userEmail?: string) {
  const key = userEmail ? `addresses:${userEmail}` : "addresses"
  safeWrite(key, addresses)
  if (userEmail === getCurrentUser()?.email) {
    safeWrite("addresses", addresses)
  }
}

export function getOrders() {
  return safeRead<CustomerOrder[]>("orders", [])
}

export function saveOrders(orders: CustomerOrder[]) {
  safeWrite("orders", orders)
}

export function calculateTotals(subtotal: number, policies = getPolicies(), couponCode?: string): OrderTotals {
  const coupon = policies.coupons.find((item) => item.active && item.code.toUpperCase() === couponCode?.toUpperCase())
  const rawDiscount = coupon
    ? coupon.discountType === "percent"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue
    : 0
  const discount = Math.min(subtotal, Math.max(0, rawDiscount))
  const subtotalAfterDiscount = subtotal - discount
  const shipping = subtotalAfterDiscount >= policies.freeShippingThreshold ? 0 : Math.max(0, policies.shippingAmount)
  const tax = (subtotalAfterDiscount * Math.max(0, policies.taxRate)) / 100

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total: subtotalAfterDiscount + shipping + tax,
    coupon,
  }
}

export function consumeOneTimeCoupon(code?: string) {
  if (!code) return
  const policies = getPolicies()
  const coupon = policies.coupons.find((item) => item.code.toUpperCase() === code.toUpperCase())

  if (coupon?.type !== "one_time") return

  savePolicies({
    ...policies,
    coupons: policies.coupons.filter((item) => item.code.toUpperCase() !== code.toUpperCase()),
  })
}
