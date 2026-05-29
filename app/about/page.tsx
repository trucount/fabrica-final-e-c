import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AboutSections } from "@/components/about-sections"
import { getAboutContent } from "@/lib/about-content"

export default async function AboutPage() {
  const content = await getAboutContent()

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 py-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <AboutSections content={content} />
    </div>
  )
}
