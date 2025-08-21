// app/api/video/status/[...taskId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

export const runtime = "nodejs";

const PROJECT_ID = process.env.GCP_PROJECT_ID!;
const DEFAULT_LOCATION = process.env.GCP_LOCATION_ID || "us-central1";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string[] }> }
) {
  const { taskId } = await params;
  if (!taskId?.length) {
    return NextResponse.json({ status: "error", error: "ID da tarefa ausente" }, { status: 400 });
  }

  const segments = taskId;
  const opName = segments.join("/"); // operation name completo (com publishers/models/operations/UUID)

  // Descobre a location para o host
  const locIndex = segments.findIndex((s) => s === "locations");
  const location = locIndex > -1 && segments[locIndex + 1] ? segments[locIndex + 1] : DEFAULT_LOCATION;

  // É operação de publisher? => usar fetchPredictOperation
  const isPublisherOp = segments.includes("publishers") && segments.includes("models");

  try {
    const auth = new GoogleAuth({
      projectId: PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL!,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const token = await auth.getAccessToken();

    let url: string;
    let init: RequestInit;

    if (isPublisherOp) {
      // modelPath = tudo antes de "/operations/{uuid}"
      const opIdx = segments.findIndex((s) => s === "operations");
      const modelPath = segments.slice(0, opIdx).join("/");
      url = `https://${location}-aiplatform.googleapis.com/v1/${modelPath}:fetchPredictOperation`;
      init = {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName }),
      };
    } else {
      // fallback para operações normais (não é o caso do Veo publisher)
      url = `https://${location}-aiplatform.googleapis.com/v1/${opName}`;
      init = { method: "GET", headers: { Authorization: `Bearer ${token}` } };
    }

    const resp = await fetch(url, init);
    const text = await resp.text();
    const op = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};

    if (!resp.ok) {
      console.error("Vertex operation poll error:", { url, status: resp.status, statusText: resp.statusText, op });
      return NextResponse.json(
        { status: "error", error: op?.error?.message || op?.raw || "Erro ao consultar status" },
        { status: resp.status }
      );
    }

    if (!op.done) {
      return NextResponse.json({ status: "processing", progress: 20 });
    }

    // done == true => extrai o vídeo
    const r = op.response ?? {};
    // Veo 3 retorna: response.videos[].gcsUri ou .bytesBase64Encoded (ver doc)
    // https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation#poll
    const video = (r.videos?.[0]) || (r.predictions?.[0]) || {};
    const base64 = video.bytesBase64Encoded as string | undefined;
    const gcsUri = video.gcsUri as string | undefined;
    const mime = (video.mimeType as string) || "video/mp4";

    if (base64) {
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({ status: "completed", videoUrl: dataUrl, from: "base64", progress: 100 });
    }

    if (gcsUri) {
      // Monta uma URL pública "direta" (funciona se o objeto estiver público)
      // gs://bucket/path/file.mp4 -> https://storage.googleapis.com/bucket/path/file.mp4
      const [, bucketAndPath] = gcsUri.split("gs://");
      const publicUrl = bucketAndPath ? `https://storage.googleapis.com/${bucketAndPath}` : undefined;

      return NextResponse.json({
        status: "completed",
        videoUrl: publicUrl || gcsUri, // o front usará isso; se privado, precisaremos assinar depois
        gcsUri,
        progress: 100,
      });
    }

    // nada encontrado (caso raro): devolve erro descritivo
    return NextResponse.json(
      { status: "error", error: "Operação concluída sem bytesBase64Encoded nem gcsUri em response.videos[0]." },
      { status: 500 }
    );
  } catch (e: any) {
    console.error("Status handler exception:", e);
    return NextResponse.json({ status: "error", error: e?.message || "Erro interno" }, { status: 500 });
  }
}
