import { type NextRequest, NextResponse } from "next/server"

const mockVideoEditing = async (prompt: string, taskId: string) => {
  // Simulate processing time for video editing
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    taskId,
    status: "processing",
    estimatedTime: 45, // 45 seconds for editing
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, prompt } = await request.json()

    if (!taskId || !prompt) {
      return NextResponse.json({ error: "TaskId e prompt são obrigatórios" }, { status: 400 })
    }

    const result = await mockVideoEditing(prompt, taskId)

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      estimatedTime: result.estimatedTime,
      message: "Edição de vídeo iniciada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao finalizar edição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
