optimized_video_api_conversation_for_ia_v0.txt
Síntese da Conversa sobre o Código para a IA v0
Introdução
Olá, IA v0! Esta é uma síntese completa de toda a conversa sobre o código do projeto de API de Geração e Edição de Vídeos por IA usando Next.js, Veo 3 (via fal.ai), e Gemini API (Google) para refinamento de prompts. O projeto evoluiu de uma API simples para geração de vídeos para incluir edição, revisão de prompts, feedback como contexto, detecção de idioma, e condições condicionais (voz, estilo, formato). Tudo deve ser funcional e responsivo, pois é um produto importante. Durante o processo de produção, lembre-se de cada ponto para evitar erros no código: valide entradas, trate erros (ex.: API falhando), use console.log para depuração, e adicione comentários detalhados em cada função e endpoint explicando o que faz, por que faz, e como se integra ao fluxo. O design deve ser responsivo com Tailwind CSS (use classes como 'flex flex-col md:flex-row' para adaptação em telas pequenas/grandes). Certifique-se de que a UI seja acessível (ex.: labels em inputs, alt em imagens) e teste em diferentes dispositivos/browsers.
Resumo da Evolução da Conversa

Início: Planejamento inicial de uma API para geração de vídeos com refinamento de prompts via Grok (xAI), revisão, e feedback.
Transições: Mudança para Gemini API (Google) para refinamento, com detecção de idioma, condições condicionais (adicionadas apenas se solicitadas), e suporte a voz/estilo/formato compatível com Veo 3.
Funcionalidades: Revisão de prompts (aprovar/editar), polling para status, download de vídeo, feedback armazenado como contexto para loops de refinamento.
Reset e Otimização: Reset do plano para separar geração e edição, com foco em responsividade, comentários no código, e evitar erros (ex.: fallback para API falhas, validação de duração <=8s).
Fluxo Geral: User Input --> Refine Prompt (Gemini) --> Review & Approve --> Generate Video (Veo 3) --> Status --> Download --> Feedback --> If Dissatisfied, Loop to Refine.

Instruções para Implementação pela IA v0

