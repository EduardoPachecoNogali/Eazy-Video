"use client"

import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

function ConditionalNavigation() {
  const pathname = usePathname()

  // Don't show navigation on login page
  if (pathname === "/login") {
    return null
  }

  return <Navigation />
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <body className="min-h-screen bg-background font-sans antialiased">
      <ConditionalNavigation />
      <main className="flex-1">{children}</main>
      <Toaster />
    </body>
  )
}
