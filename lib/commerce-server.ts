import type { CartItem } from "@/components/cart-provider"
import type { CommerceUser, Coupon, CustomerOrder, OrderPolicies, OrderStatus, SavedAddress } from "@/lib/client-commerce"

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel.")
  }

  return { url: url.replace(/\/$/, ""), serviceRoleKey, anonKey }
}

function headers(token: string, extra: HeadersInit = {}) {
  return {
    apikey: token,
    Authorization: `Bearer ${token}`,
    ...extra,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function numberValue(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function requireString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function mapUser(row: Record<string, unknown>): CommerceUser {
  return {
    id: requireString(row.id),
    email: requireString(row.email),
    firstName: requireString(row.first_name),
    lastName: requireString(row.last_name),
    phone: requireString(row.phone),
  }
}

function mapAddress(row: Record<string, unknown>): SavedAddress {
  return {
    id: requireString(row.id),
    label: requireString(row.label),
    firstName: requireString(row.first_name),
    lastName: requireString(row.last_name),
    phone: requireString(row.phone),
    address: requireString(row.address),
    apartment: requireString(row.apartment),
    city: requireString(row.city),
    state: requireString(row.state),
    zipCode: requireString(row.zip_code),
    country: requireString(row.country, "India"),
    isDefault: Boolean(row.is_default),
  }
}

function mapCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: requireString(row.code),
    label: requireString(row.label),
    type: requireString(row.coupon_type) === "one_time" ? "one_time" : "universal",
    discountType: requireString(row.discount_type) === "amount" ? "amount" : "percent",
    discountValue: numberValue(row.discount_value),
    active: Boolean(row.active),
  }
}

function mapOrder(row: Record<string, unknown>): CustomerOrder {
  const items = Array.isArray(row.order_items) ? row.order_items : []
  const totals = isRecord(row.totals) ? row.totals : {}
  const shipping = isRecord(row.shipping_address) ? row.shipping_address : {}

  return {
    id: requireString(row.id),
    userEmail: requireString(row.user_email),
    date: requireString(row.created_at),
    items: items.filter(isRecord).map((item) => ({
      id: requireString(item.product_id),
      name: requireString(item.product_name),
      image: requireString(item.product_image),
      size: requireString(item.size),
      quantity: numberValue(item.quantity, 1),
      price: numberValue(item.unit_price),
    })) as CartItem[],
    shipping: {
      id: requireString(shipping.id),
      label: requireString(shipping.label),
      firstName: requireString(shipping.firstName),
      lastName: requireString(shipping.lastName),
      phone: requireString(shipping.phone),
      address: requireString(shipping.address),
      apartment: requireString(shipping.apartment),
      city: requireString(shipping.city),
      state: requireString(shipping.state),
      zipCode: requireString(shipping.zipCode),
      country: requireString(shipping.country, "India"),
      isDefault: Boolean(shipping.isDefault),
    },
    status: requireString(row.status, "placed") as OrderStatus,
    paymentMethod: requireString(row.payment_method) === "razorpay" ? "razorpay" : "cod",
    paymentVerified: Boolean(row.payment_verified),
    razorpayPaymentId: requireString(row.razorpay_payment_id) || undefined,
    totals: {
      subtotal: numberValue(totals.subtotal),
      discount: numberValue(totals.discount),
      shipping: numberValue(totals.shipping),
      tax: numberValue(totals.tax),
      total: numberValue(totals.total),
      coupon: isRecord(totals.coupon) ? mapCoupon(totals.coupon) : undefined,
    },
  }
}

async function rest(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: headers(config.serviceRoleKey, init.headers),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response
}

export async function getCommercePolicies(): Promise<OrderPolicies> {
  const [policyResponse, couponsResponse] = await Promise.all([
    rest("order_policies?id=eq.true&select=*&limit=1"),
    rest("coupons?select=*&order=created_at.asc"),
  ])
  const policyRows = (await policyResponse.json()) as Array<Record<string, unknown>>
  const couponRows = (await couponsResponse.json()) as Array<Record<string, unknown>>
  const policy = policyRows[0] ?? {}

  return {
    shippingAmount: numberValue(policy.shipping_amount, 15),
    freeShippingThreshold: numberValue(policy.free_shipping_threshold, 200),
    taxRate: numberValue(policy.tax_rate, 8),
    coupons: couponRows.map(mapCoupon),
  }
}

export async function saveCommercePolicies(policies: OrderPolicies) {
  await rest("order_policies", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: true, shipping_amount: policies.shippingAmount, free_shipping_threshold: policies.freeShippingThreshold, tax_rate: policies.taxRate, updated_at: new Date().toISOString() }),
  })

  const normalizedCoupons = policies.coupons.map((coupon) => ({
    code: coupon.code.toUpperCase(),
    label: coupon.label,
    coupon_type: coupon.type,
    discount_type: coupon.discountType,
    discount_value: coupon.discountValue,
    active: coupon.active,
    updated_at: new Date().toISOString(),
  }))

  if (normalizedCoupons.length) {
    await rest("coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(normalizedCoupons),
    })

    const keepCodes = normalizedCoupons.map((coupon) => coupon.code).join(",")
    await rest(`coupons?code=not.in.(${keepCodes})`, { method: "DELETE" })
  } else {
    await rest("coupons?code=neq.__keep_none__", { method: "DELETE" })
  }
}

