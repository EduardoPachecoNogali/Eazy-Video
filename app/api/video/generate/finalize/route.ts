export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/video/veo";

export async function POST(req: NextRequest) {
  try {
    const { prompt, duration, audio } = await req.json();
    if (!prompt || !duration) {
      return NextResponse.json({ error: "Prompt e duração são obrigatórios." }, { status: 400 });
    }

    const result = await generateVideo({ prompt, duration, audio }); // { name: "projects/.../publishers/.../operations/{uuid}" }
    if (!result?.name) {
      return NextResponse.json({ error: "Operation name não retornado pelo Vertex." }, { status: 500 });
    }

    // ✅ devolve exatamente o resource name da operação
    return NextResponse.json({ taskId: result.name });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro interno" }, { status: 500 });
  }
}
