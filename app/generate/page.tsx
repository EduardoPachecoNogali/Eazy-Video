"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Sparkles, Check, Edit, Download, MessageSquare, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { getUser, addToPromptHistory, type PromptHistory } from "@/lib/auth"

/**
 * Página de geração de vídeos por IA com estética Liquid Glass
 * Fluxo completo: prompt inicial → refinamento com Gemini → aprovação → geração com Veo → feedback
 * Inclui autenticação obrigatória e histórico de prompts
 */
export default function Generate() {
  // Estados do formulário principal
  const [prompt, setPrompt] = useState("") // Prompt inicial do usuário
  const [duration, setDuration] = useState("8") // Duração do vídeo em segundos
  const [audioEnabled, setAudioEnabled] = useState(true) // Se deve incluir áudio

  // Estados do processo de geração
  const [status, setStatus] = useState("") // Status atual do processo
  const [videoUrl, setVideoUrl] = useState("") // URL do vídeo gerado
  const [taskId, setTaskId] = useState<string | null>(null) // ID da tarefa de geração
  const [enhancedPrompt, setEnhancedPrompt] = useState("") // Prompt refinado pela IA
  const [isReviewing, setIsReviewing] = useState(false) // Se está na fase de revisão
  const [progress, setProgress] = useState(0) // Progresso da geração (0-100)
  const [isLoading, setIsLoading] = useState(false) // Loading state geral

  // Estados do sistema de feedback
  const [feedback, setFeedback] = useState("") // Comentário do usuário
  const [showFeedback, setShowFeedback] = useState(false) // Se deve mostrar formulário de feedback
  const [rating, setRating] = useState(0) // Avaliação de 1-5 estrelas

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push("/login")
    }
  }, [router])

  /**
   * Primeira etapa: Refinamento do prompt usando Gemini API
   * Envia o prompt inicial para ser melhorado pela IA
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("Refinando prompt com IA...")
    setVideoUrl("")
    setEnhancedPrompt("")

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, duration: Number.parseInt(duration), audioEnabled }),
      })
      const data = await res.json()

      if (data.error) {
        setStatus(`Erro: ${data.error}`)
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      // Mostra o prompt refinado para revisão
      setEnhancedPrompt(data.enhancedPrompt)
      setIsReviewing(true)
      setStatus("Revise o prompt melhorado abaixo:")
      toast({
        title: "Prompt refinado!",
        description: "Revise e aprove o prompt melhorado pela IA.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setStatus(`Erro: ${errorMessage}`)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Segunda etapa: Aprovação e início da geração
   * Após o usuário aprovar o prompt refinado, inicia a geração do vídeo
   */
  const handleApprove = async () => {
    setIsLoading(true)
    setStatus("Iniciando geração de vídeo...")
    setIsReviewing(false)
    setProgress(0)

    try {
      const res = await fetch("/api/video/generate/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          duration: Number.parseInt(duration),
          audio: audioEnabled,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setStatus(`Erro: ${data.error}`)
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      setTaskId(data.taskId)
      setStatus("Gerando vídeo... Isso pode levar alguns minutos.")

      const historyItem: PromptHistory = {
        id: data.taskId,
        prompt,
        enhancedPrompt,
        createdAt: new Date(),
        status: "pending",
        duration: Number.parseInt(duration),
      }
      addToPromptHistory(historyItem)

      // Inicia o polling de status
      pollStatus(data.taskId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setStatus(`Erro: ${errorMessage}`)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Sistema de polling para verificar status da geração
   * Verifica a cada 3 segundos se o vídeo está pronto
   */
  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/status/${id}`)
        const data = await res.json()

        if (data.status === "completed") {
          // Vídeo pronto - mostra resultado e formulário de feedback
          setStatus("Vídeo gerado com sucesso!")
          setVideoUrl(data.videoUrl)
          setProgress(100)
          setShowFeedback(true)
          clearInterval(interval)

          const history = JSON.parse(localStorage.getItem("promptHistory") || "[]")
          const updatedHistory = history.map((item: PromptHistory) =>
            item.id === id ? { ...item, status: "completed", videoUrl: data.videoUrl } : item,
          )
          localStorage.setItem("promptHistory", JSON.stringify(updatedHistory))

          toast({
            title: "Vídeo pronto!",
            description: "Seu vídeo foi gerado com sucesso.",
          })
        } else if (data.status === "error") {
          // Erro na geração
          setStatus("Erro na geração do vídeo. Tente novamente.")
          clearInterval(interval)

          const history = JSON.parse(localStorage.getItem("promptHistory") || "[]")
          const updatedHistory = history.map((item: PromptHistory) =>
            item.id === id ? { ...item, status: "failed" } : item,
          )
          localStorage.setItem("promptHistory", JSON.stringify(updatedHistory))

          toast({
            title: "Erro na geração",
            description: "Falha na geração do vídeo",
            variant: "destructive",
          })
        } else {
          // Ainda processando - atualiza progresso
          setProgress(data.progress || 0)
          setStatus(`Gerando vídeo... ${data.progress || 0}%`)
        }
      } catch (error) {
        setStatus("Erro ao verificar status")
        clearInterval(interval)
      }
    }, 3000) // Verifica a cada 3 segundos
  }

  /**
   * Permite editar o prompt refinado
   * Volta para o estado inicial com o prompt melhorado
   */
  const handleEdit = () => {
    setPrompt(enhancedPrompt)
    setEnhancedPrompt("")
    setIsReviewing(false)
    setStatus("")
  }

  /**
   * Sistema de feedback e avaliação
   * Coleta feedback do usuário para melhorar futuras gerações
   */
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback || !taskId) return

    try {
      const res = await fetch(`/api/video/feedback/${taskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback,
          rating,
          originalPrompt: prompt,
          enhancedPrompt,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setStatus(`Erro: ${data.error}`)
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      setStatus("Feedback recebido! Obrigado pela avaliação.")
      setShowFeedback(false)
      setFeedback("")
      toast({
        title: "Feedback enviado!",
        description: "Obrigado por sua avaliação.",
      })

      // Se avaliação baixa, sugere refazer
      if (rating <= 2) {
        setStatus("Sugestão: Refaça o prompt com base no feedback para melhores resultados.")
        setPrompt("")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      setStatus(`Erro: ${errorMessage}`)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden py-8">
        {/* Background com efeito liquid glass */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,197,253,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header da página */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4 glass-button rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-serif bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-sky-600">
              Geração de Vídeos por IA
            </h1>
            <p className="text-foreground/70 text-lg">
              Descreva sua ideia e nossa IA criará um vídeo profissional para você
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="glass-card border-0 float-animation">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  Criar Novo Vídeo
                </CardTitle>
                <CardDescription className="text-foreground/70">
                  Preencha os detalhes abaixo para gerar seu vídeo personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário principal de entrada */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Campo de descrição do vídeo */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-foreground/80 font-medium">
                      Descrição do Vídeo
                    </Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex.: Um gato laranja voando sobre uma cidade futurística ao pôr do sol"
                      className="min-h-[100px] glass-button border-0 bg-transparent placeholder:text-foreground/50"
                      required
                    />
                    <p className="text-sm text-foreground/60">
                      Seja específico! Nossa IA refinará automaticamente sua descrição.
                    </p>
                  </div>

                  {/* Configurações de duração e áudio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-foreground/80 font-medium">
                        Duração (segundos)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        min="1"
                        max="8"
                        className="glass-button border-0 bg-transparent"
                        required
                      />
                      <p className="text-sm text-foreground/60">Máximo: 8 segundos</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-medium">Opções de Áudio</Label>
                      <div className="flex items-center space-x-2 glass-button rounded-xl p-3">
                        <Checkbox
                          id="audio"
                          checked={audioEnabled}
                          onCheckedChange={(checked) => setAudioEnabled(checked as boolean)}
                        />
                        <Label htmlFor="audio" className="text-sm text-foreground/70">
                          Incluir áudio (diálogos, efeitos sonoros)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Botão de submissão */}
                  <Button
                    type="submit"
                    className="w-full glass-button border-0 py-3 text-black"
                    disabled={isLoading || isReviewing || showFeedback}
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Refinando Prompt...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Prompt Melhorado
                      </>
                    )}
                  </Button>
                </form>

                {/* Card de revisão do prompt refinado */}
                {isReviewing && enhancedPrompt && (
                  <Card className="glass-card border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Prompt Refinado pela IA</CardTitle>
                      <CardDescription className="text-foreground/70">
                        Nossa IA melhorou sua descrição. Revise e aprove para continuar.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mostra o prompt melhorado */}
                      <div className="glass-card rounded-xl p-4">
                        <p className="text-sm text-foreground/80">{enhancedPrompt}</p>
                      </div>
                      {/* Botões de aprovação ou edição */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleApprove} className="flex-1 glass-button border-0 bg-black text-black">
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar e Gerar
                        </Button>
                        <Button
                          onClick={handleEdit}
                          variant="outline"
                          className="flex-1 glass-button border-0 bg-transparent bg-black"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Prompt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Barra de progresso durante geração */}
                {progress > 0 && progress < 100 && (
                  <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-foreground/80">
                          <span>Progresso da Geração</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mensagens de status */}
                {status && (
                  <Card className="glass-card border-0">
                    <CardContent className="pt-6">
                      <p className="text-center text-foreground/80">{status}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Player de vídeo quando pronto */}
                {videoUrl && (
                  <Card className="glass-card border-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-foreground">Vídeo Pronto!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="video-container">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full rounded-xl"
                          poster="/placeholder.jpg?height=360&width=640&query=video thumbnail"
                        >
                          Seu navegador não suporta o elemento de vídeo.
                        </video>
                      </div>
                      <Button asChild className="w-full glass-button border-0">
                        <a href={videoUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Vídeo
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Formulário de feedback */}
                {showFeedback && (
                  <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center text-foreground">
                        <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
                        Avalie o Resultado
                      </CardTitle>
                      <CardDescription className="text-foreground/70">
                        Seu feedback nos ajuda a melhorar a qualidade dos vídeos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        {/* Sistema de avaliação por estrelas */}
                        <div>
                          <Label className="text-foreground/80 font-medium">Avaliação</Label>
                          <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 transition-colors ${star <= rating ? "text-yellow-400" : "text-foreground/30"}`}
                              >
                                <Star className="h-6 w-6 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Campo de comentários */}
                        <div className="space-y-2">
                          <Label htmlFor="feedback" className="text-foreground/80 font-medium">
                            Comentários
                          </Label>
                          <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Conte-nos o que achou do resultado..."
                            className="glass-button border-0 bg-transparent placeholder:text-foreground/50"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full glass-button border-0">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Enviar Feedback
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
