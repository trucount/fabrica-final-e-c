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
import {
  deleteProduct,
  FEATURED_PRODUCT_LIMIT,
  getProducts,
  uploadProductImage,
  upsertProduct,
  type ProductInput,
  type ProductSection,
} from "@/lib/products-data"
import { ADMIN_SESSION_COOKIE } from "./constants"
import { requireAdminPageAccess } from "./auth"

const ADMIN_PASSWORD = "sparrowaisolutions"

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

export async function createAdminProduct(formData: FormData) {
  await requireAdminSession()
  const product = await getProductInputFromForm(formData)

  await assertFeaturedProductLimit(product)
  await upsertProduct(product)
  revalidateProductPages()
  redirect(`/admin?tab=products&productTab=${product.section}&saved=product-created`)
}

export async function updateAdminProduct(formData: FormData) {
  await requireAdminSession()
  const originalId = getRequiredText(formData, "originalId")
  const product = await getProductInputFromForm(formData)

  await assertFeaturedProductLimit(product, originalId)
  await upsertProduct(product)

  if (originalId !== product.id) {
    await deleteProduct(originalId)
  }

  revalidateProductPages()
  redirect(`/admin?tab=products&productTab=${product.section}&saved=product-updated`)
}

export async function deleteAdminProduct(formData: FormData) {
  await requireAdminSession()
  const id = getRequiredText(formData, "id")

  await deleteProduct(id)
  revalidateProductPages()
  redirect("/admin?tab=products&saved=product-deleted")
}

async function requireAdminSession() {
  await requireAdminPageAccess()
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
  revalidatePath("/shop")
  revalidatePath("/edit")
  revalidatePath("/edit/collections")
  revalidatePath("/admin")
}

async function getProductInputFromForm(formData: FormData): Promise<ProductInput> {
  const id = slugify(getRequiredText(formData, "id"))

  if (!id) {
    throw new Error("Product ID must include at least one letter or number.")
  }

  const mainImageFile = formData.get("mainImageFile")
  const mainImage = isUploadedFile(mainImageFile)
    ? await uploadProductImage(mainImageFile, id, "main")
    : getRequiredText(formData, "mainImage")
  const galleryFiles = formData.getAll("galleryImageFiles").filter(isUploadedFile)
  const uploadedGalleryImages = await Promise.all(
    galleryFiles.map((file, index) => uploadProductImage(file, id, `gallery-${index + 1}`)),
  )

  return {
    id,
    name: getRequiredText(formData, "name"),
    price: getRequiredNumber(formData, "price"),
    mainImage,
    galleryImages: [...getTextList(formData, "galleryImages"), ...uploadedGalleryImages],
    categoryLabel: toText(formData.get("categoryLabel")),
    description: getRequiredText(formData, "description"),
    details: getRequiredTextList(formData, "details"),
    sizes: getRequiredTextList(formData, "sizes"),
    section: getProductSectionFromForm(formData),
    collectionIds: formData.getAll("collectionIds").map((value) => slugify(toText(value))).filter(Boolean),
    sortOrder: getRequiredNumber(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  }
}

async function assertFeaturedProductLimit(product: ProductInput, originalId?: string) {
  if (product.section === "general") {
    return
  }

  const sectionProducts = await getProducts({ section: product.section, includeInactive: true })
  const wouldAddNewProduct = !sectionProducts.some((item) => item.id === (originalId ?? product.id))

  if (wouldAddNewProduct && sectionProducts.length >= FEATURED_PRODUCT_LIMIT) {
    throw new Error(`Only ${FEATURED_PRODUCT_LIMIT} products are allowed in this home section.`)
  }
}

function revalidateProductPages() {
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/product/[id]", "page")
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

function getProductSectionFromForm(formData: FormData): ProductSection {
  const section = toText(formData.get("section"))

  if (section === "general" || section === "new_arrivals" || section === "best_sellers") {
    return section
  }

  throw new Error("Product section is invalid.")
}

function getRequiredTextList(formData: FormData, key: string) {
  const list = getTextList(formData, key)

  if (!list.length) {
    throw new Error(`${key} needs at least one value`)
  }

  return list
}

function getTextList(formData: FormData, key: string) {
  return toText(formData.get(key))
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}
