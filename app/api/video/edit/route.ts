import { type NextRequest, NextResponse } from "next/server"
import { enhancePrompt } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { prompt, feedback } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 })
    }

    const editPrompt = `${prompt}${feedback ? ` (Considerando o feedback: ${feedback})` : ""}`
    const enhancedPrompt = await enhancePrompt(editPrompt)

    const taskId = `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      taskId,
      status: "PENDING_REVIEW",
      originalPrompt: prompt,
      enhancedPrompt,
      feedback,
    })
  } catch (error) {
    console.error("Erro na API de edição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
