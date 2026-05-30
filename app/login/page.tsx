"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginWithSupabase, requestPasswordReset } from "@/lib/client-commerce"
import { useToast } from "@/hooks/use-toast"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const next = searchParams.get("next") || "/profile"

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      await loginWithSupabase(email, password)
      window.dispatchEvent(new Event("commerce-auth-changed"))
      router.push(next)
    } catch (error) {
      toast({ title: "Login failed", description: error instanceof Error ? error.message : "Please check your email and password.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "Add your email above so we can send the reset link.", variant: "destructive" })
      return
    }
    setIsResetting(true)
    try {
      await requestPasswordReset(email, `${window.location.origin}/login`)
      toast({ title: "Reset email sent", description: "Check your inbox for the Supabase password reset link." })
    } catch (error) {
      toast({ title: "Reset failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
    } finally {
      setIsResetting(false)
    }
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
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</Button>
          <Button type="button" variant="link" className="w-full" disabled={isResetting} onClick={forgotPassword}>{isResetting ? "Sending reset link..." : "Forgot password?"}</Button>
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
