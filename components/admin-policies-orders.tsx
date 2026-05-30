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
  defaultPolicies,
  getOrders,
  getPolicies,
  orderStatuses,
  saveOrders,
  savePolicies,
} from "@/lib/client-commerce"
import { Plus, Save, Trash2 } from "lucide-react"

export function AdminPoliciesPanel() {
  const { toast } = useToast()
  const [policies, setPolicies] = useState<OrderPolicies>(defaultPolicies)
  const [coupon, setCoupon] = useState<Coupon>({
    code: "",
    label: "",
    type: "universal",
    discountType: "percent",
    discountValue: 0,
    active: true,
  })

  useEffect(() => {
    setPolicies(getPolicies())
  }, [])

  const save = (nextPolicies = policies) => {
    savePolicies(nextPolicies)
    setPolicies(nextPolicies)
    toast({ title: "Policies saved", description: "Cart summary policies are updated on this browser." })
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
    save(nextPolicies)
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
        <Button className="mt-4" onClick={() => save()}>
          <Save className="mr-2 h-4 w-4" />
          Save Policies
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
                      <Button size="sm" variant="outline" onClick={() => save({ ...policies, coupons: policies.coupons.map((couponItem) => couponItem.code === item.code ? { ...couponItem, active: !couponItem.active } : couponItem) })}>
                        {item.active ? "Disable" : "Enable"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => save({ ...policies, coupons: policies.coupons.filter((couponItem) => couponItem.code !== item.code) })}>
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

  useEffect(() => {
    setOrders(getOrders())
  }, [])

  const updateStatus = (id: string, status: OrderStatus) => {
    const nextOrders = orders.map((order) => (order.id === id ? { ...order, status } : order))
    setOrders(nextOrders)
    saveOrders(nextOrders)
    toast({ title: "Order status updated", description: `Order ${id} is now ${status.replace("_", " ")}.` })
  }

  return (
    <section className="rounded-lg border p-4 sm:p-6">
      <h2 className="font-serif text-2xl font-semibold mb-4">Orders</h2>
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
                  <Select value={order.status} onValueChange={(value: OrderStatus) => updateStatus(order.id, value)}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {!orders.length ? (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No orders yet.</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
