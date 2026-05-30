"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { completeSocialLogin } from "@/lib/client-commerce"
import { useToast } from "@/hooks/use-toast"

function cleanNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/profile"
  return value
}

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState("")
  const next = useMemo(() => cleanNext(searchParams.get("next")), [searchParams])

  useEffect(() => {
    const finishLogin = async () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const accessToken = params.get("access_token")
      const hashError = params.get("error_description") || params.get("error")
      const queryError = searchParams.get("error_description") || searchParams.get("error")

      if (hashError || queryError) {
        setError(hashError || queryError || "Social login failed.")
        return
      }

      if (!accessToken) {
        setError("Supabase did not return a social login token. Confirm the provider is enabled and uses the implicit OAuth flow.")
        return
      }

      try {
        await completeSocialLogin(accessToken)
        window.dispatchEvent(new Event("commerce-auth-changed"))
        toast({ title: "Logged in", description: "Your social account is connected." })
        router.replace(next)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to finish social login.")
      }
    }

    finishLogin()
  }, [next, router, searchParams, toast])

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-serif text-4xl font-semibold">Finishing login</h1>
        {error ? (
          <div className="mt-8 space-y-4 rounded-lg border p-6 text-left">
            <p className="text-sm text-destructive">{error}</p>
            <Button className="w-full" onClick={() => router.push(`/login?next=${encodeURIComponent(next)}`)}>
              Back to login
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Please wait while we connect your account.</p>
        )}
      </main>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  )
}
