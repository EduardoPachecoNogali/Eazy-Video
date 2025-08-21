"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, History, Clock, CheckCircle, XCircle } from "lucide-react"
import { getUser, logout, getPromptHistory, type User as UserType, type PromptHistory } from "@/lib/auth"

export function UserMenu() {
  const [user, setUser] = useState<UserType | null>(null)
  const [history, setHistory] = useState<PromptHistory[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setHistory(getPromptHistory())
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      pending: "secondary",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status === "completed" ? "Concluído" : status === "failed" ? "Falhou" : "Pendente"}
      </Badge>
    )
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <History className="mr-2 h-4 w-4" />
              <span>Histórico de Prompts</span>
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Prompts</DialogTitle>
              <DialogDescription>Seus últimos prompts e gerações de vídeo</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum prompt encontrado. Comece gerando seu primeiro vídeo!
                </p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        {getStatusBadge(item.status)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Prompt Original:</p>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">{item.prompt}</p>
                    </div>

                    {item.enhancedPrompt && (
                      <div>
                        <p className="text-sm font-medium mb-1">Prompt Aprimorado:</p>
                        <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">{item.enhancedPrompt}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Duração: {item.duration}s</span>
                      {item.videoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                            Ver Vídeo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