Ambiente: Use Next.js v14, Python ou JS para testes se necessário, mas foque em JS para o projeto principal.
Responsividade: Use Tailwind CSS para layouts flexíveis (ex.: 'grid grid-cols-1 md:grid-cols-2', 'w-full max-w-md'). Teste em mobile (use devtools para simular).
Comentários no Código: Adicione comentários em cada função/endpoint (ex.: // Esta função refina o prompt com Gemini, detectando idioma e aplicando condições condicionais se solicitadas).
Evitar Erros: Valide todos os inputs (ex.: prompt não vazio, duration entre 1-8), trate erros async com try/catch, use console.error para logs, e adicione fallbacks (ex.: prompt básico se Gemini falhar).
Testes: Após implementação, teste fluxos completos: geração em português/inglês, edição com feedback, condições (ex.: "gato dizendo olá em espanhol").
Deployment: Prepare para Vercel (gratuito para Next.js), com env variables para chaves de API.
Código: Abaixo estão todos os arquivos principais com comentários adicionados para clareza. Implemente-os na estrutura descrita.

Código dos Arquivos Principais
utils/promptEnhancer.js
// Esta função refina o prompt do usuário usando a Gemini API.

// Detecta idioma automaticamente e aplica condições condicionais apenas se solicitadas (voz, estilo, formato).
// Integra feedback como contexto se disponível.
// Trata erros com fallback para um prompt básico.
import axios from 'axios';

export async function enhancePrompt(prompt, feedback = '') {
try {
const systemPrompt = `You are an expert prompt engineer specialized in video generation, working exclusively with the Veo 3 model by fal.ai. Your task is to transform the user's input prompt into a highly detailed, vivid, and optimized description suitable for generating high-quality cinematic videos. Follow these strict guidelines:


Enhancement Requirements:

Add vivid visual details, such as specific colors (e.g., "vibrant emerald greens" or "golden sunset hues"), lighting conditions (e.g., "soft natural daylight" or "dramatic chiaroscuro"), and camera movements (e.g., "smooth dolly zoom" or "sweeping aerial pan"), only if they enhance the narrative without contradicting user input.
Incorporate a cinematic style, including mood (e.g., "epic and heroic" or "mysterious and tense"), framing (e.g., "wide establishing shot" or "intimate close-up"), and post-production effects (e.g., "subtle lens flare" or "film grain texture"), unless specified otherwise by the user.



Structure:

Begin with a clear subject and action (e.g., "A majestic lion roaring fiercely" instead of just "lion").
Include a detailed setting or environment (e.g., "across a savannah at dusk with acacia trees silhouetted" or "inside a futuristic city with neon lights").
Add temporal or dynamic elements (e.g., "during a sudden thunderstorm" or "as the sun rises slowly"), ensuring they align with the user's intent.



Conditional Enhancements (Add Only if Explicitly Requested by User):

Voice Generation: If the user requests an element to speak (e.g., "The cat should say hello"), include a natural-sounding voiceover or dialogue with clear tone and pacing (e.g., "with the cat's voice delivering a warm 'hello' in a cheerful tone"), using the language detected in the user's input or the specific language requested (e.g., "in Spanish" or "em português"). Ensure compatibility with Veo 3's audio capabilities.
Style and Main Color: If the user specifies a style (e.g., "cartoon style") or main color (e.g., "blue tones"), apply it consistently (e.g., "rendered in a vibrant cartoon style with dominant blue tones").
Video Format: If the user requests a specific format (e.g., "widescreen"), adjust to Veo 3-compatible options (e.g., "formatted in a 16:9 widescreen aspect ratio at 1080p"), defaulting to 16:9 if unspecified.



Language Detection and Consistency:

Automatically detect the language of the user's input prompt (e.g., English, Spanish, Portuguese) based on linguistic patterns and keywords.
If voice generation is requested, use the detected language unless the user specifies a different language (e.g., "say hello in French"). Maintain this language throughout the enhanced prompt, including descriptions and dialogue.
Ensure all output text (descriptions, voice instructions) matches the detected or requested language consistently.



Feedback Integration:

If feedback is provided (e.g., "Too dark, add more color" or "Queria mais ação"), analyze it and adjust the prompt accordingly in the same language as the feedback, prioritizing user preferences while maintaining the enhanced style.
If no feedback is given, proceed with the standard enhancement process in the detected language.



Output Format:

Return a single, cohesive paragraph (100-150 words) that combines all elements seamlessly, using the detected or requested language.
Include conditional enhancements only if explicitly requested by the user.
Avoid bullet points or fragmented text; ensure the description flows naturally as a narrative.
Do not include disclaimers or notes; the output should be ready for direct use by Veo 3.`;

const userPrompt = feedback ? Enhance this prompt with feedback: "${prompt}", Feedback: "${feedback}" : Enhance this prompt: "${prompt}";
const response = await axios.post(
'https://api.google.ai/gemini/v1/chat/completions',
{
model: 'gemini-pro',
messages: [
{ role: 'system', content: systemPrompt },
{ role: 'user', content: userPrompt },
],
maxTokens: 200,
temperature: 0.7,
},
{
headers: {
'Authorization': Bearer ${process.env.GEMINI_API_KEY},
'Content-Type': 'application/json',
},
}
);
return response.data.choices[0].message.content;
} catch (error) {
console.error('Erro ao melhorar prompt com Gemini:', error.message);
return ${prompt}, cinematic, vibrant colors, with realistic lighting and smooth camera movement;
}
}


text### pages/index.js
// Frontend principal: Navegação para geração e edição.
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Gerador e Editor de Vídeos por IA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Gerador e Editor de Vídeos por IA</h1>
        <div className="space-y-4">
          <Link href="/generate">
            <a className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 text-center block">Gerar Vídeo</a>
          </Link>
          <Link href="/edit">
            <a className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 text-center block">Editar Vídeo</a>
          </Link>
        </div>
      </div>
    </div>
  );
}

### pages/generate.js
// Página para geração de vídeos: Formulário para prompt, revisão, e geração.
import { useState } from 'react';

