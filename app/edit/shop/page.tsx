import { cookies } from "next/headers"
import Link from "next/link"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getShopContent } from "@/lib/shop-content"
import { loginToShopEdit, logoutFromEdit, saveEditedShopContent } from "../actions"
import { EDIT_SESSION_COOKIE } from "../constants"

type EditShopPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditShopPage({ searchParams }: EditShopPageProps) {
  const cookieStore = await cookies()
  const params = (await searchParams) ?? {}
  const isAuthenticated = cookieStore.get(EDIT_SESSION_COOKIE)?.value === "authenticated"

  if (!isAuthenticated) {
    return <EditLoginPage error={params.error === "1" || params.error === "auth"} />
  }

  const content = await getShopContent()
  const saved = params.saved === "1"

  return (
    <div className="min-h-screen">
      <Header />

      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View Shop Page
              </Link>
            </Button>
            {saved ? <p className="text-sm text-green-600">Saved. Shop page is updated.</p> : null}
          </div>
          <div className="flex gap-2">
            <form action={logoutFromEdit}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
            <Button form="shop-edit-form" type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Text
            </Button>
          </div>
        </div>
      </div>

      <form id="shop-edit-form" action={saveEditedShopContent}>
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <Input
            name="title"
            defaultValue={content.title}
            aria-label="Shop page title"
            className="h-auto border-dashed font-serif text-4xl md:text-5xl font-semibold mb-8"
          />
          <ProductGrid />
        </div>
      </form>
    </div>
  )
}

function EditLoginPage({ error }: { error: boolean }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold mb-2">Edit Shop Page</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the editor password to update only the editable text on the Shop page.
          </p>
          <form action={loginToShopEdit} className="space-y-4">
            <div>
              <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              {error ? <p className="mt-2 text-sm text-destructive">Incorrect password. Please try again.</p> : null}
            </div>
            <Button type="submit" className="w-full">
              Unlock Editor
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
