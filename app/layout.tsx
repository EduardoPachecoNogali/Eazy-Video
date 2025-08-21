import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ConditionalNavigation } from "@/components/conditional-navigation"
import { Toaster } from "@/components/ui/toaster"

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

export const metadata: Metadata = {
  title: "EAZY VIDEO - Crie Vídeos Incríveis com IA",
  description:
    "Plataforma avançada de geração e edição de vídeos usando inteligência artificial. Transforme suas ideias em vídeos profissionais.",
  keywords: "IA, vídeo, geração, edição, inteligência artificial, Veo 3",
  authors: [{ name: "EAZY VIDEO" }],
  creator: "EAZY VIDEO",
  publisher: "EAZY VIDEO",
  robots: "index, follow",
  openGraph: {
    title: "EAZY VIDEO - Crie Vídeos Incríveis com IA",
    description: "Plataforma avançada de geração e edição de vídeos usando inteligência artificial.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "EAZY VIDEO - Crie Vídeos Incríveis com IA",
    description: "Plataforma avançada de geração e edição de vídeos usando inteligência artificial.",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ConditionalNavigation />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
