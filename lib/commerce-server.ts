import type { CartItem } from "@/components/cart-provider"
import type { CommerceUser, Coupon, CustomerOrder, OrderPolicies, OrderStatus, SavedAddress, ShippingLabel, ShippingRateOption } from "@/lib/client-commerce"

export type SupabaseSocialProvider = "clerk" | "google" | "github"

type SupabaseAuthIdentity = {
  identity_data?: Record<string, unknown> | null
}

type SupabaseAuthUser = {
  id?: string
  email?: string
  user_metadata?: Record<string, unknown> | null
  identities?: SupabaseAuthIdentity[] | null
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return ""
}

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

function mapShippingRate(row: Record<string, unknown>): ShippingRateOption {
  return {
    id: requireString(row.id),
    provider: requireString(row.provider),
    serviceLevel: requireString(row.serviceLevel),
    amount: numberValue(row.amount),
    currency: requireString(row.currency, "INR"),
    estimatedDays: row.estimatedDays === undefined || row.estimatedDays === null ? undefined : numberValue(row.estimatedDays),
    durationTerms: requireString(row.durationTerms) || undefined,
  }
}

function mapShippingLabel(row: Record<string, unknown>): ShippingLabel {
  return {
    transactionId: requireString(row.transactionId),
    labelUrl: requireString(row.labelUrl) || undefined,
    trackingNumber: requireString(row.trackingNumber) || undefined,
    trackingUrlProvider: requireString(row.trackingUrlProvider) || undefined,
    status: requireString(row.status) || undefined,
    messages: Array.isArray(row.messages) ? row.messages.map((message) => String(message)) : undefined,
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
      id: requireString(item.product_id) || requireString(item.product_name),
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
      shippingOption: isRecord(totals.shippingOption) ? mapShippingRate(totals.shippingOption) : undefined,
      shippingLabel: isRecord(totals.shippingLabel) ? mapShippingLabel(totals.shippingLabel) : undefined,
    },
  }
}


function getShippoToken() {
  const token = process.env.SHIPPO_API_KEY ?? process.env.SHIPPO_TOKEN
  if (!token) throw new Error("Shippo is not configured. Add SHIPPO_API_KEY to your environment.")
  return token
}

function countryCode(country: string) {
  const normalized = country.trim().toLowerCase()
  const countries: Record<string, string> = { india: "IN", in: "IN", "united states": "US", usa: "US", us: "US" }
  return countries[normalized] ?? country.trim().toUpperCase()
}

function shippoFromAddress() {
  const name = process.env.SHIPPO_FROM_NAME
  const street1 = process.env.SHIPPO_FROM_STREET1
  const city = process.env.SHIPPO_FROM_CITY
  const state = process.env.SHIPPO_FROM_STATE
  const zip = process.env.SHIPPO_FROM_ZIP
  const country = process.env.SHIPPO_FROM_COUNTRY
  const phone = process.env.SHIPPO_FROM_PHONE
  const email = process.env.SHIPPO_FROM_EMAIL

  const missing = Object.entries({ SHIPPO_FROM_NAME: name, SHIPPO_FROM_STREET1: street1, SHIPPO_FROM_CITY: city, SHIPPO_FROM_STATE: state, SHIPPO_FROM_ZIP: zip, SHIPPO_FROM_COUNTRY: country, SHIPPO_FROM_PHONE: phone, SHIPPO_FROM_EMAIL: email })
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length) {
    throw new Error(`Shippo sender address is incomplete. Add ${missing.join(", ")} to your environment.`)
  }

  return {
    name,
    street1,
    city,
    state,
    zip,
    country: countryCode(country ?? ""),
    phone,
    email,
  }
}

function addressToShippo(address: SavedAddress, email?: string) {
  return {
    name: `${address.firstName} ${address.lastName}`.trim(),
    street1: address.address,
    street2: address.apartment || undefined,
    city: address.city,
    state: address.state,
    zip: address.zipCode,
    country: countryCode(address.country),
    phone: address.phone,
    email,
  }
}

function defaultParcel(items: CartItem[]) {
  const weightPerItem = Number(process.env.SHIPPO_PARCEL_WEIGHT_LB ?? "1")
  const quantity = Math.max(1, items.reduce((sum, item) => sum + item.quantity, 0))

  return {
    length: process.env.SHIPPO_PARCEL_LENGTH_IN ?? "10",
    width: process.env.SHIPPO_PARCEL_WIDTH_IN ?? "10",
    height: process.env.SHIPPO_PARCEL_HEIGHT_IN ?? "4",
    distance_unit: "in",
    weight: String(Math.max(0.1, weightPerItem * quantity)),
    mass_unit: "lb",
  }
}