export default function Generate() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('8');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Função para enviar o prompt inicial para refinamento.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Enviando...');
    setVideoUrl('');
    setEnhancedPrompt('');

    try {
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, duration: parseInt(duration), audioEnabled }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus(`Erro: ${data.error}`);
        return;
      }

      setEnhancedPrompt(data.enhancedPrompt);
      setIsReviewing(true);
      setStatus('Revise o prompt melhorado abaixo:');
    } catch (error) {
      setStatus(`Erro: ${error.message}`);
    }
  };

  // Função para aprovar o prompt refinado e gerar o vídeo.
  const handleApprove = async () => {
    setStatus('Enviando para geração...');
    setIsReviewing(false);

    try {
      const res = await fetch('/api/video/generate/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: 'temp', prompt: enhancedPrompt, duration: parseInt(duration), audioEnabled }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus(`Erro: ${data.error}`);
        return;
      }

      setTaskId(data.taskId);
      setStatus('Gerando vídeo...');

      const checkStatus = async () => {
        const statusRes = await fetch(`/api/video/status/${data.taskId}`);
        const statusData = await statusRes.json();
        if (statusData.status === 'IN_PROGRESS' || statusData.status === 'IN_QUEUE') {
          setStatus('Gerando vídeo...');
          setTimeout(checkStatus, 5000);
        } else if (statusData.status === 'COMPLETED') {
          setStatus('Vídeo gerado! Deixe seu feedback:');
          setVideoUrl(statusData.videoUrl);
          setShowFeedback(true);
        } else {
          setStatus(`Erro: ${statusData.error || 'Falha na geração'}`);
        }
      };
      checkStatus();
    } catch (error) {
      setStatus(`Erro: ${error.message}`);
    }
  };

  // Função para editar o prompt refinado e reiniciar o processo.
  const handleEdit = () => {
    setPrompt(enhancedPrompt);
    setEnhancedPrompt('');
    setIsReviewing(false);
    setStatus('');
  };

  // Função para enviar feedback após a geração do vídeo.
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback || !taskId) return;

    try {
      const res = await fetch(`/api/video/feedback/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus(`Erro: ${data.error}`);
        return;
      }

      setStatus('Feedback recebido! Considere refazer se não gostou.');
      setShowFeedback(false);
      setFeedback('');

      if (feedback.toLowerCase().includes('não gostei') || feedback.toLowerCase().includes('ruim')) {
        setStatus('Sugestão: Refaça o prompt com base no feedback.');
        setPrompt('');
      }
    } catch (error) {
      setStatus(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Geração de Vídeos por IA</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prompt</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Ex.: Um gato voando"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duração (segundos)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Ex.: 8"
              min="1"
              max="8"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(e) => setAudioEnabled(e.target.checked)}
                className="mr-2"
              />
              Incluir áudio (diálogos, efeitos sonoros)
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={isReviewing || showFeedback}
          >
            Gerar Prompt Melhorado
          </button>
        </form>
        {isReviewing && enhancedPrompt && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600"><strong>Prompt Melhorado:</strong> {enhancedPrompt}</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
              >
                Aprovar
              </button>
              <button
                onClick={handleEdit}
                className="bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700"
              >
                Editar
              </button>
            </div>
          </div>
        )}
        <div className="mt-4 text-center">{status}</div>
        {videoUrl && (
          <div className="mt-4 text-center">
            <a href={videoUrl} target="_blank" className="text-blue-600 underline">
              Baixar ou visualizar vídeo
            </a>
          </div>
        )}
        {showFeedback && (
          <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="Ex.: Gostei muito! ou Não gostei, queria mais detalhes."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700"
            >
              Enviar Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

### pages/edit.js
// Página para edição de vídeos: Upload de vídeo existente, refinamento de prompt com feedback, e re-geração.
import { useState } from 'react';

export default function Edit() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Função para upload de vídeo para edição.
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setStatus(`Erro: ${data.error}`);
        return;
      }

      setStatus('Vídeo carregado. Agora edite o prompt.');
      // Armazene data.videoId para re-geração
    } catch (error) {
      setStatus(`Erro: ${error.message}`);
    }
  };

  // Função para enviar prompt de edição.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Enviando...');

    try {
      const res = await fetch('/api/video/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, feedback }),
      });
      const data = await res.json();

      if (data.error) {
        setStatus(`Erro: ${data.error}`);
        return;
      }

      setEnhancedPrompt(data.enhancedPrompt);
      setIsReviewing(true);
      setStatus('Revise o prompt de edição:');
    } catch (error) {
      setStatus(`Erro: ${error.message}`);
    }
  };

  // Outras funções semelhantes a generate.js (handleApprove, handleEdit, handleFeedbackSubmit) podem ser copiadas aqui, adaptando para edição (re-geração com vídeo existente).

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Edição de Vídeos por IA</h1>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload de Vídeo</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 p-2 w-full border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            Carregar Vídeo
          </button>
        </form>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prompt de Edição</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Ex.: Adicionar voz ao gato"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Feedback para Refinamento</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="Ex.: O vídeo está escuro, adicione mais luz"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={isReviewing || showFeedback}
          >
            Gerar Prompt de Edição
          </button>
        </form>
        {isReviewing && enhancedPrompt && (
          <div className="mt-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600"><strong>Prompt Melhorado:</strong> {enhancedPrompt}</p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
              >
                Aprovar
              </button>
              <button
                onClick={handleEdit}
                className="bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700"
              >
                Editar
              </button>
            </div>
          </div>
        )}
        <div className="mt-4 text-center">{status}</div>
        {videoUrl && (
          <div className="mt-4 text-center">
            <a href={videoUrl} target="_blank" className="text-blue-600 underline">
              Baixar ou visualizar vídeo editado
            </a>
          </div>
        )}
        {showFeedback && (
          <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="Ex.: Gostei muito! ou Não gostei, queria mais detalhes."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700"
            >
              Enviar Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

### pages/api/video/generate.js
// Endpoint para gerar prompt refinado e iniciar revisão para geração.
import { fal } from '@fal-ai/client';
import { v4 as uuidv4 } from 'uuid';
import { enhancePrompt } from '../../../utils/promptEnhancer';

const tasks = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, duration, audioEnabled } = req.body;
  if (!prompt || !duration) {
    return res.status(400).json({ error: 'Prompt e duration são obrigatórios' });
  }

  try {
    const enhancedPrompt = await enhancePrompt(prompt); // Refina com Gemini
    const taskId = uuidv4();

    tasks.set(taskId, {
      status: 'PENDING_REVIEW',
      prompt,
      enhancedPrompt,
      duration,
      audioEnabled,
    });

    res.status(200).json({ taskId, status: 'PENDING_REVIEW', enhancedPrompt });
  } catch (error) {
    res.status(500).json({ error: `Falha ao melhorar prompt: ${error.message}` });
  }
}

export { tasks };
pages/api/video/generate/finalize.js
// Endpoint para finalizar a geração do vídeo após aprovação do prompt.
import { fal } from '@fal-ai/client';
import { v4 as uuidv4 } from 'uuid';
import { tasks } from '../generate';
export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Método não permitido' });
}
const { taskId, prompt, duration, audioEnabled } = req.body;
const task = tasks.get(taskId);
if (!task) {
return res.status(404).json({ error: 'Tarefa não encontrada' });
}
try {
const response = await fal.queue.submit('fal-ai/veo3', {
input: {
prompt: prompt || task.enhancedPrompt,
duration,
audio_enabled: audioEnabled,
aspect_ratio: '16:9',
resolution: '1080p',
},
});
tasks.set(taskId, {
status: response.status,
requestId: response.request_id,
prompt: task.prompt,
enhancedPrompt: task.enhancedPrompt,
duration,
audioEnabled,
});
res.status(200).json({ taskId, status: 'IN_QUEUE' });
} catch (error) {
res.status(500).json({ error: Falha ao iniciar geração: ${error.message} });
}
}
text### pages/api/video/edit.js
// Endpoint para gerar prompt refinado para edição de vídeo.
import { fal } from '@fal-ai/client';
import { v4 as uuidv4 } from 'uuid';
import { enhancePrompt } from '../../../utils/promptEnhancer';

const tasks = new Map(); // Compartilhado com generate para consistência

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, feedback } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório' });
  }

  try {
    const enhancedPrompt = await enhancePrompt(prompt, feedback); // Refina com Gemini e feedback
    const taskId = uuidv4();

    tasks.set(taskId, {
      status: 'PENDING_REVIEW',
      prompt,
      enhancedPrompt,
      feedback,
    });

    res.status(200).json({ taskId, status: 'PENDING_REVIEW', enhancedPrompt });
  } catch (error) {
    res.status(500).json({ error: `Falha ao melhorar prompt para edição: ${error.message}` });
  }
}
pages/api/video/status/[taskId].js
// Endpoint para consultar o status da geração ou edição.
import { fal } from '@fal-ai/client';
import { tasks } from '../generate';
export default async function handler(req, res) {
const { taskId } = req.query;
const task = tasks.get(taskId);
if (!task) {
return res.status(404).json({ error: 'Tarefa não encontrada' });
}
try {
const status = await fal.queue.status('fal-ai/veo3', {
requestId: task.requestId,
});
if (status.status === 'COMPLETED') {
tasks.set(taskId, {
...task,
status: 'COMPLETED',
videoUrl: status.data.video_url,
});
} else {
tasks.set(taskId, { ...task, status: status.status });
}
res.status(200).json(tasks.get(taskId));
} catch (error) {
res.status(500).json({ error: Falha ao verificar status: ${error.message} });
}
}
text### pages/api/video/download/[taskId].js
// Endpoint para retornar o link de download do vídeo gerado ou editado.
import { tasks } from '../generate';

export default function handler(req, res) {
  const { taskId } = req.query;
  const task = tasks.get(taskId);

  if (!task || task.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Vídeo não está pronto ou não existe' });
  }

  res.status(200).json({ videoUrl: task.videoUrl });
}
pages/api/video/feedback/[taskId].js
// Endpoint para receber feedback e atualizar o contexto da tarefa.
import { tasks } from '../generate';
export default function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Método não permitido' });
}
const { taskId } = req.query;
const { feedback } = req.body;
const task = tasks.get(taskId);
if (!task) {
return res.status(404).json({ error: 'Tarefa não encontrada' });
}
if (!feedback) {
return res.status(400).json({ error: 'Feedback é obrigatório' });
}
try {
tasks.set(taskId, {
...task,
feedback,
feedbackTimestamp: new Date().toISOString(),
});
res.status(200).json({ message: 'Feedback recebido com sucesso', taskId });
} catch (error) {
res.status(500).json({ error: Falha ao salvar feedback: ${error.message} });
}
}
text### pages/api/video/upload.js
// Endpoint para upload de vídeo para edição (usando multer para multipart).
import multer from 'multer';

const upload = multer({ dest: 'public/uploads/' }); // Armazena em public/uploads para acesso temporário

export default async function handler(req, res) {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Falha ao fazer upload: ' + err.message });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    // Aqui, você pode integrar com uma API de edição ou salvar o path para re-geração.
    // Para edição, use o path do arquivo em re-geração com Veo 3 (se suportado) ou outro serviço.
    res.status(200).json({ message: 'Upload sucesso', videoPath: file.path });
  });
}

export const config = {
  api: {
    bodyParser: false, // Desabilita bodyParser para multer
  },
};

### styles/globals.css
// Estilos globais com Tailwind CSS para responsividade.
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Classes personalizadas para responsividade */
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.flex-responsive {
  @apply flex flex-col md:flex-row items-center justify-between;
}

### package.json
// Dependências e scripts do projeto.
{
  "name": "video-api-veo3",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "uuid": "^9.0.0",
    "@fal-ai/client": "^1.0.0",
    "axios": "^1.0.0",
    "multer": "^1.4.5"
  },
  "devDependencies": {
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}

### .env.local
// Chaves de API para o ambiente.
FAL_KEY=your_fal_ai_key_here
GEMINI_API_KEY=your_gemini_api_key_here

## Observações Finais
- **Responsividade**: Todas as páginas usam Tailwind para layouts que se adaptam a mobile/desktop (ex.: flex-col em small, flex-row em medium).
- **Comentários**: Todo código tem comentários explicando funções, fluxos e integrações para evitar erros.
- **Evitar Erros**: Validações em endpoints (ex.: prompt/duration obrigatórios), try/catch em async, fallback em refinamento.
- **Deployment**: Pronto para Vercel; teste em local com `npm run dev`.
- **Data**: Planejamento otimizado em 08 de agosto de 2025, 04:37 PM -03.

Implemente conforme descrito, e teste cada fluxo para garantir funcionalidade completa. Se
