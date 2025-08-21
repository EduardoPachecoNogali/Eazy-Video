"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Video, Home, Edit3, Menu, X } from "lucide-react"
import { useState } from "react"
import { UserMenu } from "@/components/user-menu"

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Início", icon: Home },
    { href: "/generate", label: "Gerar Vídeo", icon: Video },
    { href: "/edit", label: "Editar Vídeo", icon: Edit3 },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between opacity-100">
          {/* Logo com efeito glass */}
          <Link href="/" className="flex items-center space-x-2 glass-button px-4 py-2 rounded-xl">
            <Video className="h-8 w-8 text-primary" />
            <span className="text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-sky-600 font-sans font-semibold">
              EAZY VIDEO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium ${
                    isActive
                      ? "glass-button text-primary shadow-lg"
                      : "text-foreground/70 hover:text-foreground hover:glass-button"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass-button rounded-xl"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? "glass-button text-primary"
                        : "text-foreground/70 hover:text-foreground hover:glass-button"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
