"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  const googleLoginUrl = `/api/commerce/auth/social?provider=google&next=${encodeURIComponent(next)}`

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
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" type="button" className="w-full" asChild>
            <a href={googleLoginUrl}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </a>
          </Button>
        </form>
<footer className="mt-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/logo-black.png"
              alt="ASTERA Logo"
              width={20}
              height={20}
              className="h-5 w-auto object-contain opacity-50"
            />
            <p className="text-xs tracking-widest text-muted-foreground uppercase">Powered by Sparrow AI Solutions</p>
          </div>
        </footer>
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
