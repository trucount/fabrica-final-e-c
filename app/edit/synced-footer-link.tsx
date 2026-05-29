"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type SyncedFooterLinkProps = {
  fallback: string
  href: string
  inputName: string
}

export function SyncedFooterLink({ fallback, href, inputName }: SyncedFooterLinkProps) {
  const [label, setLabel] = useState(fallback)

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${inputName}"]`)

    if (!input) {
      return
    }

    const syncLabel = () => {
      setLabel(input.value.trim() || fallback)
    }

    syncLabel()
    input.addEventListener("input", syncLabel)

    return () => {
      input.removeEventListener("input", syncLabel)
    }
  }, [fallback, inputName])

  return <Link href={href}>{label}</Link>
}
