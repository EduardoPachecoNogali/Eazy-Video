import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Edit3, Sparkles, Zap, Globe, Download } from "lucide-react"

/**
 * Página inicial do EAZY VIDEO com estética Liquid Glass
 * Apresenta o hero section com call-to-action e cards de funcionalidades
 * Layout responsivo com efeitos de vidro translúcido
 */
export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com efeito de vidro líquido */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,197,253,0.1),transparent_50%)]" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          {/* Ícone principal com efeito glass */}
          <div className="flex justify-center mb-6">
            <div className="p-4 glass-button rounded-full">
              <Video className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Título principal com gradiente */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Gerador e Editor de
            <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
              Vídeos por IA
            </span>
          </h1>

          {/* Descrição com efeito glass */}
          <div className="glass-card rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-xl text-foreground/80">
              Transforme suas ideias em vídeos profissionais usando o poder da inteligência artificial. Refinamento
              automático de prompts e geração de alta qualidade.
            </p>
          </div>

          {/* Botões de call-to-action com efeito glass */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/generate">
              <Button size="lg" className="w-full sm:w-auto glass-button text-lg px-8 py-4 rounded-2xl border-0 bg-transparent text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles w-5 h-5 mr-2"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>Gerar Vídeo
              </Button>
            </Link>
            <Link href="/edit">
              <Button size="lg" className="w-full sm:w-auto glass-button text-lg px-8 py-4 rounded-2xl bg-transparent text-black">
                <Edit3 className="w-5 h-5 mr-2" />
                Editar Vídeo
              </Button>
            </Link>
          </div>
        </div>

        {/* Grid de funcionalidades com cards glass */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Refinamento Inteligente */}
          <Card className="glass-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 glass-button rounded-full">
                  <Sparkles className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-foreground">Refinamento Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/70">
                Nossa IA aprimora automaticamente seus prompts usando Gemini API, detectando idioma e aplicando as
                melhores práticas para resultados superiores.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 2: Geração Rápida */}
          <Card className="glass-card rounded-2xl border-0 overflow-hidden opacity-100">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 glass-button rounded-full">
                  <Zap className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <CardTitle className="text-foreground">Geração Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/70">
                Powered by Veo 3 via fal.ai, geramos vídeos de alta qualidade em segundos. Suporte completo para áudio,
                diferentes estilos e formatos.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 3: Suporte Multilíngue */}
          <Card className="glass-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 glass-button rounded-full">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-foreground">Multilíngue</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/70">
                Detecção automática de idioma e suporte nativo para português, inglês, espanhol e outros idiomas com
                contextualização cultural.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 4: Edição Avançada */}
          <Card className="glass-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 glass-button rounded-full">
                  <Edit3 className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <CardTitle className="text-foreground">Edição Avançada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/70">
                Ferramentas completas de edição com feedback inteligente, loops de refinamento e ajustes baseados em
                suas preferências.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 5: Download Instantâneo */}
          <Card className="glass-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 glass-button rounded-full">
                  <Download className="w-6 h-6 text-cyan-500" />
                </div>
              </div>
              <CardTitle className="text-foreground">Download Instantâneo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/70">
                Baixe seus vídeos em alta qualidade assim que ficarem prontos. Monitoramento em tempo real do status de
                geração.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Card 6: Qualidade Profissional */}
          <Card className="glass-card rounded-2xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 glass-button rounded-full">
                  <Video className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
              <CardTitle className="text-foreground">Qualidade Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-foreground/70">
                Vídeos com qualidade cinematográfica, suporte a diferentes resoluções e formatos otimizados para redes
                sociais e apresentações.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center glass-card rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-4 font-serif bg-gradient-to-r from-primary to-accent bg-clip-text text-sky-600">
            Pronto para criar seu primeiro vídeo?
          </h2>
          <p className="text-foreground/70 mb-6 max-w-xl mx-auto">
            Comece agora mesmo e descubra como a IA pode transformar suas ideias em conteúdo visual impressionante.
          </p>
          <Link href="/generate">
            <Button size="lg" className="glass-button text-lg px-8 py-4 rounded-2xl border-0 text-slate-900">
              Começar Agora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
