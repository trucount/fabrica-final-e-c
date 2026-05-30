"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { saveAboutContent, type AboutContent } from "@/lib/about-content"

import { EDIT_SESSION_COOKIE } from "../constants"
import { requireEditPageAccess } from "../auth"

const EDIT_PASSWORD = "sparrowaisolutions"

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
  })

  redirect("/edit/about")
}

export async function logoutFromEdit() {
  const cookieStore = await cookies()
  cookieStore.delete(EDIT_SESSION_COOKIE)
  redirect("/edit/about")
}

export async function saveEditedAboutContent(formData: FormData) {
  const destination = "/edit/about"
  await requireEditPageAccess(`${destination}?error=auth`)

  if (String(formData.get("savePassword") ?? "") !== EDIT_PASSWORD) {
    redirect(`${destination}?error=save`)
  }

  const content: AboutContent = {
    heroTitle: getRequiredText(formData, "heroTitle", destination),
    heroSubtitle: getRequiredText(formData, "heroSubtitle", destination),
    storyTitle: getRequiredText(formData, "storyTitle", destination),
    storyParagraphs: getRequiredTextList(formData, "storyParagraphs", destination),
    valuesTitle: getRequiredText(formData, "valuesTitle", destination),
    values: [0, 1, 2].map((index) => ({
      title: getRequiredText(formData, `values.${index}.title`, destination),
      description: getRequiredText(formData, `values.${index}.description`, destination),
    })),
    ctaTitle: getRequiredText(formData, "ctaTitle", destination),
    ctaDescription: getRequiredText(formData, "ctaDescription", destination),
  }

  await saveAboutContent(content)
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/edit/about")

  redirect("/edit/about?saved=1")
}

function getRequiredText(formData: FormData, key: string, destination: string) {
  const value = toText(formData.get(key))

  if (!value) {
    redirect(`${destination}?error=required`)
  }

  return value
}

function getRequiredTextList(formData: FormData, key: string, destination: string) {
  const values = formData.getAll(key).map(toText).filter(Boolean)

  if (!values.length) {
    redirect(`${destination}?error=required`)
  }

  return values
}

function toText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}