export async function getCommerceOrders(email?: string, id?: string) {
  const params = new URLSearchParams()
  params.set("select", "*,order_items(*)")
  params.set("order", "created_at.desc")
  if (email) params.set("user_email", `eq.${email}`)
  if (id) params.set("id", `eq.${id}`)
  const response = await rest(`orders?${params.toString()}`)
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows.map(mapOrder)
}

export async function createCommerceOrder(order: CustomerOrder, userId?: string) {
  await rest("orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: order.id,
      user_id: userId || null,
      user_email: order.userEmail,
      status: order.status,
      payment_method: order.paymentMethod,
      payment_verified: order.paymentVerified,
      razorpay_payment_id: order.razorpayPaymentId ?? null,
      coupon_code: order.totals.coupon?.code ?? null,
      shipping_address: order.shipping,
      totals: order.totals,
      created_at: order.date,
      updated_at: new Date().toISOString(),
    }),
  })

  if (order.items.length) {
    await rest("order_items", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(order.items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      }))),
    })
  }
}

export async function updateCommerceOrderStatus(id: string, status: OrderStatus) {
  await rest(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  })
}

export async function upsertCommerceUser(user: CommerceUser) {
  const response = await rest("app_users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ id: user.id, email: user.email, first_name: user.firstName, last_name: user.lastName, phone: user.phone, updated_at: new Date().toISOString() }),
  })
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows[0] ? mapUser(rows[0]) : user
}

export async function getCommerceUserByEmail(email: string) {
  const response = await rest(`app_users?email=eq.${encodeURIComponent(email)}&select=*&limit=1`)
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows[0] ? mapUser(rows[0]) : null
}

export async function getCommerceAddresses(userId: string) {
  const response = await rest(`saved_addresses?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.asc`)
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows.map(mapAddress)
}

export async function saveCommerceAddresses(userId: string, addresses: SavedAddress[]) {
  await rest(`saved_addresses?user_id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" })
  if (!addresses.length) return []
  const response = await rest("saved_addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(addresses.map((address) => ({
      id: address.id,
      user_id: userId,
      label: address.label,
      first_name: address.firstName,
      last_name: address.lastName,
      phone: address.phone,
      address: address.address,
      apartment: address.apartment,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode,
      country: address.country,
      is_default: address.isDefault,
      updated_at: new Date().toISOString(),
    }))),
  })
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows.map(mapAddress)
}

export async function supabaseAuthSignUp(user: CommerceUser, password: string, redirectTo?: string) {
  const config = getSupabaseConfig()
  if (!config.anonKey) throw new Error("Supabase anon key is not configured. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  const response = await fetch(`${config.url}/auth/v1/signup${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password, data: { first_name: user.firstName, last_name: user.lastName, phone: user.phone } }),
  })
  if (!response.ok) throw new Error(await response.text())
  const payload = (await response.json()) as { user?: { id?: string; email_confirmed_at?: string | null } | null }
  const authUserId = payload.user?.id
  if (!authUserId) throw new Error("Supabase Auth did not return a user id.")
  return { id: authUserId, emailVerified: Boolean(payload.user?.email_confirmed_at) }
}

export async function supabaseAuthLogin(email: string, password: string) {
  const config = getSupabaseConfig()
  if (!config.anonKey) throw new Error("Supabase anon key is not configured. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(await response.text())
  const payload = (await response.json()) as { user?: { id?: string; email?: string } }
  return payload.user
}

export async function supabaseRecoverPassword(email: string, redirectTo?: string) {
  const config = getSupabaseConfig()
  if (!config.anonKey) throw new Error("Supabase anon key is not configured. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  const response = await fetch(`${config.url}/auth/v1/recover${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`, {
    method: "POST",
    headers: { apikey: config.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!response.ok) throw new Error(await response.text())
}
