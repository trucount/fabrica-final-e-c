import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditSaveButton } from "@/components/edit-save-button"
import { EditStatusMessage } from "../status-message"
import { getCollections } from "@/lib/collections-data"
import { getCollectionsContent } from "@/lib/collections-content"
import { loginToCollectionsEdit, logoutFromEdit, saveEditedCollectionsContent } from "../actions"
import { hasEditPageAccess } from "../auth"

type EditCollectionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditCollectionsPage({ searchParams }: EditCollectionsPageProps) {
  const params = (await searchParams) ?? {}

  if (!(await hasEditPageAccess())) {
    return <EditLoginPage error={params.error === "1" || params.error === "auth"} />
  }

  const [content, collections] = await Promise.all([getCollectionsContent(), getCollections()])

  return (
    <div className="min-h-screen">
      <Header />

      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/collections">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View Collections Page
              </Link>
            </Button>
            <EditStatusMessage error={params.error} saved={params.saved} successMessage="Saved. Collections page is updated." />
          </div>
          <div className="flex gap-2">
            <form action={logoutFromEdit}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
            <EditSaveButton form="collections-edit-form" />
          </div>
        </div>
      </div>

      <form id="collections-edit-form" action={saveEditedCollectionsContent}>
        <input type="hidden" name="savePassword" />
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-24">
            <Input
              name="title"
              defaultValue={content.title}
              aria-label="Collections page title"
              className="h-auto border-dashed text-center font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight"
            />
            <Textarea
              name="description"
              defaultValue={content.description}
              aria-label="Collections page description"
              className="resize-y border-dashed text-center text-base sm:text-lg md:text-xl text-muted-foreground text-balance"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {collections.map((collection) => (
              <div key={collection.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary mb-4">
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 translate-y-0 transition-transform duration-500">
                    <p className="text-white/80 text-xs sm:text-sm mb-2">{collection.items}</p>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-2">
                      {collection.name}
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base">{collection.description}</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-between text-sm sm:text-base group-hover:bg-secondary">
                  View Collection
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-secondary py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <Input
                name="featuredTitle"
                defaultValue={content.featuredTitle}
                aria-label="Featured section title"
                className="h-auto border-dashed bg-background/75 text-center font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6"
              />
              <Textarea
                name="featuredDescription"
                defaultValue={content.featuredDescription}
                aria-label="Featured section description"
                className="mb-8 min-h-32 resize-y border-dashed bg-background/75 text-center text-base sm:text-lg text-muted-foreground leading-relaxed"
              />
              <Button asChild size="lg" variant="outline" className="h-12 px-8 bg-transparent">
                <Link href="/shop">Browse All Products</Link>
              </Button>
            </div>
          </div>
        </section>
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
          <h1 className="font-serif text-3xl font-semibold mb-2">Edit Collections Page</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the editor password to update only the editable text on the Collections page.
          </p>
          <form action={loginToCollectionsEdit} className="space-y-4">
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
