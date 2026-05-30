"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type CommerceUser, getUsers, safeWrite, saveCurrentUser } from "@/lib/client-commerce"
import { useToast } from "@/hooks/use-toast"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const next = searchParams.get("next") || "/profile"
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const users = getUsers()
    if (users.some((user) => user.email.toLowerCase() === form.email.toLowerCase())) {
      toast({ title: "Account already exists", description: "Please login with this email.", variant: "destructive" })
      return
    }

    const user: CommerceUser = { ...form, id: crypto.randomUUID() }
    safeWrite("commerceUsers", [...users, user])
    saveCurrentUser(user)
    window.dispatchEvent(new Event("commerce-auth-changed"))
    router.push(next)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-xl px-4 py-16">
        <h1 className="font-serif text-4xl font-semibold">Create Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">We need your name, email, and phone for checkout autofill.</p>
        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-lg border p-4 sm:grid-cols-2 sm:p-6">
          <div className="space-y-2"><Label>First name</Label><Input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required /></div>
          <div className="space-y-2"><Label>Last name</Label><Input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Phone number</Label><Input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></div>
          <div className="sm:col-span-2"><Button type="submit" className="w-full">Sign Up</Button></div>
          <p className="text-center text-sm text-muted-foreground sm:col-span-2">
            Already have an account? <Link className="font-medium text-foreground underline" href={`/login?next=${encodeURIComponent(next)}`}>Login</Link>
          </p>
        </form>
      </main>
    </div>
  )
}


export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  )
}
