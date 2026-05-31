"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"\nimport { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signupWithSupabase } from "@/lib/client-commerce"
import { useToast } from "@/hooks/use-toast"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const next = searchParams.get("next") || "/profile"\n  const googleLoginUrl = `/api/commerce/auth/social?provider=google&next=${encodeURIComponent(next)}`
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await signupWithSupabase({ ...form, redirectTo: `${window.location.origin}/login` })
      if (response.emailVerified) {
        window.dispatchEvent(new Event("commerce-auth-changed"))
        toast({ title: "Account created", description: "Your account was saved to Supabase." })
        router.push(next)
      } else {
        toast({ title: "Verify your email", description: "Supabase sent a verification email. Please verify your address before logging in." })
        router.push(`/login?next=${encodeURIComponent(next)}`)
      }
    } catch (error) {
      toast({ title: "Signup failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
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
          <div className="sm:col-span-2"><Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Sign Up"}</Button></div>
          <p className="text-center text-sm text-muted-foreground sm:col-span-2">
            Already have an account? <Link className="font-medium text-foreground underline" href={`/login?next=${encodeURIComponent(next)}`}>Login</Link>
          </p>
          <div className="relative my-2 sm:col-span-2">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Button variant="outline" type="button" className="w-full" asChild>
              <a href={googleLoginUrl}>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
              </a>
            </Button>
          </div>
        </form>
        <footer className="mt-12 text-center">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Powered by Sparrow AI Solutions</p>
        </footer>
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
