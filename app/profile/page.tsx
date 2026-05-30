"use client"

import { Header } from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/profile-settings"
import { OrderHistory } from "@/components/order-history"
import { SavedAddresses } from "@/components/saved-addresses"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCurrentUser, saveCurrentUser } from "@/lib/client-commerce"

function ProfileContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const defaultTab = searchParams.get("tab") || "profile"

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/login?next=/profile")
      return
    }
    setIsReady(true)
  }, [router])

  if (!isReady) {
    return <div className="min-h-screen"><Header /><main className="container mx-auto px-4 py-16">Checking account...</main></div>
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 max-w-7xl">
        <Button variant="ghost" asChild className="mb-6 sm:mb-8 -ml-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold">My Account</h1>
          <Button variant="outline" onClick={() => { saveCurrentUser(null); router.push("/login") }}>Logout</Button>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-8 sm:space-y-10">
          <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14">
            <TabsTrigger value="profile" className="text-base sm:text-lg font-medium">
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-base sm:text-lg font-medium">
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="text-base sm:text-lg font-medium">
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>

          <TabsContent value="addresses">
            <SavedAddresses />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}
