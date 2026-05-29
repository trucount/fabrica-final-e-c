import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditSaveButton } from "@/components/edit-save-button"
import { getAboutContent } from "@/lib/about-content"
import { loginToEdit, logoutFromEdit, saveEditedAboutContent } from "./actions"
import { hasEditPageAccess } from "../auth"

type EditAboutPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditAboutPage({ searchParams }: EditAboutPageProps) {
  const params = (await searchParams) ?? {}

  if (!(await hasEditPageAccess())) {
    return <EditLoginPage error={params.error === "1" || params.error === "auth"} />
  }

  const content = await getAboutContent()
  const saved = params.saved === "1"

  return (
    <div className="min-h-screen">
      <Header />

      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/about">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View About Page
              </Link>
            </Button>
            {saved ? <p className="text-sm text-green-600">Saved. Home and About are updated.</p> : null}
          </div>
          <div className="flex gap-2">
            <form action={logoutFromEdit}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
            <EditSaveButton form="about-edit-form" />
          </div>
        </div>
      </div>

      <form id="about-edit-form" action={saveEditedAboutContent}>
        <input type="hidden" name="savePassword" />
        <section className="relative h-[50vh] sm:h-[60vh] flex items-center justify-center bg-secondary">
          <div className="absolute inset-0 bg-[url('/thudarum-burgundy-evening-suit.jpg')] bg-cover bg-center opacity-80" />
          <div className="relative z-10 text-center px-4 w-full max-w-4xl">
            <Input
              name="heroTitle"
              defaultValue={content.heroTitle}
              aria-label="Hero title"
              className="h-auto border-dashed bg-background/75 text-center font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 tracking-tight"
            />
            <Textarea
              name="heroSubtitle"
              defaultValue={content.heroSubtitle}
              aria-label="Hero subtitle"
              className="mx-auto max-w-2xl resize-none border-dashed bg-background/75 text-center text-lg sm:text-xl text-muted-foreground"
              rows={2}
            />
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <Input
                name="storyTitle"
                defaultValue={content.storyTitle}
                aria-label="Story title"
                className="h-auto border-dashed font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6"
              />
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {content.storyParagraphs.map((paragraph, index) => (
                  <Textarea
                    key={index}
                    name="storyParagraphs"
                    defaultValue={paragraph}
                    aria-label={`Story paragraph ${index + 1}`}
                    className="min-h-28 resize-y border-dashed leading-relaxed"
                  />
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
              <Image src="/thudarum-taupe-suit-detail.jpg" alt="Thudarum craftsmanship" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="bg-secondary py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <Input
              name="valuesTitle"
              defaultValue={content.valuesTitle}
              aria-label="Values section title"
              className="mx-auto h-auto max-w-2xl border-dashed bg-background/75 text-center font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-12"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {content.values.map((value, index) => (
                <div key={index} className="text-center space-y-4">
                  <Input
                    name={`values.${index}.title`}
                    defaultValue={value.title}
                    aria-label={`Value ${index + 1} title`}
                    className="h-auto border-dashed bg-background/75 text-center font-serif text-xl sm:text-2xl font-semibold"
                  />
                  <Textarea
                    name={`values.${index}.description`}
                    defaultValue={value.description}
                    aria-label={`Value ${index + 1} description`}
                    className="min-h-28 resize-y border-dashed bg-background/75 text-center text-sm text-muted-foreground leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Input
              name="ctaTitle"
              defaultValue={content.ctaTitle}
              aria-label="CTA title"
              className="h-auto border-dashed text-center font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-6"
            />
            <Textarea
              name="ctaDescription"
              defaultValue={content.ctaDescription}
              aria-label="CTA description"
              className="mb-8 min-h-24 resize-y border-dashed text-center text-base sm:text-lg text-muted-foreground"
            />
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/shop">Explore Collection</Link>
            </Button>
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
          <h1 className="font-serif text-3xl font-semibold mb-2">Edit About Page</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the editor password to update only the editable text on the About page.
          </p>
          <form action={loginToEdit} className="space-y-4">
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
