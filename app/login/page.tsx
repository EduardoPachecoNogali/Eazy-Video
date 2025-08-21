"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Video, Sparkles } from "lucide-react"
import { setUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e email.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
    }

    setUser(user)

    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo, ${user.name}!`,
    })

    router.push("/")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background com efeito liquid glass */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,197,253,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(196,181,253,0.1),transparent_50%)]" />

      {/* Card de login com efeito glass */}
      <Card className="w-full max-w-md glass-card border-0 relative z-10 float-animation">
        <CardHeader className="text-center space-y-4">
          {/* Logo com efeito glass */}
          <div className="flex justify-center">
            <div className="glass-button p-4 rounded-full">
              <Video className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-serif">
              EAZY VIDEO
            </CardTitle>
            <CardDescription className="text-foreground/70 mt-2 text-lg">
              Entre para começar a criar vídeos incríveis com IA
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground/80 font-medium">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-button border-0 bg-transparent placeholder:text-foreground/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-button border-0 bg-transparent placeholder:text-foreground/50"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full glass-button border-0 py-3 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Entrar
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="glass-card rounded-xl p-3">
              <p className="text-sm text-foreground/60">Demo - Seus dados são salvos localmente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
