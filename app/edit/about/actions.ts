"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { saveAboutContent, type AboutContent } from "@/lib/about-content"

import { EDIT_SESSION_COOKIE } from "./constants"

const EDIT_PASSWORD = "sparrowaisoultions"

export async function loginToEdit(formData: FormData) {
  const password = String(formData.get("password") ?? "")

  if (password !== EDIT_PASSWORD) {
    redirect("/edit/about?error=1")
  }

  const cookieStore = await cookies()
  cookieStore.set(EDIT_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/edit",
    maxAge: 60 * 60 * 8,
  })

  redirect("/edit/about")
}

export async function logoutFromEdit() {
  const cookieStore = await cookies()
  cookieStore.delete(EDIT_SESSION_COOKIE)
  redirect("/edit/about")
}

export async function saveEditedAboutContent(formData: FormData) {
  const cookieStore = await cookies()

  if (cookieStore.get(EDIT_SESSION_COOKIE)?.value !== "authenticated") {
    redirect("/edit/about?error=auth")
  }

  const content: AboutContent = {
    heroTitle: getRequiredText(formData, "heroTitle"),
    heroSubtitle: getRequiredText(formData, "heroSubtitle"),
    storyTitle: getRequiredText(formData, "storyTitle"),
    storyParagraphs: formData.getAll("storyParagraphs").map(toText).filter(Boolean),
    valuesTitle: getRequiredText(formData, "valuesTitle"),
    values: [0, 1, 2].map((index) => ({
      title: getRequiredText(formData, `values.${index}.title`),
      description: getRequiredText(formData, `values.${index}.description`),
    })),
    ctaTitle: getRequiredText(formData, "ctaTitle"),
    ctaDescription: getRequiredText(formData, "ctaDescription"),
  }

  await saveAboutContent(content)
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/edit/about")

  redirect("/edit/about?saved=1")
}

function getRequiredText(formData: FormData, key: string) {
  const value = toText(formData.get(key))

  if (!value) {
    throw new Error(`${key} is required`)
  }

  return value
}

function toText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}
