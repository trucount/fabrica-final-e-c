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

export const emptyPolicies: OrderPolicies = {
  shippingAmount: 0,
  freeShippingThreshold: 0,
  taxRate: 0,
  coupons: [],
}

export const orderStatuses: Array<{ value: OrderStatus; label: string }> = [
  { value: "placed", label: "Placed" },
  { value: "packed", label: "Packed" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
]

export function getCurrentUser() {
  if (typeof window === "undefined") return null

  const value = window.localStorage.getItem("currentUser")
  return value ? (JSON.parse(value) as CommerceUser) : null
}

export function saveCurrentUser(user: CommerceUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    window.localStorage.setItem("currentUser", JSON.stringify(user))
    window.localStorage.setItem("userProfile", JSON.stringify(user))
  } else {
    window.localStorage.removeItem("currentUser")
    window.localStorage.removeItem("userProfile")
  }
}

export function calculateTotals(subtotal: number, policies: OrderPolicies, couponCode?: string): OrderTotals {
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

async function commerceFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? "Commerce request failed.")
  }

  return response.json() as Promise<T>
}

export async function loadPolicies() {
  return commerceFetch<OrderPolicies>("/api/commerce/policies")
}

export async function persistPolicies(policies: OrderPolicies) {
  return commerceFetch<OrderPolicies>("/api/commerce/policies", { method: "PUT", body: JSON.stringify(policies) })
}

export async function loadOrders(options: { email?: string; id?: string } = {}) {
  const params = new URLSearchParams()
  if (options.email) params.set("email", options.email)
  if (options.id) params.set("id", options.id)
  return commerceFetch<CustomerOrder[]>(`/api/commerce/orders${params.size ? `?${params.toString()}` : ""}`)
}

export async function persistOrder(order: CustomerOrder, userId?: string) {
  await commerceFetch<{ ok: true }>("/api/commerce/orders", { method: "POST", body: JSON.stringify({ order, userId }) })
}

export async function persistOrderStatus(id: string, status: OrderStatus) {
  await commerceFetch<{ ok: true }>("/api/commerce/orders", { method: "PATCH", body: JSON.stringify({ id, status }) })
}

export async function loadAddresses(userId: string, userEmail?: string) {
  const params = new URLSearchParams({ userId })
  if (userEmail) params.set("userEmail", userEmail)
  return commerceFetch<SavedAddress[]>(`/api/commerce/addresses?${params.toString()}`)
}

export async function persistAddresses(userId: string, addresses: SavedAddress[], userEmail?: string) {
  return commerceFetch<SavedAddress[]>("/api/commerce/addresses", { method: "PUT", body: JSON.stringify({ userId, userEmail, addresses }) })
}

export async function signupWithSupabase(input: Omit<CommerceUser, "id"> & { password: string; redirectTo?: string }) {
  const response = await commerceFetch<{ user: CommerceUser; emailVerified: boolean; pendingVerification: boolean }>("/api/commerce/auth/signup", { method: "POST", body: JSON.stringify(input) })
  if (response.emailVerified) saveCurrentUser(response.user)
  return response
}

export async function loginWithSupabase(email: string, password: string) {
  const response = await commerceFetch<{ user: CommerceUser }>("/api/commerce/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
  saveCurrentUser(response.user)
  return response.user
}

export async function updateCommerceProfile(user: CommerceUser) {
  const saved = await commerceFetch<CommerceUser>("/api/commerce/users", { method: "PUT", body: JSON.stringify(user) })
  saveCurrentUser(saved)
  return saved
}

export async function requestPasswordReset(email: string, redirectTo?: string) {
  await commerceFetch<{ ok: true }>("/api/commerce/auth/forgot-password", { method: "POST", body: JSON.stringify({ email, redirectTo }) })
}
