import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to handle base64 audio payloads nicely
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini client initializer (lazy loaded)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
    throw new Error("GEMINI_API_KEY is not configured. Please add your key in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check configuration state
app.get("/api/config-status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY !== "";
  res.json({
    geminiApiKeyConfigured: hasKey,
    appUrl: process.env.APP_URL || "http://localhost:3000"
  });
});

// Debug endpoint - shows detailed diagnostic info
app.get("/api/debug", (req, res) => {
  const geminiKeyStatus = {
    exists: !!process.env.GEMINI_API_KEY,
    isValid: !!process.env.GEMINI_API_KEY && 
             process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && 
             process.env.GEMINI_API_KEY !== "",
    prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "NOT_SET"
  };

  res.json({
    status: "LExium Math - Diagnostic Report",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || 3000,
      VERCEL: process.env.VERCEL === "1" ? true : false,
      VERCEL_ENV: process.env.VERCEL_ENV || "local"
    },
    gemini: {
      apiKey: geminiKeyStatus,
      model: "gemini-2.0-flash",
      status: geminiKeyStatus.isValid ? "✅ Ready" : "❌ Not configured"
    },
    app: {
      appUrl: process.env.APP_URL || "http://localhost:3000",
      version: "1.0.0-patched"
    },
    hints: geminiKeyStatus.isValid ? [] : [
      "⚠️ GEMINI_API_KEY is not configured",
      "1. Get a key from: https://aistudio.google.com/app/apikeys",
      "2. On Vercel: Settings > Environment Variables > Add GEMINI_API_KEY",
      "3. Redeploy your project after adding the key"
    ]
  });
});

