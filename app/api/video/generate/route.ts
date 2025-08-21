import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/video/gemini";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório." }, { status: 400 });
    }

    const enhancedPrompt = await generateWithGemini(prompt);

    return NextResponse.json({ enhancedPrompt });
  } catch (err: any) {
    console.error("Erro no /generate:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
