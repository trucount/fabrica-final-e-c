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
  emptyPolicies,
  loadOrders,
  loadPolicies,
  orderStatuses,
  persistOrderStatus,
  persistPolicies,
} from "@/lib/client-commerce"
import { Plus, Save, Trash2 } from "lucide-react"

export function AdminPoliciesPanel() {
  const { toast } = useToast()
  const [policies, setPolicies] = useState<OrderPolicies>(emptyPolicies)
  const [policiesError, setPoliciesError] = useState("")
  const [isSavingPolicies, setIsSavingPolicies] = useState(false)
  const [coupon, setCoupon] = useState<Coupon>({
    code: "",
    label: "",
    type: "universal",
    discountType: "percent",
    discountValue: 0,
    active: true,
  })

  useEffect(() => {
    loadPolicies()
      .then((nextPolicies) => {
        setPolicies(nextPolicies)
        setPoliciesError("")
      })
      .catch((error) => setPoliciesError(error instanceof Error ? error.message : "Supabase policies could not be loaded."))
  }, [])

  const save = async (nextPolicies = policies) => {
    setIsSavingPolicies(true)
    try {
      const saved = await persistPolicies(nextPolicies)
      setPolicies(saved)
      setPoliciesError("")
      toast({ title: "Policies saved", description: "Shipping, tax, and coupons were saved to Supabase." })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Supabase save failed."
      setPoliciesError(message)
      toast({ title: "Policy save failed", description: message, variant: "destructive" })
    } finally {
      setIsSavingPolicies(false)
    }
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
          <p className="text-sm text-muted-foreground">Manage shipping, tax, and coupons used by cart and checkout.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Shipping amount per order</Label>
            <Input type="number" min="0" value={policies.shippingAmount} onChange={(event) => setPolicies({ ...policies, shippingAmount: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Free shipping threshold</Label>
            <Input type="number" min="0" value={policies.freeShippingThreshold} onChange={(event) => setPolicies({ ...policies, freeShippingThreshold: Number(event.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Tax rate (%)</Label>
            <Input type="number" min="0" step="0.01" value={policies.taxRate} onChange={(event) => setPolicies({ ...policies, taxRate: Number(event.target.value) })} />
          </div>
        </div>
        {policiesError ? <p className="mt-4 text-sm text-destructive">{policiesError}</p> : null}
        <Button className="mt-4" onClick={() => void save()} disabled={isSavingPolicies}>
          <Save className="mr-2 h-4 w-4" />
          {isSavingPolicies ? "Saving..." : "Save Policies"}
        </Button>
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

  useEffect(() => {
    loadOrders()
      .then((nextOrders) => {
        setOrders(nextOrders)
        setOrdersError("")
      })
      .catch((error) => setOrdersError(error instanceof Error ? error.message : "Supabase orders could not be loaded."))
  }, [])

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
      <h2 className="font-serif text-2xl font-semibold mb-4">Orders</h2>
      {ordersError ? <p className="mb-4 text-sm text-destructive">{ordersError}</p> : null}
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
            {orders.map((order) => (
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
            {!orders.length ? (
              <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No orders yet.</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
