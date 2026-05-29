"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { saveCollectionsContent, type CollectionsContent } from "@/lib/collections-content"
import { saveHomeContent, type HomeContent } from "@/lib/home-content"
import { saveShopContent, type ShopContent } from "@/lib/shop-content"
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

export async function logoutFromEdit() {
  const cookieStore = await cookies()
  cookieStore.delete(EDIT_SESSION_COOKIE)
  redirect("/edit")
}

export async function saveEditedHomeContent(formData: FormData) {
  await requireEditorSession("/edit?error=auth")

  const content: HomeContent = {
    heroTitle: getRequiredText(formData, "heroTitle"),
    heroSubtitle: getRequiredText(formData, "heroSubtitle"),
    collectionsTitle: getRequiredText(formData, "collectionsTitle"),
    newArrivalsTitle: getRequiredText(formData, "newArrivalsTitle"),
    bestSellersTitle: getRequiredText(formData, "bestSellersTitle"),
    footerTagline: getRequiredText(formData, "footerTagline"),
  }

  await saveHomeContent(content)
  revalidatePath("/")
  revalidatePath("/edit")

  redirect("/edit?saved=1")
}

export async function saveEditedShopContent(formData: FormData) {
  await requireEditorSession("/edit/shop?error=auth")

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
