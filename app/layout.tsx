import type React from "react"
import type { Metadata } from "next"
import { Geist, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { Toaster } from "@/components/ui/toaster"
import { ShippingTicker } from "@/components/shipping-ticker"
import { SparrowChatbot } from "@/components/sparrow-chatbot"
import Script from "next/script"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID ?? "c20d65b2-a78a-44f3-9d1b-62abfcb63d56"

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
    verification: {
    google: "7QACTD1eG0dTRZ1wKGbWE9O4Qe4g_DJtDi7rcNYeEO4",
  },
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
        url: "",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "",
        type: "image/svg+xml",
      },
    ],
    apple: "",
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
          <SparrowChatbot />
          <Toaster />
        </CartProvider>
        <Analytics />
        <Script defer src="https://cloud.umami.is/script.js" data-website-id={umamiWebsiteId} strategy="afterInteractive" />
      </body>
    </html>
  )
}
