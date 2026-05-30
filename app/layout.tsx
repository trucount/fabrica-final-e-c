import type React from "react"
import type { Metadata } from "next"
import { Geist, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { Toaster } from "@/components/ui/toaster"
import { ShippingTicker } from "@/components/shipping-ticker"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  applicationName: "ASTERA",
  title: {
    default: "ASTERA | Premium 925 Silver Jewelry",
    template: "%s | ASTERA",
  },
  description:
    "Shop ASTERA for premium 925 sterling silver jewelry, including elegant rings, necklaces, bracelets, and everyday silver jewels.",
  keywords: [
    "ASTERA",
    "ASTERA925",
    "925 silver jewelry",
    "premium silver jewels",
    "sterling silver jewelry",
    "silver rings",
    "silver necklaces",
    "silver bracelets",
  ],
  generator: "saprrow",
  openGraph: {
    title: "ASTERA | Premium 925 Silver Jewelry",
    description:
      "Discover ASTERA premium 925 sterling silver jewelry crafted for timeless everyday elegance.",
    siteName: "ASTERA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASTERA | Premium 925 Silver Jewelry",
    description:
      "Discover ASTERA premium 925 sterling silver jewelry crafted for timeless everyday elegance.",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${playfair.variable} font-sans antialiased`}>
        <CartProvider>
          <ShippingTicker />
          {children}
          <Toaster />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
