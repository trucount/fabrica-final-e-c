"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"
import {
  type Coupon,
  type CustomerOrder,
  type DiscountType,
  type CouponKind,
  type OrderPolicies,
  type OrderStatus,
  type Theme,
  type ThemeColors,
  emptyPolicies,
  loadOrders,
  loadPolicies,
  loadThemes,
  orderStatuses,
  persistOrderStatus,
  persistPolicies,
  persistTheme,
  deleteTheme,
} from "@/lib/client-commerce"
import { useTheme } from "@/components/theme-context"
import { Plus, Save, Trash2 } from "lucide-react"
import { generateOrdersExcel, downloadExcel } from "@/lib/excel-generator"


const labelFileTypes = ["PNG", "PNG_2.3x7.5", "PDF", "PDF_2.3x7.5", "PDF_4x6", "PDF_4x8", "PDF_A4", "PDF_A5", "PDF_A6", "ZPLII"] as const
const distanceUnits = ["in", "cm"] as const
const massUnits = ["lb", "oz", "g", "kg"] as const

export function AdminPoliciesPanel() {
  const { toast } = useToast()
  const { refresh: refreshGlobalTheme, themes: globalThemes } = useTheme()
  const [policies, setPolicies] = useState<OrderPolicies>(emptyPolicies)
  const [policiesError, setPoliciesError] = useState("")
  const [isSavingPolicies, setIsSavingPolicies] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [isSavingTheme, setIsSavingTheme] = useState(false)
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    name: "",
    label: "",
    colors: {
      background: "oklch(0.985 0 0)",
      foreground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      primary_foreground: "oklch(0.985 0 0)",
      secondary: "oklch(0.97 0 0)",
      accent: "oklch(0.97 0 0)",
      muted: "oklch(0.97 0 0)",
      border: "oklch(0.922 0 0)",
    },
  })

  const [coupon, setCoupon] = useState<Coupon>({
    code: "",
    label: "",
    type: "universal",
    discountType: "percent",
    discountValue: 0,
    active: true,
  })

  useEffect(() => {
    Promise.all([loadPolicies(), loadThemes()])
      .then(([nextPolicies, nextThemes]) => {
        setPolicies(nextPolicies)
        setThemes(nextThemes)
        setPoliciesError("")
      })
      .catch((error) => setPoliciesError(error instanceof Error ? error.message : "Supabase data could not be loaded."))
  }, [])

  const save = async (nextPolicies = policies) => {
    setIsSavingPolicies(true)
    try {
      const saved = await persistPolicies(nextPolicies)
      setPolicies(saved)
      setPoliciesError("")
      toast({ title: "Policies saved", description: "Shipping, tax, and coupons were saved to Supabase." })
      void refreshGlobalTheme()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Supabase save failed."
      setPoliciesError(message)
      toast({ title: "Policy save failed", description: message, variant: "destructive" })
    } finally {
      setIsSavingPolicies(false)
    }
  }

  const saveTheme = async (theme: Partial<Theme>) => {
    setIsSavingTheme(true)
    try {
      await persistTheme(theme)
      const nextThemes = await loadThemes()
      setThemes(nextThemes)
      toast({ title: "Theme saved", description: "Theme configuration was saved to Supabase." })
      void refreshGlobalTheme()
    } catch (error) {
      toast({ title: "Theme save failed", description: error instanceof Error ? error.message : "Supabase save failed.", variant: "destructive" })
    } finally {
      setIsSavingTheme(false)
    }
  }

  const removeTheme = async (id: string) => {
    if (!confirm("Are you sure you want to delete this theme?")) return
    try {
      await deleteTheme(id)
      setThemes(themes.filter((t) => t.id !== id))
      toast({ title: "Theme deleted" })
    } catch (error) {
      toast({ title: "Delete failed", description: error instanceof Error ? error.message : "Supabase delete failed.", variant: "destructive" })
    }
  }

  const updateNewThemeColor = (key: keyof ThemeColors, value: string) => {
    setNewTheme({
      ...newTheme,
      colors: {
        ...(newTheme.colors as ThemeColors),
        [key]: value,
      },
    })
  }

  const updateShippoFromAddress = (field: keyof OrderPolicies["shippoFromAddress"], value: string | boolean) => {
    setPolicies({ ...policies, shippoFromAddress: { ...policies.shippoFromAddress, [field]: value } })
  }

  const updateShippoParcelDefaults = (field: keyof OrderPolicies["shippoParcelDefaults"], value: string | number) => {
    setPolicies({ ...policies, shippoParcelDefaults: { ...policies.shippoParcelDefaults, [field]: value } })
  }

  const addCoupon = () => {
    const code = coupon.code.trim().toUpperCase()
    if (!code || !coupon.discountValue) {
      toast({ title: "Coupon needs code and discount", variant: "destructive" })
      return
    }

    const nextPolicies = {
      ...policies,
      coupons: [
        ...policies.coupons.filter((item) => item.code.toUpperCase() !== code),
        { ...coupon, code, label: coupon.label.trim() || code },
      ],
    }
    setCoupon({ code: "", label: "", type: "universal", discountType: "percent", discountValue: 0, active: true })
    void save(nextPolicies)
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-semibold">Order Summary Policies</h2>
          <p className="text-sm text-muted-foreground">Manage shipping, tax, Shippo automatic shipping, and coupons used by cart and checkout.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Active Theme</Label>
            <Select value={policies.activeThemeName} onValueChange={(value) => setPolicies({ ...policies, activeThemeName: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.label} ({t.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Shipping amount per order</Label>
            <Input type="number" min="0" value={policies.shippingAmount} onChange={(event) => setPolicies({ ...policies, shippingAmount: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Free shipping threshold</Label>
            <Input type="number" min="0" value={policies.freeShippingThreshold} disabled={policies.automaticShippingEnabled} onChange={(event) => setPolicies({ ...policies, freeShippingThreshold: Number(event.target.value) })} />
            {policies.automaticShippingEnabled ? <p className="text-xs text-muted-foreground">Disabled while Shippo automatic shipping is enabled.</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Tax rate (%)</Label>
            <Input type="number" min="0" step="0.01" value={policies.taxRate} onChange={(event) => setPolicies({ ...policies, taxRate: Number(event.target.value) })} />
          </div>
          <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <input type="checkbox" checked={policies.automaticShippingEnabled} onChange={(event) => setPolicies({ ...policies, automaticShippingEnabled: event.target.checked })} />
            <span><span className="font-medium">Enable automatic shipping</span><span className="block text-xs text-muted-foreground">Uses Shippo rates, hides COD, and buys the selected label after online payment.</span></span>
          </label>
        </div>
        {policiesError ? <p className="mt-4 text-sm text-destructive">{policiesError}</p> : null}
        <Button className="mt-4" onClick={() => void save()} disabled={isSavingPolicies}>
          <Save className="mr-2 h-4 w-4" />
          {isSavingPolicies ? "Saving..." : "Save Policies"}
        </Button>
      </section>


      <section className="rounded-lg border p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-semibold">Shippo Settings</h2>
          <p className="text-sm text-muted-foreground">Set the sender address, default parcel, and label format used for automatic shipping rates and labels.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2"><Label>Sender name</Label><Input value={policies.shippoFromAddress.name} onChange={(event) => updateShippoFromAddress("name", event.target.value)} /></div>
          <div className="space-y-2"><Label>Company (optional)</Label><Input value={policies.shippoFromAddress.company} onChange={(event) => updateShippoFromAddress("company", event.target.value)} /></div>
          <div className="space-y-2"><Label>Sender email</Label><Input type="email" value={policies.shippoFromAddress.email} onChange={(event) => updateShippoFromAddress("email", event.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={policies.shippoFromAddress.phone} onChange={(event) => updateShippoFromAddress("phone", event.target.value)} /></div>
          <div className="space-y-2"><Label>Street address</Label><Input value={policies.shippoFromAddress.street1} onChange={(event) => updateShippoFromAddress("street1", event.target.value)} /></div>
          <div className="space-y-2"><Label>Street address 2</Label><Input value={policies.shippoFromAddress.street2} onChange={(event) => updateShippoFromAddress("street2", event.target.value)} /></div>
          <div className="space-y-2"><Label>City</Label><Input value={policies.shippoFromAddress.city} onChange={(event) => updateShippoFromAddress("city", event.target.value)} /></div>
          <div className="space-y-2"><Label>State / Province</Label><Input value={policies.shippoFromAddress.state} onChange={(event) => updateShippoFromAddress("state", event.target.value)} /></div>
          <div className="space-y-2"><Label>ZIP / Postal code</Label><Input value={policies.shippoFromAddress.zip} onChange={(event) => updateShippoFromAddress("zip", event.target.value)} /></div>
          <div className="space-y-2"><Label>Country ISO2</Label><Input value={policies.shippoFromAddress.country} onChange={(event) => updateShippoFromAddress("country", event.target.value.toUpperCase())} /></div>
          <label className="flex items-center gap-3 rounded-md border p-3 text-sm"><input type="checkbox" checked={policies.shippoFromAddress.isResidential} onChange={(event) => updateShippoFromAddress("isResidential", event.target.checked)} /><span>Sender address is residential</span></label>
          <div className="space-y-2"><Label>Label format</Label><Select value={policies.shippoLabelFileType} onValueChange={(value: OrderPolicies["shippoLabelFileType"]) => setPolicies({ ...policies, shippoLabelFileType: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{labelFileTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-2"><Label>Length</Label><Input type="number" min="0.1" step="0.1" value={policies.shippoParcelDefaults.length} onChange={(event) => updateShippoParcelDefaults("length", Number(event.target.value))} /></div>
          <div className="space-y-2"><Label>Width</Label><Input type="number" min="0.1" step="0.1" value={policies.shippoParcelDefaults.width} onChange={(event) => updateShippoParcelDefaults("width", Number(event.target.value))} /></div>
          <div className="space-y-2"><Label>Height</Label><Input type="number" min="0.1" step="0.1" value={policies.shippoParcelDefaults.height} onChange={(event) => updateShippoParcelDefaults("height", Number(event.target.value))} /></div>
          <div className="space-y-2"><Label>Weight per item</Label><Input type="number" min="0.1" step="0.1" value={policies.shippoParcelDefaults.weight} onChange={(event) => updateShippoParcelDefaults("weight", Number(event.target.value))} /></div>
          <div className="space-y-2"><Label>Distance unit</Label><Select value={policies.shippoParcelDefaults.distanceUnit} onValueChange={(value: OrderPolicies["shippoParcelDefaults"]["distanceUnit"]) => updateShippoParcelDefaults("distanceUnit", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{distanceUnits.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Mass unit</Label><Select value={policies.shippoParcelDefaults.massUnit} onValueChange={(value: OrderPolicies["shippoParcelDefaults"]["massUnit"]) => updateShippoParcelDefaults("massUnit", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{massUnits.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Button className="mt-4" onClick={() => void save()} disabled={isSavingPolicies}>
          <Save className="mr-2 h-4 w-4" />
          {isSavingPolicies ? "Saving..." : "Save Shippo Settings"}
        </Button>
      </section>

      <section className="rounded-lg border p-4 sm:p-6">
        <h2 className="font-serif text-2xl font-semibold mb-4">Theme Management</h2>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Theme Name (ID)</Label>
              <Input placeholder="e.g. ocean-breeze" value={newTheme.name} onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
            </div>
            <div className="space-y-2">
              <Label>Theme Label</Label>
              <Input placeholder="e.g. Ocean Breeze" value={newTheme.label} onChange={(e) => setNewTheme({ ...newTheme, label: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
            {Object.keys(newTheme.colors || {}).map((colorKey) => (
              <div key={colorKey} className="space-y-2">
                <Label className="text-[10px] uppercase">{colorKey.replace("_", " ")}</Label>
                <Input value={(newTheme.colors as any)[colorKey]} onChange={(e) => updateNewThemeColor(colorKey as keyof ThemeColors, e.target.value)} />
              </div>
            ))}
          </div>

          <Button onClick={() => saveTheme(newTheme)} disabled={isSavingTheme || !newTheme.name || !newTheme.label}>
            <Plus className="mr-2 h-4 w-4" /> Add Theme
          </Button>

          <div className="mt-6 overflow-x-auto rounded-md border">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Colors (OKLCH)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.name}</TableCell>
                    <TableCell>{t.label}</TableCell>
                    <TableCell>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {Object.entries(t.colors).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full border" style={{ backgroundColor: v.includes("oklch") ? v : "#ccc" }} />
                            <span className="truncate opacity-70">{k}: {v}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => removeTheme(t.id)} disabled={t.name === "default" || t.name === policies.activeThemeName}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border p-4 sm:p-6">
        <h2 className="font-serif text-2xl font-semibold mb-4">Coupons</h2>
        <div className="grid gap-3 lg:grid-cols-6">
          <Input placeholder="CODE" value={coupon.code} onChange={(event) => setCoupon({ ...coupon, code: event.target.value })} />
          <Input placeholder="Label" value={coupon.label} onChange={(event) => setCoupon({ ...coupon, label: event.target.value })} />
          <Select value={coupon.type} onValueChange={(value: CouponKind) => setCoupon({ ...coupon, type: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="universal">Universal</SelectItem>
              <SelectItem value="one_time">One time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={coupon.discountType} onValueChange={(value: DiscountType) => setCoupon({ ...coupon, discountType: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percent">Percent</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Discount" value={coupon.discountValue || ""} onChange={(event) => setCoupon({ ...coupon, discountValue: Number(event.target.value) })} />
          <Button type="button" onClick={addCoupon}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <div className="mt-6 overflow-x-auto rounded-md border">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.coupons.map((item) => (
                <TableRow key={item.code}>
                  <TableCell className="font-medium">{item.code}</TableCell>
                  <TableCell>{item.type === "one_time" ? "One time" : "Universal"}</TableCell>
                  <TableCell>{item.discountType === "percent" ? `${item.discountValue}%` : formatCurrency(item.discountValue)}</TableCell>
                  <TableCell>{item.active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => void save({ ...policies, coupons: policies.coupons.map((couponItem) => couponItem.code === item.code ? { ...couponItem, active: !couponItem.active } : couponItem) })}>
                        {item.active ? "Disable" : "Enable"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void save({ ...policies, coupons: policies.coupons.filter((couponItem) => couponItem.code !== item.code) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}

export function AdminOrdersPanel() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [ordersError, setOrdersError] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    loadOrders()
      .then((nextOrders) => {
        setOrders(nextOrders)
        setOrdersError("")
      })
      .catch((error) => setOrdersError(error instanceof Error ? error.message : "Supabase orders could not be loaded."))
  }, [])

  const filteredOrders = orders.filter((order) => {
    const orderTime = new Date(order.date).getTime()
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null

    return (statusFilter === "all" || order.status === statusFilter)
      && (!fromTime || orderTime >= fromTime)
      && (!toTime || orderTime <= toTime)
  })

  const exportExcel = () => {
    const excelData = generateOrdersExcel(filteredOrders)
    const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    downloadExcel(excelData, filename)
    toast({ title: "Export successful", description: `Downloaded ${filteredOrders.length} orders to ${filename}` })
  }

  const updateStatus = async (id: string, status: OrderStatus) => {
    const previousOrders = orders
    const nextOrders = orders.map((order) => (order.id === id ? { ...order, status } : order))
    setOrders(nextOrders)
    try {
      await persistOrderStatus(id, status)
      toast({ title: "Order status updated", description: `Order ${id} is now ${status.replace("_", " ")}.` })
    } catch (error) {
      setOrders(previousOrders)
      toast({ title: "Order status update failed", description: error instanceof Error ? error.message : "Supabase status update failed.", variant: "destructive" })
    }
  }

  return (
    <section className="rounded-lg border p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Orders</h2>
          {ordersError ? <p className="mt-2 text-sm text-destructive">{ordersError}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[680px]">
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(value: OrderStatus | "all") => setStatusFilter(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {orderStatuses.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>From</Label><Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></div>
          <div className="space-y-1"><Label>To</Label><Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div>
          <Button type="button" variant="outline" onClick={exportExcel} disabled={!filteredOrders.length}>Export Excel</Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.userEmail}</TableCell>
                <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
                <TableCell>{formatCurrency(order.totals.total)}</TableCell>
                <TableCell>{order.paymentMethod === "cod" ? "COD" : "Razorpay"} / {order.paymentVerified ? "Verified" : "Pending"}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(value: OrderStatus) => void updateStatus(order.id, value)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="min-w-80">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.id}-${item.size}`} className="rounded-md bg-secondary/60 p-2 text-xs">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">Size {item.size} × {item.quantity} · {formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!filteredOrders.length ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No orders match these filters.</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
