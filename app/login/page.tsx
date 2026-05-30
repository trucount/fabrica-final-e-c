"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUsers, saveCurrentUser } from "@/lib/client-commerce"
import { useToast } from "@/hooks/use-toast"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const next = searchParams.get("next") || "/profile"

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const user = getUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password)

    if (!user) {
      toast({ title: "Login failed", description: "Please check your email and password.", variant: "destructive" })
      return
    }

    saveCurrentUser(user)
    window.dispatchEvent(new Event("commerce-auth-changed"))
    router.push(next)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-4xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Login to checkout and view your orders.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-lg border p-4 sm:p-6">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Login</Button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link className="font-medium text-foreground underline" href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  )
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
