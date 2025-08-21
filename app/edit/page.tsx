"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Video, Edit3, Download, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"

export default function EditPage() {
  const [file, setFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [feedback, setFeedback] = useState("")
  const [status, setStatus] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const { toast } = useToast()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.error) {
        setStatus(`Erro: ${data.error}`)
        return
      }

      setStatus("Vídeo carregado com sucesso! Agora você pode editar o prompt.")
    } catch (error) {
      setStatus(`Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("Gerando prompt aprimorado...")
    setIsGenerating(true)

    try {
      const res = await fetch("/api/video/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, feedback }),
      })
      const data = await res.json()

      if (data.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        })
        setStatus(`Erro: ${data.error}`)
        return
      }

      setEnhancedPrompt(data.enhancedPrompt)
      setTaskId(data.taskId)
      setIsReviewing(true)
      setStatus("Revise o prompt aprimorado antes de continuar:")

      toast({
        title: "Sucesso",
        description: "Prompt de edição gerado com sucesso!",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      setStatus(`Erro: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!taskId) return

    setStatus("Iniciando edição do vídeo...")
    setIsReviewing(false)
    setProgress(0)

    try {
      const res = await fetch("/api/video/edit/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, prompt: enhancedPrompt }),
      })
      const data = await res.json()

      if (data.error) {
        setStatus(`Erro: ${data.error}`)
        return
      }

      // Start polling for status
      pollStatus(taskId)
    } catch (error) {
      setStatus(`Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  const handleEdit = () => {
    setPrompt(enhancedPrompt)
    setIsReviewing(false)
    setStatus("Edite o prompt conforme necessário:")
  }

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/video/status/${id}`)
        const data = await res.json()

        if (data.status === "completed") {
          setStatus("Vídeo editado com sucesso!")
          setVideoUrl(data.videoUrl)
          setProgress(100)
          setShowFeedback(true)
          clearInterval(interval)
        } else if (data.status === "error") {
          setStatus("Erro na edição do vídeo. Tente novamente.")
          clearInterval(interval)
        } else {
          setProgress(data.progress || 0)
          setStatus(`Editando vídeo... ${data.progress || 0}%`)
        }
      } catch (error) {
        setStatus("Erro ao verificar status")
        clearInterval(interval)
      }
    }, 3000)
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskId) return

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

      if (data.success) {
        setStatus("Obrigado pelo seu feedback!")
        setShowFeedback(false)
      }
    } catch (error) {
      setStatus("Erro ao enviar feedback")
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Edição de Vídeos por IA</h1>
            <p className="text-gray-600">Faça upload de um vídeo e use IA para aprimorá-lo</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Vídeo
              </CardTitle>
              <CardDescription>Faça upload do vídeo que você deseja editar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="video-file">Arquivo de Vídeo</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-1"
                    required
                  />
                </div>
                <Button type="submit" disabled={!file || isUploading} className="w-full">
                  {isUploading ? "Carregando..." : "Carregar Vídeo"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Prompt de Edição
              </CardTitle>
              <CardDescription>Descreva como você quer editar o vídeo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-prompt">Prompt de Edição</Label>
                  <Input
                    id="edit-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex.: Adicionar música de fundo, melhorar iluminação"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="feedback">Feedback para Refinamento</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ex.: O vídeo está muito escuro, precisa de mais contraste"
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={isReviewing || showFeedback || isGenerating} className="w-full">
                  {isGenerating ? "Gerando..." : "Gerar Prompt de Edição"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isReviewing && enhancedPrompt && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Revisão do Prompt</CardTitle>
                <CardDescription>Revise o prompt aprimorado antes de continuar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Prompt Aprimorado:</p>
                  <p className="text-blue-800">{enhancedPrompt}</p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleApprove} className="flex-1">
                    Aprovar e Editar
                  </Button>
                  <Button onClick={handleEdit} variant="outline" className="flex-1 bg-transparent">
                    Editar Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {progress > 0 && progress < 100 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da Edição</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {videoUrl && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Vídeo Editado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  poster="/placeholder.jpg?height=360&width=640&query=video thumbnail"
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
                <Button asChild className="w-full">
                  <a href={videoUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Vídeo Editado
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {showFeedback && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Avalie o Resultado</CardTitle>
                <CardDescription>Seu feedback nos ajuda a melhorar o serviço</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <Label>Avaliação</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="feedback-text">Comentários</Label>
                    <Textarea
                      id="feedback-text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Conte-nos o que achou do resultado..."
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar Feedback
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {status && (
            <Alert className="mb-6">
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
