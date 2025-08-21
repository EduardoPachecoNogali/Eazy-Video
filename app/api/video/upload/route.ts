import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 })
    }

    // Mock file processing - in a real app, you'd save to storage
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      message: "Upload realizado com sucesso",
      videoId,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
