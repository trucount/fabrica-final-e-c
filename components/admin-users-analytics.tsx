"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Mail, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency"
import { type CommerceUser, type CustomerOrder, loadOrders } from "@/lib/client-commerce"

type InviteState = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

type UmamiPoint = {
  x: string
  y: number
}

type UmamiMetric = {
  x?: string
  y?: number
}

type UmamiAnalytics = {
  stats: {
    pageviews?: number
    visitors?: number
    visits?: number
    bounces?: number
    totaltime?: number
  }
  pageviews: {
    pageviews?: UmamiPoint[]
    sessions?: UmamiPoint[]
  }
  paths: UmamiMetric[]
  referrers: UmamiMetric[]
  devices: UmamiMetric[]
  countries: UmamiMetric[]
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? "Request failed.")
  }

  return response.json() as Promise<T>
}

export function AdminUsersPanel() {
  const { toast } = useToast()
  const [users, setUsers] = useState<CommerceUser[]>([])
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [selectedEmail, setSelectedEmail] = useState("")
  const [error, setError] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [invite, setInvite] = useState<InviteState>({ firstName: "", lastName: "", email: "", phone: "" })

  useEffect(() => {
    Promise.all([jsonFetch<CommerceUser[]>("/api/commerce/users"), loadOrders()])
      .then(([nextUsers, nextOrders]) => {
        setUsers(nextUsers)
        setOrders(nextOrders)
        setSelectedEmail(nextUsers[0]?.email ?? "")
        setError("")
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Users could not be loaded."))
  }, [])

  const selectedOrders = orders.filter((order) => order.userEmail.toLowerCase() === selectedEmail.toLowerCase())
  const selectedUser = users.find((user) => user.email === selectedEmail)

  const submitInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsInviting(true)
    try {
      const invited = await jsonFetch<CommerceUser>("/api/commerce/users", { method: "POST", body: JSON.stringify(invite) })
      setUsers((current) => [invited, ...current.filter((user) => user.email !== invited.email)])
      setSelectedEmail(invited.email)
      setInvite({ firstName: "", lastName: "", email: "", phone: "" })
      toast({ title: "Invite sent", description: `Supabase invite email sent to ${invited.email}.` })
    } catch (inviteError) {
      toast({ title: "Invite failed", description: inviteError instanceof Error ? inviteError.message : "Unable to send invite.", variant: "destructive" })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Users</h2>
            <p className="text-sm text-muted-foreground">Invite customers and click any user to review their placed orders.</p>
          </div>
          <div className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">{users.length} users</div>
        </div>
        <form onSubmit={submitInvite} className="mb-6 grid gap-3 rounded-lg bg-secondary/50 p-3 md:grid-cols-5">
          <div className="space-y-1"><Label>First name</Label><Input value={invite.firstName} onChange={(event) => setInvite({ ...invite, firstName: event.target.value })} /></div>
          <div className="space-y-1"><Label>Last name</Label><Input value={invite.lastName} onChange={(event) => setInvite({ ...invite, lastName: event.target.value })} /></div>
          <div className="space-y-1"><Label>Email</Label><Input required type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input value={invite.phone} onChange={(event) => setInvite({ ...invite, phone: event.target.value })} /></div>
          <Button className="self-end" type="submit" disabled={isInviting}><UserPlus className="mr-2 h-4 w-4" />{isInviting ? "Sending..." : "Invite User"}</Button>
        </form>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} onClick={() => setSelectedEmail(user.email)} className={`cursor-pointer ${selectedEmail === user.email ? "bg-secondary" : ""}`}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                  </TableRow>
                ))}
                {!users.length ? <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No users found.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-md border p-4">
            <h3 className="font-serif text-xl font-semibold">{selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Select a user"}</h3>
            {selectedUser ? <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" />{selectedUser.email}</p> : null}
            <div className="space-y-3">
              {selectedOrders.map((order) => (
                <div key={order.id} className="rounded-lg bg-secondary/60 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3"><span className="font-medium">{order.id}</span><span>{formatCurrency(order.totals.total)}</span></div>
                  <div className="text-muted-foreground">{new Date(order.date).toLocaleString()} · {order.status.replace("_", " ")}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</div>
                </div>
              ))}
              {selectedUser && !selectedOrders.length ? <p className="rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">No orders placed by this user yet.</p> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const COLORS = ["#111827", "#6b7280", "#9ca3af", "#d1d5db"]

export function AdminAnalyticsPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [umami, setUmami] = useState<UmamiAnalytics | null>(null)
  const [error, setError] = useState("")
  const [umamiError, setUmamiError] = useState("")
  const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL

  useEffect(() => {
    loadOrders().then(setOrders).catch((analyticsError) => setError(analyticsError instanceof Error ? analyticsError.message : "Commerce analytics could not be loaded."))
    jsonFetch<UmamiAnalytics>("/api/umami-analytics")
      .then((nextUmami) => {
        setUmami(nextUmami)
        setUmamiError("")
      })
      .catch((analyticsError) => setUmamiError(analyticsError instanceof Error ? analyticsError.message : "Umami analytics could not be loaded."))
  }, [])

  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>()
    orders.forEach((order) => {
      const day = new Date(order.date).toISOString().slice(0, 10)
      map.set(day, (map.get(day) ?? 0) + order.totals.total)
    })
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue })).slice(-14)
  }, [orders])

  const statusData = useMemo(() => {
    const map = new Map<string, number>()
    orders.forEach((order) => map.set(order.status, (map.get(order.status) ?? 0) + 1))
    return Array.from(map.entries()).map(([name, value]) => ({ name: name.replace("_", " "), value }))
  }, [orders])

  const trafficSeries = useMemo(() => {
    const pageviews = umami?.pageviews.pageviews ?? []
    const sessions = new Map((umami?.pageviews.sessions ?? []).map((point) => [point.x, point.y]))
    return pageviews.map((point) => ({
      date: new Date(point.x).toISOString().slice(0, 10),
      pageviews: point.y,
      sessions: sessions.get(point.x) ?? 0,
    }))
  }, [umami])

  const totals = orders.reduce((sum, order) => sum + order.totals.total, 0)

  return (
    <section className="space-y-6 rounded-lg border p-4 sm:p-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">Umami tracking and API reporting are installed, with commerce charts below for order insight.</p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        {umamiError ? <p className="mt-2 text-sm text-destructive">{umamiError} Add UMAMI_API_KEY to enable live Umami API graphs.</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Pageviews" value={String(umami?.stats.pageviews ?? 0)} />
        <Metric label="Visitors" value={String(umami?.stats.visitors ?? 0)} />
        <Metric label="Visits" value={String(umami?.stats.visits ?? 0)} />
        <Metric label="Orders" value={String(orders.length)} />
        <Metric label="Revenue" value={formatCurrency(totals)} />
        <Metric label="Average order" value={formatCurrency(orders.length ? totals / orders.length : 0)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Umami traffic - last 30 days">
          <ResponsiveContainer width="100%" height={260}><LineChart data={trafficSeries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="pageviews" stroke="#111827" strokeWidth={2} /><Line type="monotone" dataKey="sessions" stroke="#6b7280" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top pages">
          <ResponsiveContainer width="100%" height={260}><BarChart data={normalizeMetrics(umami?.paths)} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} /><Tooltip /><Bar dataKey="value" fill="#111827" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top referrers">
          <ResponsiveContainer width="100%" height={260}><BarChart data={normalizeMetrics(umami?.referrers)} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} /><Tooltip /><Bar dataKey="value" fill="#111827" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Devices">
          <ResponsiveContainer width="100%" height={260}><PieChart><Pie dataKey="value" data={normalizeMetrics(umami?.devices)} label>{normalizeMetrics(umami?.devices).map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue by day">
          <ResponsiveContainer width="100%" height={260}><LineChart data={dailyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Line type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Order status split">
          <ResponsiveContainer width="100%" height={260}><PieChart><Pie dataKey="value" data={statusData} label>{statusData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Orders by day">
          <ResponsiveContainer width="100%" height={260}><BarChart data={dailyRevenue.map((item) => ({ ...item, orders: orders.filter((order) => new Date(order.date).toISOString().slice(0, 10) === item.date).length }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="orders" fill="#111827" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-2 font-serif text-xl font-semibold">Umami dashboard</h3>
          {shareUrl ? <iframe title="Umami analytics" src={shareUrl} className="h-[260px] w-full rounded-md border" /> : <p className="flex h-[260px] items-center justify-center rounded-md bg-secondary p-6 text-center text-sm text-muted-foreground">Optional: set NEXT_PUBLIC_UMAMI_SHARE_URL to embed your shared Umami dashboard. Live API charts use UMAMI_API_KEY.</p>}
        </div>
      </div>
    </section>
  )
}

function normalizeMetrics(metrics?: UmamiMetric[]) {
  return (metrics ?? []).map((metric) => ({ name: metric.x || "Direct / unknown", value: metric.y ?? 0 }))
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-secondary/40 p-4"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border bg-background p-4"><h3 className="mb-4 font-serif text-xl font-semibold">{title}</h3>{children}</div>
}
