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
import { requireEditPageAccess } from "./auth"

const EDIT_PASSWORD = "sparrowaisolutions"

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
  const destination = "/edit"
  await requireEditorSession(`${destination}?error=auth`)
  requireSavePassword(formData, destination)

  const content: HomeContent = {
    heroTitle: getRequiredText(formData, "heroTitle", destination),
    heroSubtitle: getRequiredText(formData, "heroSubtitle", destination),
    collectionsTitle: getRequiredText(formData, "collectionsTitle", destination),
    newArrivalsTitle: getRequiredText(formData, "newArrivalsTitle", destination),
    bestSellersTitle: getRequiredText(formData, "bestSellersTitle", destination),
    footerTagline: getRequiredText(formData, "footerTagline", destination),
  }

  const siteContent: SiteContent = {
    brandName: getRequiredText(formData, "brandName", destination),
    tickerMessages: formData.getAll("tickerMessages").map(toText).filter(Boolean),
  }
  const aboutContent = getAboutContentFromForm(formData, destination)

  await Promise.all([saveHomeContent(content), saveSiteContent(siteContent), saveAboutContent(aboutContent)])
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/edit")
  revalidatePath("/edit/about")

  redirect("/edit?saved=1")
}

export async function saveEditedShopContent(formData: FormData) {
  const destination = "/edit/shop"
  await requireEditorSession(`${destination}?error=auth`)
  requireSavePassword(formData, destination)

  const content: ShopContent = {
    title: getRequiredText(formData, "title", destination),
  }

  await saveShopContent(content)
  revalidatePath("/shop")
  revalidatePath("/edit/shop")

  redirect("/edit/shop?saved=1")
}

export async function saveEditedCollectionsContent(formData: FormData) {
  const destination = "/edit/collections"
  await requireEditorSession(`${destination}?error=auth`)
  requireSavePassword(formData, destination)

  const content: CollectionsContent = {
    title: getRequiredText(formData, "title", destination),
    description: getRequiredText(formData, "description", destination),
    featuredTitle: getRequiredText(formData, "featuredTitle", destination),
    featuredDescription: getRequiredText(formData, "featuredDescription", destination),
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

  const destination = `/edit/${slug}`
  await requireEditorSession(`${destination}?error=auth`)
  requireSavePassword(formData, destination)

  const content: InfoPageContent = {
    title: getRequiredText(formData, "title", destination),
    description: getRequiredText(formData, "description", destination),
    body: getRequiredTextList(formData, "body", destination),
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
  })

  redirect(destination)
}

async function requireEditorSession(destination: string) {
  await requireEditPageAccess(destination)
}

function requireSavePassword(formData: FormData, destination: string) {
  if (String(formData.get("savePassword") ?? "") !== EDIT_PASSWORD) {
    redirect(`${destination}?error=save`)
  }
}

function getAboutContentFromForm(formData: FormData, destination: string): AboutContent {
  return {
    heroTitle: getRequiredText(formData, "about.heroTitle", destination),
    heroSubtitle: getRequiredText(formData, "about.heroSubtitle", destination),
    storyTitle: getRequiredText(formData, "about.storyTitle", destination),
    storyParagraphs: getRequiredTextList(formData, "about.storyParagraphs", destination),
    valuesTitle: getRequiredText(formData, "about.valuesTitle", destination),
    values: [0, 1, 2].map((index) => ({
      title: getRequiredText(formData, `about.values.${index}.title`, destination),
      description: getRequiredText(formData, `about.values.${index}.description`, destination),
    })),
    ctaTitle: getRequiredText(formData, "about.ctaTitle", destination),
    ctaDescription: getRequiredText(formData, "about.ctaDescription", destination),
  }
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
