import type React from "react"
import Link from "next/link"
import { ArrowLeft, Facebook, Instagram, Mail, Phone } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import type { InfoPageContent } from "@/lib/info-page-content"

export function InfoPage({ content }: { content: InfoPageContent }) {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 tracking-tight">
            {content.title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-balance">{content.description}</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
          {content.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {content.contact ? (
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-2 sm:p-6">
            {content.contact.email ? <ContactLink href={`mailto:${content.contact.email}`} icon={<Mail className="h-4 w-4" />} label="Email" value={content.contact.email} /> : null}
            {content.contact.phone ? <ContactLink href={`tel:${content.contact.phone}`} icon={<Phone className="h-4 w-4" />} label="Phone" value={content.contact.phone} /> : null}
            {content.contact.instagram ? <ContactLink href={content.contact.instagram} icon={<Instagram className="h-4 w-4" />} label="Instagram" value="Instagram" /> : null}
            {content.contact.whatsapp ? <ContactLink href={content.contact.whatsapp} icon={<Phone className="h-4 w-4" />} label="WhatsApp" value="WhatsApp" /> : null}
            {content.contact.facebook ? <ContactLink href={content.contact.facebook} icon={<Facebook className="h-4 w-4" />} label="Facebook" value="Facebook" /> : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}


function ContactLink({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3 text-foreground transition-colors hover:bg-secondary">
      {icon}
      <span><span className="text-muted-foreground">{label}: </span>{value}</span>
    </Link>
  )
}
