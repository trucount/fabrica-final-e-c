"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, Menu } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useCart } from "./cart-provider"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import type { SiteContent } from "@/lib/site-content"

export function Header() {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null)
  const pathname = usePathname()
  const isEditing = pathname.startsWith("/edit")
  const homeHref = isEditing ? "/edit" : "/"
  const shopHref = isEditing ? "/edit/shop" : "/shop"
  const collectionsHref = isEditing ? "/edit/collections" : "/collections"
  const aboutHref = isEditing ? "/edit/about" : "/about"

  useEffect(() => {
    let isMounted = true

    fetch("/api/site-content")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load site content")
        }

        return response.json() as Promise<SiteContent>
      })
      .then((content) => {
        if (isMounted) {
          setSiteContent(content)
        }
      })
      .catch((error) => {
        console.error(error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const brandName = siteContent?.brandName ?? ""

  return (
    <header className="relative w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={homeHref} className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight">

          <span>{brandName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href={shopHref} className="text-sm font-medium hover:text-muted-foreground transition-colors">
            Shop
          </Link>
          <Link href={collectionsHref} className="text-sm font-medium hover:text-muted-foreground transition-colors">
            Collections
          </Link>
          <Link href={aboutHref} className="text-sm font-medium hover:text-muted-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="outline" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium animate-in zoom-in-50 duration-200">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Cart ({itemCount} items)</span>
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] sm:w-[350px] px-6 [&>button]:border-0 [&>button]:shadow-none [&>button]:ring-0 [&>button]:top-8"
            >
              <div className="flex flex-col gap-8 pt-8">
                <div className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight">

                  <span>{brandName}</span>
                </div>

                <nav className="flex flex-col gap-0">
                  <Link
                    href={shopHref}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium py-5 px-4 border-b border-border hover:bg-accent transition-colors"
                  >
                    Shop
                  </Link>
                  <Link
                    href={collectionsHref}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium py-5 px-4 border-b border-border hover:bg-accent transition-colors"
                  >
                    Collections
                  </Link>
                  <Link
                    href={aboutHref}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium py-5 px-4 border-b border-border hover:bg-accent transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium py-5 px-4 border-b border-border hover:bg-accent transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium py-5 px-4 border-b border-border hover:bg-accent transition-colors flex items-center justify-between"
                  >
                    <span>Cart</span>
                    {itemCount > 0 && (
                      <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
