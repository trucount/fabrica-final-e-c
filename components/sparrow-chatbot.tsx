"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Bot, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-context"
import type { SiteContent } from "@/lib/site-content"

type Message = { role: "user" | "assistant"; content: string }

function renderInlineMarkdown(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|https?:\/\/[^\s)]+)/g)

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    const markdownLink = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/)

    if (markdownLink) {
      const [, label, href] = markdownLink
      const externalProps = href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noreferrer" }
      return <a key={key} href={href} className="font-medium underline underline-offset-2" {...externalProps}>{label}</a>
    }

    if (/^https?:\/\//.test(part)) {
      return <a key={key} href={part} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">{part}</a>
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>
    }

    return <span key={key}>{part}</span>
  })
}

function renderMessage(content: string) {
  return content.split("\n").map((line, index) => {
    const listItem = line.match(/^\s*[-*]\s+(.+)$/)

    if (!line.trim()) {
      return <div key={`space-${index}`} className="h-2" />
    }

    if (listItem) {
      return (
        <div key={`line-${index}`} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
          <span>{renderInlineMarkdown(listItem[1], `line-${index}`)}</span>
        </div>
      )
    }

    return <p key={`line-${index}`}>{renderInlineMarkdown(line, `line-${index}`)}</p>
  })
}

export function SparrowChatbot() {
  const pathname = usePathname()
  const { activeTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [brandName, setBrandName] = useState("")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I can help with about information, policies, shipping, returns, and contact options." },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const hidden = useMemo(() => pathname.startsWith("/edit") || pathname.startsWith("/admin") || pathname.startsWith("/cart"), [pathname])

  useEffect(() => {
    if (hidden) return
    fetch("/api/site-content")
      .then((response) => response.ok ? response.json() as Promise<SiteContent> : null)
      .then((content) => setBrandName(content?.brandName ?? "Store"))
      .catch(() => setBrandName("Store"))
  }, [hidden])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (hidden) return null

  const title = `${brandName || "Business"} assistant`

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    const nextMessages: Message[] = [...messages, { role: "user", content: question }]
    setMessages(nextMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const body = (await response.json().catch(() => null)) as { content?: string; error?: string } | null
      if (!response.ok) throw new Error(body?.error ?? "The assistant could not reply right now.")
      setMessages((current) => [...current, { role: "assistant", content: body?.content ?? "I could not find an answer for that." }])
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "The assistant is unavailable right now." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="fixed inset-0 flex flex-col overflow-hidden border bg-background shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[620px] sm:w-[390px] sm:rounded-3xl">
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <div className={`font-serif text-lg font-semibold leading-tight ${activeTheme?.name === "default" ? "text-white" : ""}`}>{title}</div>
              <div className={`text-xs ${activeTheme?.name === "default" ? "text-white/75" : "text-primary-foreground/75"}`}>About, policies, shipping, returns & contact</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className={`${activeTheme?.name === "default" ? "text-white hover:bg-white/10 hover:text-white" : "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-1 rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-primary text-primary-foreground" : "border bg-background text-foreground"}`}>
                  {renderMessage(message.content)}
                </div>
              </div>
            ))}
            {isLoading ? <div className="w-fit rounded-2xl border bg-background px-4 py-3 text-sm text-muted-foreground">Assistant is thinking...</div> : null}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t bg-background p-3">
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about policies or contact..." className="h-11" />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-11 w-11"><Send className="h-4 w-4" /></Button>
          </form>
          <div className="border-t px-4 py-2 text-center text-[11px] text-muted-foreground">Powered by Sparrow AI Solutions</div>
        </section>
      ) : (
        <Button onClick={() => setOpen(true)} size="icon" aria-label="Open assistant" className="h-14 w-14 rounded-full shadow-2xl"><Bot className="h-6 w-6" /></Button>
      )}
    </div>
  )
}
