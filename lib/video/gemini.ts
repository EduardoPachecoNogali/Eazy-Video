import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

export async function generateWithGemini(originalPrompt: string): Promise<string> {
  if (!API_KEY) throw new Error("GEMINI_API_KEY não definida");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const systemPrompt = `
Você é um otimizador de prompts para vídeos gerados por IA.
Melhore o prompt abaixo tornando-o cinematográfico, descritivo e claro.
Responda com APENAS o novo prompt, sem explicações.
`.trim();

  const result = await model.generateContent([{ text: systemPrompt }, { text: originalPrompt }]);
  const out = result.response.text().trim();
  if (!out) throw new Error("Gemini retornou vazio.");
  return out;
}
