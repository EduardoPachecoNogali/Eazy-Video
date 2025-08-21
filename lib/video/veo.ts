// lib/video/veo.ts
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = process.env.GCP_PROJECT_ID!;
const LOCATION   = process.env.GCP_LOCATION_ID || "us-central1";
const MODEL_ID   = process.env.VEO_MODEL_ID || "veo-3.0-generate-preview";

export async function generateVideo({
  prompt,
  duration,
  audio,
}: { prompt: string; duration: number; audio?: boolean }) {
  const auth = new GoogleAuth({
    projectId: PROJECT_ID,
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const token = await auth.getAccessToken();

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predictLongRunning`;

  const parameters: Record<string, any> = {
    durationSeconds: duration,
    // dica: você pode habilitar o aprimoramento interno do Veo também:
    // enhancePrompt: true,
    audioEnabled: !!audio,
  };

  // Se tiver bucket configurado, peça para gravar lá:
  if (process.env.VIDEO_STORAGE_GCS_URI) {
    parameters.storageUri = process.env.VIDEO_STORAGE_GCS_URI; // gs://bucket/prefix/
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.error?.message || "Erro ao gerar vídeo com Veo");
  return data as { name: string };
}
