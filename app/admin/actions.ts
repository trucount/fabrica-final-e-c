"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  deleteCollection,
  uploadCollectionImage,
  upsertCollection,
  type CollectionInput,
} from "@/lib/collections-data"
import { ADMIN_SESSION_COOKIE } from "./constants"

const ADMIN_PASSWORD = "sparrowaisoultions"

export async function loginToAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "")

  if (password !== ADMIN_PASSWORD) {
    redirect("/admin?error=1")
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
  })

  redirect("/admin")
}

export async function logoutFromAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  redirect("/admin")
}

export async function createAdminCollection(formData: FormData) {
  await requireAdminSession()
  const collection = await getCollectionInputFromForm(formData)

  await upsertCollection(collection)
  revalidateCollectionPages()
  redirect("/admin?saved=created")
}

export async function updateAdminCollection(formData: FormData) {
  await requireAdminSession()
  const originalId = getRequiredText(formData, "originalId")
  const collection = await getCollectionInputFromForm(formData)

  await upsertCollection(collection)

  if (originalId !== collection.id) {
    await deleteCollection(originalId)
  }

  revalidateCollectionPages()
  redirect("/admin?saved=updated")
}

export async function deleteAdminCollection(formData: FormData) {
  await requireAdminSession()
  const id = getRequiredText(formData, "id")

  await deleteCollection(id)
  revalidateCollectionPages()
  redirect("/admin?saved=deleted")
}

async function requireAdminSession() {
  const cookieStore = await cookies()

  if (cookieStore.get(ADMIN_SESSION_COOKIE)?.value !== "authenticated") {
    redirect("/admin?error=auth")
  }
}

async function getCollectionInputFromForm(formData: FormData): Promise<CollectionInput> {
  const id = slugify(getRequiredText(formData, "id"))

  if (!id) {
    throw new Error("Collection ID must include at least one letter or number.")
  }

  const existingImage = toText(formData.get("image"))
  const imageFile = formData.get("imageFile")
  const image = isUploadedFile(imageFile) ? await uploadCollectionImage(imageFile, id) : existingImage

  if (!image) {
    throw new Error("Collection image URL or uploaded image is required.")
  }

  return {
    id,
    name: getRequiredText(formData, "name"),
    description: getRequiredText(formData, "description"),
    image,
    items: getRequiredText(formData, "items"),
    sortOrder: getRequiredNumber(formData, "sortOrder"),
  }
}

function revalidateCollectionPages() {
  revalidatePath("/")
  revalidatePath("/collections")
  revalidatePath("/edit")
  revalidatePath("/edit/collections")
  revalidatePath("/admin")
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function getRequiredText(formData: FormData, key: string) {
  const value = toText(formData.get(key))

  if (!value) {
    throw new Error(`${key} is required`)
  }

  return value
}

function getRequiredNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key))

  if (!Number.isFinite(value)) {
    throw new Error(`${key} must be a number`)
  }

  return value
}

function toText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim()
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0
}
