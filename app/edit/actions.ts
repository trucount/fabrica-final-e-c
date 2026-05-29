"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { saveCollectionsContent, type CollectionsContent } from "@/lib/collections-content"
import { saveHomeContent, type HomeContent } from "@/lib/home-content"
import { saveSiteContent, type SiteContent } from "@/lib/site-content"
import { saveAboutContent, type AboutContent } from "@/lib/about-content"
import { saveShopContent, type ShopContent } from "@/lib/shop-content"
import { parseInfoPageSlug, saveInfoPageContent, type InfoPageContent } from "@/lib/info-page-content"
import { EDIT_SESSION_COOKIE } from "./constants"

const EDIT_PASSWORD = "sparrowaisoultions"

export async function loginToHomeEdit(formData: FormData) {
  await loginToEdit(formData, "/edit")
}

export async function loginToShopEdit(formData: FormData) {
  await loginToEdit(formData, "/edit/shop")
}

export async function loginToCollectionsEdit(formData: FormData) {
  await loginToEdit(formData, "/edit/collections")
}

export async function loginToInfoPageEdit(formData: FormData) {
  const slug = parseInfoPageSlug(String(formData.get("slug") ?? ""))
  await loginToEdit(formData, `/edit/${slug}`)
}

export async function logoutFromEdit() {
  const cookieStore = await cookies()
  cookieStore.delete(EDIT_SESSION_COOKIE)
  redirect("/edit")
}

export async function saveEditedHomeContent(formData: FormData) {
  await requireEditorSession("/edit?error=auth")
  requireSavePassword(formData)

  const content: HomeContent = {
    heroTitle: getRequiredText(formData, "heroTitle"),
    heroSubtitle: getRequiredText(formData, "heroSubtitle"),
    collectionsTitle: getRequiredText(formData, "collectionsTitle"),
    newArrivalsTitle: getRequiredText(formData, "newArrivalsTitle"),
    bestSellersTitle: getRequiredText(formData, "bestSellersTitle"),
    footerTagline: getRequiredText(formData, "footerTagline"),
  }

  const siteContent: SiteContent = {
    brandName: getRequiredText(formData, "brandName"),
    tickerMessages: formData.getAll("tickerMessages").map(toText).filter(Boolean),
  }
  const aboutContent = getAboutContentFromForm(formData)

  await Promise.all([saveHomeContent(content), saveSiteContent(siteContent), saveAboutContent(aboutContent)])
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/edit")
  revalidatePath("/edit/about")

  redirect("/edit?saved=1")
}

export async function saveEditedShopContent(formData: FormData) {
  await requireEditorSession("/edit/shop?error=auth")
  requireSavePassword(formData)

  const content: ShopContent = {
    title: getRequiredText(formData, "title"),
  }

  await saveShopContent(content)
  revalidatePath("/shop")
  revalidatePath("/edit/shop")

  redirect("/edit/shop?saved=1")
}

export async function saveEditedCollectionsContent(formData: FormData) {
  await requireEditorSession("/edit/collections?error=auth")
  requireSavePassword(formData)

  const content: CollectionsContent = {
    title: getRequiredText(formData, "title"),
    description: getRequiredText(formData, "description"),
    featuredTitle: getRequiredText(formData, "featuredTitle"),
    featuredDescription: getRequiredText(formData, "featuredDescription"),
  }

  await saveCollectionsContent(content)
  revalidatePath("/")
  revalidatePath("/collections")
  revalidatePath("/edit")
  revalidatePath("/edit/collections")

  redirect("/edit/collections?saved=1")
}

export async function saveEditedInfoPageContent(formData: FormData) {
  const slug = parseInfoPageSlug(String(formData.get("slug") ?? ""))

  await requireEditorSession(`/edit/${slug}?error=auth`)
  requireSavePassword(formData)

  const content: InfoPageContent = {
    title: getRequiredText(formData, "title"),
    description: getRequiredText(formData, "description"),
    body: formData.getAll("body").map(toText).filter(Boolean),
  }

  await saveInfoPageContent(slug, content)
  revalidatePath(`/${slug}`)
  revalidatePath(`/edit/${slug}`)

  redirect(`/edit/${slug}?saved=1`)
}

async function loginToEdit(formData: FormData, destination: string) {
  const password = String(formData.get("password") ?? "")

  if (password !== EDIT_PASSWORD) {
    redirect(`${destination}?error=1`)
  }

  const cookieStore = await cookies()
  cookieStore.set(EDIT_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/edit",
    maxAge: 60 * 60 * 8,
  })

  redirect(destination)
}

async function requireEditorSession(destination: string) {
  const cookieStore = await cookies()

  if (cookieStore.get(EDIT_SESSION_COOKIE)?.value !== "authenticated") {
    redirect(destination)
  }
}

function requireSavePassword(formData: FormData) {
  if (String(formData.get("savePassword") ?? "") !== EDIT_PASSWORD) {
    throw new Error("Incorrect password. Changes were not saved.")
  }
}

function getAboutContentFromForm(formData: FormData): AboutContent {
  return {
    heroTitle: getRequiredText(formData, "about.heroTitle"),
    heroSubtitle: getRequiredText(formData, "about.heroSubtitle"),
    storyTitle: getRequiredText(formData, "about.storyTitle"),
    storyParagraphs: formData.getAll("about.storyParagraphs").map(toText).filter(Boolean),
    valuesTitle: getRequiredText(formData, "about.valuesTitle"),
    values: [0, 1, 2].map((index) => ({
      title: getRequiredText(formData, `about.values.${index}.title`),
      description: getRequiredText(formData, `about.values.${index}.description`),
    })),
    ctaTitle: getRequiredText(formData, "about.ctaTitle"),
    ctaDescription: getRequiredText(formData, "about.ctaDescription"),
  }
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
