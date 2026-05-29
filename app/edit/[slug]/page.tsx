import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditSaveButton } from "@/components/edit-save-button"
import { getInfoPageContent, parseInfoPageSlug } from "@/lib/info-page-content"
import { loginToInfoPageEdit, logoutFromEdit, saveEditedInfoPageContent } from "../actions"
import { hasEditPageAccess } from "../auth"

type EditInfoPageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditInfoPage({ params, searchParams }: EditInfoPageProps) {
  const { slug: rawSlug } = await params
  let slug: ReturnType<typeof parseInfoPageSlug>

  try {
    slug = parseInfoPageSlug(rawSlug)
  } catch {
    notFound()
  }

  const query = (await searchParams) ?? {}

  if (!(await hasEditPageAccess())) {
    return <EditLoginPage slug={slug} error={query.error === "1" || query.error === "auth"} />
  }

  const content = await getInfoPageContent(slug)
  const saved = query.saved === "1"
  const title = slug.charAt(0).toUpperCase() + slug.slice(1)

  return (
    <div className="min-h-screen">
      <Header />
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={`/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                View {title} Page
              </Link>
            </Button>
            {saved ? <p className="text-sm text-green-600">Saved. {title} page is updated.</p> : null}
          </div>
          <div className="flex gap-2">
            <form action={logoutFromEdit}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
            <EditSaveButton form="info-edit-form" />
          </div>
        </div>
      </div>
      <form id="info-edit-form" action={saveEditedInfoPageContent}>
        <input type="hidden" name="savePassword" />
        <input type="hidden" name="slug" value={slug} />
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/edit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Edit Home
            </Link>
          </Button>
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 space-y-6">
            <Input name="title" defaultValue={content.title} aria-label={`${title} title`} className="h-auto border-dashed text-center font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight" />
            <Textarea name="description" defaultValue={content.description} aria-label={`${title} description`} className="resize-y border-dashed text-center text-base sm:text-lg md:text-xl text-muted-foreground" />
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {content.body.map((paragraph, index) => (
              <Textarea key={index} name="body" defaultValue={paragraph} aria-label={`${title} paragraph ${index + 1}`} className="min-h-28 resize-y border-dashed text-muted-foreground leading-relaxed" />
            ))}
          </div>
        </section>
      </form>
    </div>
  )
}

function EditLoginPage({ slug, error }: { slug: string; error: boolean }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold mb-2">Edit {slug} Page</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter the editor password to update this page.</p>
          <form action={loginToInfoPageEdit} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div>
              <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              {error ? <p className="mt-2 text-sm text-destructive">Incorrect password. Please try again.</p> : null}
            </div>
            <Button type="submit" className="w-full">Unlock Editor</Button>
          </form>
        </div>
      </main>
    </div>
  )
}
