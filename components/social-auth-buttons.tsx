"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SocialAuthButtonsProps = {
  next: string
  mode: "login" | "signup"
  className?: string
}

type SocialProvider = {
  id: "clerk" | "google" | "github"
  label: string
  Icon: (props: { className?: string }) => React.ReactNode
}

const socialProviders: SocialProvider[] = [
  { id: "clerk", label: "Clerk", Icon: ClerkIcon },
  { id: "google", label: "Google", Icon: GoogleIcon },
]

function socialAuthHref(provider: SocialProvider["id"], next: string) {
  const params = new URLSearchParams({ provider, next })
  return `/api/commerce/auth/social?${params.toString()}`
}

function ClerkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect width="24" height="24" rx="6" fill="#6C47FF" />
      <path d="M12 6.25a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 4.94-2.81l-2.35-1.36A3.03 3.03 0 1 1 12 8.97c1.08 0 2.03.56 2.58 1.4l2.36-1.35A5.75 5.75 0 0 0 12 6.25Z" fill="white" />
      <circle cx="12" cy="12" r="1.65" fill="white" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#4285F4" d="M21.6 12.23c0-.76-.07-1.49-.2-2.18H12v4.13h5.37a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.48Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.29l-3.23-2.51c-.9.6-2.04.95-3.38.95-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A9.99 9.99 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14.03A6.01 6.01 0 0 1 6.08 12c0-.7.12-1.39.32-2.03V7.38H3.06A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.06 4.62l3.34-2.59Z" />
      <path fill="#EA4335" d="M12 5.85c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.95 2.87 14.7 2 12 2a9.99 9.99 0 0 0-8.94 5.38L6.4 9.97C7.19 7.61 9.4 5.85 12 5.85Z" />
    </svg>
  )
}

export function SocialAuthButtons({ next, mode, className }: SocialAuthButtonsProps) {
  const action = mode === "login" ? "Continue with" : "Sign up with"

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative flex items-center justify-center">
        <span className="absolute inset-x-0 top-1/2 border-t" />
        <span className="relative bg-background px-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">or</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {socialProviders.map(({ id, label, Icon }) => (
          <Button key={id} asChild type="button" variant="outline" className="h-11 justify-center gap-2">
            <a href={socialAuthHref(id, next)}>
              <Icon className="h-5 w-5" />
              <span>{action} {label}</span>
            </a>
          </Button>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Social sign-in uses your Supabase Auth provider settings. Enable Clerk or Google in Supabase before going live.
      </p>
    </div>
  )
}