async function shippoFetch<T>(path: string, init: RequestInit) {
  const response = await fetch(`https://api.goshippo.com/${path.replace(/^\//, "")}`, {
    ...init,
    headers: {
      Authorization: `ShippoToken ${getShippoToken()}`,
      "Content-Type": "application/json",
      "SHIPPO-API-VERSION": "2018-02-08",
      ...init.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || "Shippo request failed.")
  }

  return response.json() as Promise<T>
}

function mapShippoRate(rate: Record<string, unknown>): ShippingRateOption {
  const servicelevel = isRecord(rate.servicelevel) ? rate.servicelevel : {}
  return {
    id: requireString(rate.object_id),
    provider: requireString(rate.provider),
    serviceLevel: requireString(servicelevel.name) || requireString(servicelevel.token) || requireString(rate.servicelevel),
    amount: numberValue(rate.amount),
    currency: requireString(rate.currency, "INR"),
    estimatedDays: rate.estimated_days === undefined || rate.estimated_days === null ? undefined : numberValue(rate.estimated_days),
    durationTerms: requireString(rate.duration_terms) || undefined,
  }
}

export async function getShippoShippingRates(address: SavedAddress, items: CartItem[], userEmail?: string) {
  const policies = await getCommercePolicies()
  if (!policies.automaticShippingEnabled) return []

  const shipment = await shippoFetch<{ rates?: unknown[]; messages?: unknown[] }>("shipments/", {
    method: "POST",
    body: JSON.stringify({
      address_from: shippoFromAddress(),
      address_to: addressToShippo(address, userEmail),
      parcels: [defaultParcel(items)],
      async: false,
    }),
  })

  const rates = Array.isArray(shipment.rates) ? shipment.rates.filter(isRecord).map(mapShippoRate) : []
  return rates.sort((a, b) => a.amount - b.amount)
}

async function createShippoTransaction(rateId: string): Promise<ShippingLabel> {
  const transaction = await shippoFetch<Record<string, unknown>>("transactions", {
    method: "POST",
    body: JSON.stringify({ rate: rateId, async: false, label_file_type: process.env.SHIPPO_LABEL_FILE_TYPE ?? "PDF_4x6" }),
  })

  const messages = Array.isArray(transaction.messages)
    ? transaction.messages.map((message) => isRecord(message) ? requireString(message.text) : String(message)).filter(Boolean)
    : undefined

  if (requireString(transaction.object_state) === "INVALID") {
    throw new Error(messages?.join(" ") || "Shippo could not create the shipping label.")
  }

  return {
    transactionId: requireString(transaction.object_id),
    labelUrl: requireString(transaction.label_url) || undefined,
    trackingNumber: requireString(transaction.tracking_number) || undefined,
    trackingUrlProvider: requireString(transaction.tracking_url_provider) || undefined,
    status: requireString(transaction.status) || requireString(transaction.object_state) || undefined,
    messages,
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
    automaticShippingEnabled: Boolean(policy.automatic_shipping_enabled),
    coupons: couponRows.map(mapCoupon),
  }
}

export async function saveCommercePolicies(policies: OrderPolicies) {
  await rest("order_policies", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id: true, shipping_amount: policies.shippingAmount, free_shipping_threshold: policies.freeShippingThreshold, tax_rate: policies.taxRate, automatic_shipping_enabled: policies.automaticShippingEnabled, updated_at: new Date().toISOString() }),
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

async function resolveOrderUserId(email: string, userId?: string) {
  if (userId) {
    const response = await rest(`app_users?id=eq.${encodeURIComponent(userId)}&select=id&limit=1`)
    const rows = (await response.json()) as Array<Record<string, unknown>>
    if (rows[0]?.id) return requireString(rows[0].id)
  }

  const user = await getCommerceUserByEmail(email)
  return user?.id ?? null
}

async function resolveOrderCouponCode(code?: string) {
  if (!code) return null

  const response = await rest(`coupons?code=eq.${encodeURIComponent(code)}&select=code&limit=1`)
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows[0]?.code ? requireString(rows[0].code) : null
}

export async function createCommerceOrder(order: CustomerOrder, userId?: string) {
  const policies = await getCommercePolicies()
  if (policies.automaticShippingEnabled && order.paymentMethod === "cod") {
    throw new Error("Cash on Delivery is not available when automatic shipping is enabled.")
  }
  if (policies.automaticShippingEnabled && !order.totals.shippingOption?.id) {
    throw new Error("Please select a delivery option before placing your order.")
  }

  const [resolvedUserId, resolvedCouponCode, shippingLabel] = await Promise.all([
    resolveOrderUserId(order.userEmail, userId),
    resolveOrderCouponCode(order.totals.coupon?.code),
    policies.automaticShippingEnabled && order.paymentVerified && order.totals.shippingOption ? createShippoTransaction(order.totals.shippingOption.id) : Promise.resolve(undefined),
  ])

  await rest("orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: order.id,
      user_id: resolvedUserId,
      user_email: order.userEmail,
      status: order.status,
      payment_method: order.paymentMethod,
      payment_verified: order.paymentVerified,
      razorpay_payment_id: order.razorpayPaymentId ?? null,
      coupon_code: resolvedCouponCode,
      shipping_address: order.shipping,
      totals: shippingLabel ? { ...order.totals, shippingLabel } : order.totals,
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
        product_id: null,
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


export async function getCommerceUsers() {
  const response = await rest("app_users?select=*&order=created_at.desc")
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows.map(mapUser)
}

export async function inviteCommerceUser(input: { email: string; firstName?: string; lastName?: string; phone?: string; redirectTo?: string }) {
  const config = getSupabaseConfig()
  const email = input.email.trim().toLowerCase()
  if (!email) throw new Error("Email is required to invite a user.")

  const response = await fetch(`${config.url}/auth/v1/invite${input.redirectTo ? `?redirect_to=${encodeURIComponent(input.redirectTo)}` : ""}`, {
    method: "POST",
    headers: headers(config.serviceRoleKey, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      email,
      data: {
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
        phone: input.phone ?? "",
      },
    }),
  })

  if (!response.ok) throw new Error(await response.text())

  const payload = (await response.json().catch(() => ({}))) as { id?: string; user?: { id?: string } }
  return upsertCommerceUser({
    id: payload.user?.id ?? payload.id ?? crypto.randomUUID(),
    email,
    firstName: input.firstName?.trim() || "Invited",
    lastName: input.lastName?.trim() || "User",
    phone: input.phone?.trim() || "",
  })
}

export async function getCommerceUserByEmail(email: string) {
  const response = await rest(`app_users?email=eq.${encodeURIComponent(email)}&select=*&limit=1`)
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows[0] ? mapUser(rows[0]) : null
}

export async function getCommerceAddresses(userId: string, userEmail?: string) {
  const resolvedUserId = await resolveOrderUserId(userEmail ?? "", userId)
  if (!resolvedUserId) throw new Error("Account profile was not found in Supabase. Please log out and log in again.")

  const response = await rest(`saved_addresses?user_id=eq.${encodeURIComponent(resolvedUserId)}&select=*&order=created_at.asc`)
  const rows = (await response.json()) as Array<Record<string, unknown>>
  return rows.map(mapAddress)
}

export async function saveCommerceAddresses(userId: string, addresses: SavedAddress[], userEmail?: string) {
  const resolvedUserId = await resolveOrderUserId(userEmail ?? "", userId)
  if (!resolvedUserId) throw new Error("Account profile was not found in Supabase. Please log out and log in again.")

  await rest(`saved_addresses?user_id=eq.${encodeURIComponent(resolvedUserId)}`, { method: "DELETE" })
  if (!addresses.length) return []
  const response = await rest("saved_addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(addresses.map((address) => ({
      id: address.id,
      user_id: resolvedUserId,
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

  return {
    id: payload.user?.id ?? null,
    emailVerified: Boolean(payload.user?.email_confirmed_at),
  }
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

export function getSupabaseSocialAuthUrl(provider: SupabaseSocialProvider, redirectTo: string) {
  const config = getSupabaseConfig()
  if (!config.anonKey) throw new Error("Supabase anon key is not configured. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.")

  const url = new URL(`${config.url}/auth/v1/authorize`)
  url.searchParams.set("provider", provider)
  url.searchParams.set("redirect_to", redirectTo)
  return url.toString()
}

export async function completeSupabaseSocialLogin(accessToken: string) {
  const config = getSupabaseConfig()
  if (!config.anonKey) throw new Error("Supabase anon key is not configured. Add SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.")

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: headers(config.anonKey, { Authorization: `Bearer ${accessToken}` }),
  })
  if (!response.ok) throw new Error(await response.text())

  const authUser = (await response.json()) as SupabaseAuthUser
  const metadata = authUser.user_metadata ?? {}
  const identityData = authUser.identities?.find((identity) => identity.identity_data)?.identity_data ?? {}
  const email = firstString(authUser.email, metadata.email, identityData.email)

  if (!authUser.id || !email) {
    throw new Error("Your social provider did not return the account details required for checkout.")
  }

  const fullName = firstString(metadata.full_name, metadata.name, identityData.full_name, identityData.name)
  const [fallbackFirstName, ...fallbackLastNameParts] = fullName.split(" ").filter(Boolean)
  const existing = await getCommerceUserByEmail(email)

  return upsertCommerceUser({
    id: existing?.id ?? authUser.id,
    email,
    firstName: existing?.firstName || firstString(metadata.first_name, metadata.given_name, identityData.first_name, identityData.given_name, fallbackFirstName, "Customer"),
    lastName: existing?.lastName || firstString(metadata.last_name, metadata.family_name, identityData.last_name, identityData.family_name, fallbackLastNameParts.join(" ")),
    phone: existing?.phone || firstString(metadata.phone, metadata.phone_number, identityData.phone, identityData.phone_number),
  })
}

