import type { ReactNode } from "react"
import { cookies } from "next/headers"
import Image from "next/image"
import { LogOut, Plus, Save, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCollections } from "@/lib/collections-data"
import { ADMIN_SESSION_COOKIE } from "./constants"
import { createAdminCollection, deleteAdminCollection, loginToAdmin, logoutFromAdmin, updateAdminCollection } from "./actions"

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies()
  const params = (await searchParams) ?? {}
  const isAuthenticated = cookieStore.get(ADMIN_SESSION_COOKIE)?.value === "authenticated"

  if (!isAuthenticated) {
    return <AdminLoginPage error={params.error === "1" || params.error === "auth"} />
  }

  const collections = await getCollections()
  const saved = typeof params.saved === "string" ? params.saved : ""

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">Manage collection cards shown on Home and Collections pages.</p>
            {saved ? <p className="mt-2 text-sm text-green-600">Collection {saved} successfully.</p> : null}
          </div>
          <form action={logoutFromAdmin}>
            <Button type="submit" variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>

        <Tabs defaultValue="collections" className="gap-6">
          <TabsList>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="products" disabled>
              Products later
            </TabsTrigger>
            <TabsTrigger value="orders" disabled>
              Orders later
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="space-y-8">
            <section className="rounded-lg border p-4 sm:p-6">
              <h2 className="font-serif text-2xl font-semibold mb-4">Add Collection</h2>
              <form action={createAdminCollection} encType="multipart/form-data" className="grid gap-4 lg:grid-cols-6">
                <Field label="ID / slug" className="lg:col-span-2">
                  <Input name="id" placeholder="executive" required />
                </Field>
                <Field label="Name" className="lg:col-span-2">
                  <Input name="name" placeholder="Executive Collection" required />
                </Field>
                <Field label="Items label" className="lg:col-span-1">
                  <Input name="items" placeholder="12 items" required />
                </Field>
                <Field label="Sort" className="lg:col-span-1">
                  <Input name="sortOrder" type="number" defaultValue="0" required />
                </Field>
                <Field label="Image URL" className="lg:col-span-3">
                  <Input name="image" placeholder="https://... or /image.jpg" />
                </Field>
                <Field label="Or upload image to Supabase bucket pic" className="lg:col-span-3">
                  <Input name="imageFile" type="file" accept="image/*" />
                </Field>
                <Field label="Description" className="lg:col-span-6">
                  <Textarea name="description" placeholder="Collection description" className="min-h-24" required />
                </Field>
                <div className="lg:col-span-6">
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Collection
                  </Button>
                </div>
              </form>
            </section>

            <section className="rounded-lg border p-4 sm:p-6">
              <h2 className="font-serif text-2xl font-semibold mb-4">Collections Table</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Sort</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>
                        <div className="relative h-20 w-16 overflow-hidden rounded bg-secondary">
                          <Image src={collection.image} alt={collection.name} fill className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="min-w-64 whitespace-normal">
                        <form id={`collection-${collection.id}`} action={updateAdminCollection} encType="multipart/form-data" className="space-y-3">
                          <input type="hidden" name="originalId" defaultValue={collection.id} />
                          <Label className="text-xs text-muted-foreground">ID / slug</Label>
                          <Input name="id" defaultValue={collection.id} required />
                          <Label className="text-xs text-muted-foreground">Name</Label>
                          <Input name="name" defaultValue={collection.name} required />
                          <Label className="text-xs text-muted-foreground">Items label</Label>
                          <Input name="items" defaultValue={collection.items} required />
                        </form>
                      </TableCell>
                      <TableCell className="min-w-80 whitespace-normal">
                        <Textarea
                          form={`collection-${collection.id}`}
                          name="description"
                          defaultValue={collection.description}
                          className="min-h-32"
                          required
                        />
                      </TableCell>
                      <TableCell className="min-w-80 whitespace-normal">
                        <div className="space-y-3">
                          <Input form={`collection-${collection.id}`} name="image" defaultValue={collection.image} required />
                          <Input form={`collection-${collection.id}`} name="imageFile" type="file" accept="image/*" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          form={`collection-${collection.id}`}
                          name="sortOrder"
                          type="number"
                          defaultValue={collection.sortOrder}
                          className="w-24"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Button form={`collection-${collection.id}`} type="submit" size="sm">
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <form action={deleteAdminCollection}>
                            <input type="hidden" name="id" defaultValue={collection.id} />
                            <Button type="submit" size="sm" variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function AdminLoginPage({ error }: { error: boolean }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-semibold mb-2">Admin</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the admin password to manage collections.
          </p>
          <form action={loginToAdmin} className="space-y-4">
            <div>
              <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              {error ? <p className="mt-2 text-sm text-destructive">Incorrect password. Please try again.</p> : null}
            </div>
            <Button type="submit" className="w-full">
              Unlock Admin
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

function Field({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  )
}
