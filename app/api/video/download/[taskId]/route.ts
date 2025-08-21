import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params

    if (!taskId) {
      return NextResponse.json({ error: "ID da tarefa é obrigatório" }, { status: 400 })
    }

    // Get task from memory (in production, use a database)
    const tasks = global.veoTasks || new Map()
    const task = tasks.get(taskId)

    if (!task || task.status !== "completed") {
      return NextResponse.json({ error: "Vídeo não encontrado ou ainda processando" }, { status: 404 })
    }

    // In a real implementation, you would return the actual video file
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: "Vídeo pronto para download",
      videoUrl: `/placeholder.mp4?taskId=${taskId}`,
      downloadUrl: `/placeholder.mp4?taskId=${taskId}&download=true`,
    })
  } catch (error) {
    console.error("Erro ao fazer download:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