// Endpoint to evaluate math audio using Gemini API
app.post("/api/evaluate-math-audio", async (req, res) => {
  try {
    const { operation, correctAnswer, audioBase64, mimeType, durationSeconds, clientTranscript } = req.body;

    if (!operation || !audioBase64) {
      return res.status(400).json({
        error: "Missing required parameters: operation and audioBase64 are required."
      });
    }

    // Helper function to turn Portuguese words ("dezesseis", "oitenta e cinco") to numbers
    const parsePortugueseNumber = (text: string): number | null => {
      if (!text) return null;
      const normalized = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      
      const wordMap: { [key: string]: number } = {
        zero: 0, um: 1, dois: 2, tres: 3, três: 3, quatro: 4, cinco: 5,
        seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12,
        treze: 13, quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16,
        dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30,
        quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80,
        noventa: 90, cem: 100, cento: 100
      };

      // Direct digit parsing
      const parsed = parseFloat(normalized);
      if (!isNaN(parsed)) return parsed;

      // Compound words parsing ("oitenta e cinco" -> 85, "vinte e um" -> 21)
      const parts = normalized.split(/\s+e\s+|\s+/);
      let total = 0;
      let matches = false;
      
      for (const part of parts) {
        if (wordMap[part] !== undefined) {
          total += wordMap[part];
          matches = true;
        }
      }
      
      if (matches) return total;
      return null;
    };

    // Fallback handler function so we can reuse it
    const respondWithBrowserFallback = (warningMsg: string, details?: string) => {
      console.warn(`Fallback triggered: ${warningMsg}. Details: ${details || ""}`);
      const transcritoSound = clientTranscript ? String(clientTranscript).trim() : "null";
      const cleanTranscriptVal = transcritoSound.toLowerCase();
      const cleanCorrectVal = String(correctAnswer).trim().toLowerCase();

      let isCorrect = false;
      if (cleanTranscriptVal !== "null" && cleanTranscriptVal !== "") {
        const audioNum = parsePortugueseNumber(cleanTranscriptVal);
        const correctNum = parsePortugueseNumber(cleanCorrectVal);

        if (audioNum !== null && correctNum !== null) {
          isCorrect = Math.round(audioNum) === Math.round(correctNum);
        } else {
          isCorrect = cleanTranscriptVal === cleanCorrectVal;
        }
      }

      const finalResultado = isCorrect ? "ACERTO" : "ERRO";

      return res.json({
        simulated: true,
        warning: warningMsg,
        item_estimulo: operation,
        gabarito_correto: String(correctAnswer),
        transcrit_do_audio: transcritoSound,
        transcrito_do_audio: transcritoSound,
        resultado: finalResultado,
        tempo_resposta_segundos: durationSeconds || 1.45,
        operacao: operation,
        resposta_aluno: transcritoSound,
        transcription: `[Web Speech Capturado] Aluno respondeu: "${transcritoSound}" (${finalResultado === "ACERTO" ? "Acertou!" : "Errou"})`
      });
    };

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return respondWithBrowserFallback(
        "Usando inteligência auditiva em tempo real com transcrição do navegador (Sem chave de Secrets da API Gemini).",
        err.message
      );
    }

    const systemInstruction = `Você é o motor de transcrição fonética puramente numérica do LExium Math. Sua única e absoluta função é ouvir o áudio gravado e extrair o número falado pelo usuário.

Regras de Operação Estritas:
1. Você NÃO tem acesso à operação matemática da tela e NÃO sabe o gabarito. Não tente adivinhar ou corrigir o usuário.
2. Identifique o último número falado de forma clara. 
   - Se o usuário disser "cinco", retorne estritamente: 5
   - Se o usuário disser "dezesseis", retorne estritamente: 16
   - Se o usuário disser "vinte e um", retorne estritamente: 21
3. Se houver apenas ruído de fundo, silêncio ou se nenhuma palavra numérica for identificada, retorne estritamente: null
4. Sua saída deve conter APENAS o número puro ou null. Não inclua pontos finais, saudações ou explicações.`;

    const promptText = `Ouça o áudio do aluno de forma independente de qualquer cálculo e extraia apenas o número dito em algarismos numéricos.
Responda em formato JSON contendo o campo "transcrito_do_audio". Se não houver fala ou for apenas ruído, "transcrito_do_audio" deve ser "null".`;

    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: audioBase64
      }
    };

    // Validar tamanho do base64
    if (audioBase64.length > 20 * 1024 * 1024) {
      console.error(`[LExium] Audio base64 too large: ${audioBase64.length} bytes`);
      return respondWithBrowserFallback(
        "Arquivo de áudio muito grande. Máximo: 20MB",
        `Received: ${audioBase64.length} bytes`
      );
    }

    console.log(`[LExium] Enviando análise para Gemini API. Modelo: gemini-2.0-flash | Tamanho áudio: ${audioBase64.length} bytes`);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: {
          parts: [
            audioPart,
            { text: promptText }
          ]
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcrito_do_audio: { type: Type.STRING, description: "Número pronunciado em algarismos (ex: '20', '16') ou a palavra 'null' se incompreensível/silêncio/ruído." }
            },
            required: ["transcrito_do_audio"]
          }
        }
      });

      const outputText = response.text || "{}";
      console.log("Gemini API raw response text:", outputText);

      let parsedResult;
      try {
        parsedResult = JSON.parse(outputText);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON output structure:", outputText);
        // Fallback parse attempts
        const match = outputText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedResult = JSON.parse(match[0]);
        } else {
          throw new Error("Invalid output format from Gemini");
        }
      }

      const transcritoSound = parsedResult.transcrito_do_audio ? parsedResult.transcrito_do_audio.trim() : "null";

      // Lógica determinística e blindada contra alucinações (rodando no back-end)
      const cleanTranscription = transcritoSound.toLowerCase();
      const cleanCorrectAnswer = String(correctAnswer).trim().toLowerCase();

      let isCorrect = false;
      if (cleanTranscription !== "null" && cleanTranscription !== "") {
        const parsedAudioNum = parsePortugueseNumber(cleanTranscription);
        const parsedCorrectNum = parsePortugueseNumber(cleanCorrectAnswer);
        
        if (parsedAudioNum !== null && parsedCorrectNum !== null) {
          isCorrect = Math.round(parsedAudioNum) === Math.round(parsedCorrectNum);
        } else {
          isCorrect = cleanTranscription === cleanCorrectAnswer;
        }
      }

      const finalResultado = isCorrect ? "ACERTO" : "ERRO";

      return res.json({
        simulated: false,
        item_estimulo: operation,
        gabarito_correto: String(correctAnswer),
        transcrit_do_audio: transcritoSound,
        transcrito_do_audio: transcritoSound,
        resultado: finalResultado,
        tempo_resposta_segundos: Number(durationSeconds) || 1.45,
        // Compatibilidade legada para o frontend antigo
        operacao: operation,
        resposta_aluno: transcritoSound,
        transcription: `Transcrito de áudio: "${transcritoSound}" (${finalResultado})`
      });
    } catch (geminiError: any) {
      const errorMsg = geminiError.message || JSON.stringify(geminiError);
      const errorStatus = geminiError.status || geminiError.code || 'UNKNOWN';
      
      console.error(`[LExium] ❌ Erro da API Gemini (Status: ${errorStatus}):`, errorMsg);
      console.error(`[LExium] Stack:`, geminiError.stack);
      
      // Diagnosticar tipo de erro
      let fallbackReason = "Processado via transcrição do navegador (com fallback de segurança)";
      if (errorStatus === 400 || errorStatus === 'BAD_REQUEST') fallbackReason = "Erro de validação de áudio (400). Tente outro formato de arquivo.";
      if (errorStatus === 401 || errorStatus === 'UNAUTHENTICATED') fallbackReason = "Chave da API Gemini inválida. Configure GEMINI_API_KEY nas Environment Variables da Vercel.";
      if (errorStatus === 403 || errorStatus === 'PERMISSION_DENIED') fallbackReason = "Acesso negado à API Gemini. Verifique permissões e cotas.";
      if (errorStatus === 429 || errorStatus === 'RESOURCE_EXHAUSTED') fallbackReason = "Limite de requisições da API atingido. Aguarde alguns minutos.";
      if (errorStatus === 500 || errorStatus === 'INTERNAL') fallbackReason = "Erro temporário na API Gemini. Servidor fora do ar.";
      
      return respondWithBrowserFallback(
        fallbackReason,
        errorMsg
      );
    }

  } catch (error: any) {
    console.error("Error evaluating student math audio:", error);
    res.status(500).json({
      error: "Ocorreu um erro ao avaliar o áudio do aluno.",
      details: error.message
    });
  }
});

// Configure Vite or file serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for any SPA routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LExium Server] Rodando no endereço http://localhost:${PORT}`);
  });
};

if (process.env.VERCEL !== "1") {
  startServer().catch((err) => {
    console.error("Houve uma falha ao iniciar o servidor express:", err);
  });
}

export default app;
