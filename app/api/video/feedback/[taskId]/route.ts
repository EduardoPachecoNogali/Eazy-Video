import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: { params: { taskId: string } }) {
  const { taskId } = context.params;

  if (!taskId) {
    return NextResponse.json({ error: "ID da tarefa ausente" }, { status: 400 });
  }

  try {
    const { feedback, rating, originalPrompt, enhancedPrompt } = await req.json();

    if (!feedback || !rating) {
      return NextResponse.json({ error: "Feedback e rating são obrigatórios" }, { status: 400 });
    }

    // Aqui você pode salvar em um banco, planilha ou enviar para seu backend de analytics
    console.log("Feedback recebido:", {
      taskId,
      feedback,
      rating,
      originalPrompt,
      enhancedPrompt,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao salvar feedback:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
