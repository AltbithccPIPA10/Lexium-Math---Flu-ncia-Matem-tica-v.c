/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Sparkles, CheckCircle, AlertCircle, RefreshCw, Volume2, Code, FileCode, Check, Copy } from "lucide-react";
import { EvaluationResult } from "../types";
import { numberToPortuguese } from "../utils/mathGenerator";

// Define pre-baked realistic student response profiles to allow easy testing without voice
interface MockProfile {
  id: string;
  name: string;
  age: string;
  description: string;
  transcript: string;
  studentAnswer: string;
  isCorrect: boolean;
  tempo: number;
  fluentText: string;
}

const STUDENT_PROFILES: MockProfile[] = [
  {
    id: "fluent_correct",
    name: "Enzo (Fluente)",
    age: "7 anos",
    description: "Excelente fluência. Responde instantaneamente.",
    transcript: "Nove!",
    studentAnswer: "9",
    isCorrect: true,
    tempo: 0.95,
    fluentText: "Alta Fluência: Sem hesitações, dicção firme e direta."
  },
  {
    id: "hesitant_correct",
    name: "Luna (Hesitação)",
    age: "8 anos",
    description: "Pensa antes de responder, mas chega ao resultado de forma correta.",
    transcript: "hmm... é... eu acho que é... nove!",
    studentAnswer: "9",
    isCorrect: true,
    tempo: 3.42,
    fluentText: "Fluência Moderada: Presença de ruídos de processamento cognitivo (hmm, é)."
  },
  {
    id: "classroom_noise",
    name: "Heitor (Com Ruído)",
    age: "7 anos",
    description: "Excelente resposta em sala de aula barulhenta.",
    transcript: "[barulho de fundo de carteira] Nove!",
    studentAnswer: "9",
    isCorrect: true,
    tempo: 1.62,
    fluentText: "Alta Fluência: Motor filtrou ruídos ambientais com sucesso."
  },
  {
    id: "hesitant_error",
    name: "Sofia (Incorreta)",
    age: "8 anos",
    description: "Fica em dúvida e acaba respondendo um número incorreto.",
    transcript: "éee... sete... não... oito!",
    studentAnswer: "8",
    isCorrect: false,
    tempo: 2.85,
    fluentText: "Em Desenvolvimento: Hesitação moderada terminando em erro operacional."
  }
];

export function VoiceTestingBench({ onNewLog }: { onNewLog: (log: any) => void }) {
  // Input Operations
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(4);
  const [operationSymbol, setOperationSymbol] = useState("+");
  const [correctAnswer, setCorrectAnswer] = useState(9);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  
  // Audio Visualizer waveform elements
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(18).fill(8));
  
  // API Integration states
  const [loading, setLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>({
    operacao: "5 + 4",
    resposta_aluno: "9",
    resultado: "correto",
    tempo_resposta_segundos: 1.45,
    transcription: "Visualização Inicial"
  });
  const [configStatus, setConfigStatus] = useState({ geminiApiKeyConfigured: false });
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Sync correct answer when inputs change
  useEffect(() => {
    let ans = 0;
    if (operationSymbol === "+") ans = num1 + num2;
    else if (operationSymbol === "-") ans = Math.max(0, num1 - num2);
    else if (operationSymbol === "x") ans = num1 * num2;
    else if (operationSymbol === "÷") ans = num2 !== 0 ? Math.floor(num1 / num2) : 0;
    setCorrectAnswer(ans);
  }, [num1, num2, operationSymbol]);

  // Query config status on mount
  useEffect(() => {
    fetch("/api/config-status")
      .then((res) => res.json())
      .then((data) => setConfigStatus(data))
      .catch((_) => console.log("Erro de config status"));
  }, []);

  // Timer run loop when recording
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 0.1);
      }, 100);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  // Handle Voice Recording Logic
  const startRecording = async () => {
    try {
      setApiError(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingSeconds(0);
      setLiveTranscript("");
      setIsRecording(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Start browser speech recognition voice-to-text in pt-BR
      if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "pt-BR";
        
        let finalTranscript = "";
        rec.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const currentText = (finalTranscript + interimTranscript).trim();
          setLiveTranscript(currentText);
        };
        
        rec.onerror = (e: any) => {
          console.warn("Bench Speech Recognition error:", e);
        };
        
        rec.onend = () => {
          console.log("Bench Speech recognition finished.");
        };

        recognitionRef.current = rec;
        rec.start();
      }
      
      // Setup browser visualizer waveform animation
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateWave = () => {
          if (!isRecording) return;
          analyser.getByteFrequencyData(dataArray);
          // Scale waves for UI heights
          const barHeights = Array.from(dataArray)
            .slice(0, 18)
            .map((v) => Math.max(8, Math.floor(v / 4)));
          setWaveHeights(barHeights);
          animationFrameRef.current = requestAnimationFrame(updateWave);
        };
        animationFrameRef.current = requestAnimationFrame(updateWave);
      } catch (wavErr) {
        console.warn("Visualização do audio não pôde ser iniciada:", wavErr);
      }

      const options = { mimeType: "audio/webm" };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream); // Fallback
      }

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(finalBlob);
        setAudioUrl(URL.createObjectURL(finalBlob));
        
        // Clean up visualizer animations
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Automatic evaluation on stop
        evaluateAudioResult(finalBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (err: any) {
      console.error("Erro ao acessar microfone:", err);
      setIsRecording(false);
      setApiError("Erro de Permissão: Por favor, permita o acesso ao microfone no seu navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Erro ao parar transcritor:", err);
      }
    }
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Falha ao ler blob para base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Run the full evaluation on the backend API
  const evaluateAudioResult = async (customBlob: Blob | null, simulatedData?: MockProfile) => {
    setLoading(true);
    setApiError(null);

    const operationStr = `${num1} ${operationSymbol} ${num2}`;

    if (simulatedData) {
      // Simulate/Trigger with specific profile data
      try {
        const mockRawResponse = {
          simulated: true,
          item_estimulo: operationStr,
          gabarito_correto: String(correctAnswer),
          transcrit_do_audio: simulatedData.studentAnswer,
          transcrito_do_audio: simulatedData.studentAnswer,
          resultado: simulatedData.isCorrect ? "ACERTO" : "ERRO" as any,
          tempo_resposta_segundos: simulatedData.tempo,
          operacao: operationStr,
          resposta_aluno: simulatedData.studentAnswer,
          transcription: `[Simulação: Perfil ${simulatedData.name}] Aluno hesitou mas falou: "${simulatedData.transcript}"`
        };

        // Post simulated evaluation to history
        onNewLog({
          id: `eval_${Date.now()}`,
          date: new Date().toLocaleTimeString("pt-BR"),
          studentName: simulatedData.name,
          operation: operationStr,
          transcript: simulatedData.transcript,
          correctAnswer,
          result: mockRawResponse
        });

        setEvaluationResult({
          item_estimulo: mockRawResponse.item_estimulo,
          gabarito_correto: mockRawResponse.gabarito_correto,
          transcrit_do_audio: mockRawResponse.transcrit_do_audio,
          transcrito_do_audio: mockRawResponse.transcrito_do_audio,
          resultado: mockRawResponse.resultado as any,
          tempo_resposta_segundos: mockRawResponse.tempo_resposta_segundos,
          simulated: true,
          transcription: mockRawResponse.transcription,
          operacao: mockRawResponse.operacao,
          resposta_aluno: mockRawResponse.resposta_aluno
        });
      } catch (err: any) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!customBlob) {
      setApiError("Grave áudio primeiro clicando no microfone ou selecione um perfil simulado.");
      setLoading(false);
      return;
    }

    try {
      const base64 = await blobToBase64(customBlob);
      const payload = {
        operation: operationStr,
        correctAnswer: String(correctAnswer),
        audioBase64: base64,
        mimeType: customBlob.type,
        durationSeconds: Math.round(recordingSeconds * 100) / 100,
        clientTranscript: liveTranscript
      };

      console.log(`[LExium Frontend] Enviando áudio para análise (${(base64.length / 1024).toFixed(1)}KB, ${customBlob.type})`);

      const res = await fetch("/api/evaluate-math-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[LExium] Erro HTTP ${res.status}:`, errorText);
        
        let detailedError = `Erro ${res.status}: ${res.statusText}`;
        if (res.status === 500) {
          detailedError = "❌ Erro no servidor. Verifique se GEMINI_API_KEY está configurada na Vercel.";
        } else if (res.status === 400) {
          detailedError = "❌ Formato de áudio inválido. Tente outro arquivo ou dispositivo de gravação.";
        } else if (res.status === 401) {
          detailedError = "❌ Credenciais inválidas. Verifique GEMINI_API_KEY nas variáveis de ambiente.";
        } else if (res.status === 429) {
          detailedError = "⏱️ Limite de requisições atingido. Aguarde alguns minutos.";
        }
        
        throw new Error(detailedError);
      }

      const data = await res.json();
      
      console.log(`[LExium] Resposta recebida:`, data);
      
      // Update historical logs in dashboard
      onNewLog({
        id: `eval_${Date.now()}`,
        date: new Date().toLocaleTimeString("pt-BR"),
        studentName: "Test Bench (Áudio Real)",
        operation: operationStr,
        transcript: data.transcription || `Resposta capturada: ${data.resposta_aluno}`,
        correctAnswer,
        result: data
      });

      setEvaluationResult(data);
    } catch (err: any) {
      console.error("[LExium] Erro na avaliação:", err);
      setApiError(err.message || "Houve um problema ao processar o áudio. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyJsonToClipboard = () => {
    if (!evaluationResult) return;
    const formattedJson = JSON.stringify({
      item_estimulo: evaluationResult.item_estimulo || evaluationResult.operacao,
      gabarito_correto: evaluationResult.gabarito_correto || String(correctAnswer),
      transcrit_do_audio: evaluationResult.transcrit_do_audio || evaluationResult.resposta_aluno,
      resultado: evaluationResult.resultado === "ACERTO" || evaluationResult.resultado === "correto" ? "ACERTO" : "ERRO",
      tempo_resposta_segundos: evaluationResult.tempo_resposta_segundos
    }, null, 2);

    navigator.clipboard.writeText(formattedJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="voice-bench" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* Configure Operation, Stimulus & Mic Record Controller */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/40 dark:shadow-none flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                Configurar Estímulo & Gravação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure o cálculo para o aluno falar e teste a resposta em tempo real.</p>
            </div>
            
            {/* Status indicator */}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${
              configStatus.geminiApiKeyConfigured 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100" 
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${configStatus.geminiApiKeyConfigured ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
              {configStatus.geminiApiKeyConfigured ? "Gemini Ativo" : "Modo Simulado"}
            </span>
          </div>

          {/* Operation parameters */}
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-100 dark:border-slate-800/60 mb-6">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Operação de Cálculo</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={num1}
                onChange={(e) => setNum1(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center font-bold text-slate-700 dark:text-slate-200 text-lg shadow-sm"
              />
              <select
                value={operationSymbol}
                onChange={(e) => setOperationSymbol(e.target.value)}
                className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center font-bold text-slate-700 dark:text-slate-200 text-lg shadow-sm"
              >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="x">x</option>
                <option value="÷">÷</option>
              </select>
              <input
                type="number"
                value={num2}
                onChange={(e) => setNum2(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center font-bold text-slate-700 dark:text-slate-200 text-lg shadow-sm"
              />
              <span className="text-xl font-bold text-slate-400">=</span>
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-lg px-4 py-1.5 font-extrabold text-lg flex items-center shadow-sm">
                {correctAnswer}
              </div>
              <span className="text-xs text-slate-400 italic font-medium ml-1">
                ({numberToPortuguese(correctAnswer)})
              </span>
            </div>
          </div>

          {/* Stimulus visual preview */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 mb-6 bg-slate-50/50 dark:bg-slate-950/20 text-center">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Estímulo Apresentado</span>
            <div className="text-5xl font-extrabold tracking-tight text-indigo-600 bg-indigo-50/70 border border-indigo-100 rounded-2xl px-8 py-3 dark:bg-indigo-950/10 dark:border-indigo-900/40 shadow-sm animate-pulse-slow">
              {num1} {operationSymbol} {num2}
            </div>
            <p className="text-xs text-slate-500 mt-2">Dica para o aluno: diga apenas o resultado e filtre "hmmm", "acho que é"</p>
          </div>

          {/* Real voice recorder action console */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/20 dark:bg-slate-900/10 mb-6">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Opção 1: Microfone em Tempo Real</h4>
            <div className="flex items-center gap-4">
              <button
                id="mic-record-btn"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-100" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 shadow-sm hover:-translate-y-0.5"
                }`}
              >
                {isRecording ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="flex-1">
                {isRecording ? (
                  <div>
                    <div className="text-xs font-bold text-rose-500 flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      GRAVANDO ÁUDIO DO ALUNO
                    </div>
                    <div className="flex gap-0.5 items-end h-5 mb-1 bg-red-50/10 p-0.5 rounded">
                      {waveHeights.map((h, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-rose-400 rounded-full transition-all duration-75"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Duração: {recordingSeconds.toFixed(1)}s</span>
                  </div>
                ) : audioBlob ? (
                  <div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Áudio Gravado com Sucesso! ({recordingSeconds.toFixed(2)}s)
                    </span>
                    <audio src={audioUrl || ""} controls className="h-7 w-full max-w-xs scale-90 -ml-4" />
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">Clique para começar o estímulo auditivo</span>
                    <span className="text-[11px] text-slate-400">Microfone nativo do dispositivo</span>
                  </div>
                )}
              </div>

              {audioBlob && !isRecording && (
                <button
                  id="process-audio-btn"
                  onClick={() => evaluateAudioResult(audioBlob)}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 disabled:bg-slate-300"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Analisar IA
                </button>
              )}
            </div>
          </div>

          {/* VISUAL TRANSCRIPTOR / REALTIME AUDIO DETECTION CARD */}
          {(isRecording || liveTranscript) && (
            <div className="border border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-slate-900/40 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider flex items-center gap-1.5 font-sans">
                  <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                  {isRecording ? "Escutando fala..." : "Transcrito pelo Navegador"}
                </span>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  Web Speech (PT-BR)
                </span>
              </div>
              <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100">
                🗣️ O que ouvi: <span className="text-indigo-600 dark:text-indigo-400">"{liveTranscript || "Fale agora..."}"</span>
              </div>
            </div>
          )}

          {/* Quick Pre-baked Student Profiles section */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-3">Opção 2: Perfis de Simulação de Alunos</h4>
            <div className="grid grid-cols-2 gap-3">
              {STUDENT_PROFILES.map((profile) => (
                <button
                  id={`profile-btn-${profile.id}`}
                  key={profile.id}
                  onClick={() => evaluateAudioResult(null, profile)}
                  disabled={loading || isRecording}
                  className="p-3 text-left border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all hover:-translate-y-0.5 flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      {profile.name}
                    </span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold dark:bg-indigo-950/40">
                      {profile.tempo}s
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2 leading-snug">{profile.description}</p>
                  <div className="flex items-center gap-1 text-[10px] italic font-semibold text-indigo-500">
                    <Volume2 className="w-3 h-3 text-indigo-400" />
                    "{profile.transcript}"
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Warning messages */}
        {apiError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-start gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Aviso Técnico</span>
              <p>{apiError}</p>
            </div>
          </div>
        )}
      </div>

      {/* JSON Output Viewer - Styled beautifully like an IDE */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-950 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between" style={{ minHeight: "440px" }}>
        
        {/* Header toolbar */}
        <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono ml-3 border-l border-slate-800 pl-3 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              lexium_output.json
            </span>
          </div>
          
          <button
            id="copy-json-btn"
            onClick={copyJsonToClipboard}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
            title="Copiar JSON estrito"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* JSON Code body */}
        <div className="p-5 flex-1 font-mono text-xs text-indigo-300 leading-relaxed overflow-y-auto max-h-[300px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-[11px] animate-pulse">Consultando Motor LExium Math...</p>
            </div>
          ) : evaluationResult ? (
            <pre className="text-[12px] text-indigo-200">
              {`{`}
  <span className="text-pink-400">"item_estimulo"</span>: <span className="text-emerald-400">"{evaluationResult.item_estimulo || evaluationResult.operacao}"</span>,
  <span className="text-pink-400">"gabarito_correto"</span>: <span className="text-emerald-400">"{evaluationResult.gabarito_correto || String(correctAnswer)}"</span>,
  <span className="text-pink-400">"transcrit_do_audio"</span>: <span className="text-emerald-400">"{evaluationResult.transcrit_do_audio || evaluationResult.resposta_aluno}"</span>,
  <span className="text-pink-400">"resultado"</span>: <span className="text-emerald-400">"{evaluationResult.resultado === "ACERTO" || evaluationResult.resultado === "correto" ? "ACERTO" : "ERRO"}"</span>,
  <span className="text-pink-400">"tempo_resposta_segundos"</span>: <span className="text-amber-400">{evaluationResult.tempo_resposta_segundos.toFixed(2)}</span>
{`}`}
            </pre>
          ) : (
            <span className="text-slate-500">// Configure o estímulo e fale ou selecione um perfil para rodar a avaliação.</span>
          )}
        </div>

        {/* Footer assessment diagnostics */}
        <div className="bg-slate-950 p-4 border-t border-slate-800/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Diagnóstico de Fluência</span>
            {evaluationResult?.simulated && (
              <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1 py-0.5 rounded border border-indigo-900 leading-none">Simulado</span>
            )}
          </div>
          
          {evaluationResult ? (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-300">Detecção Fonética:</span>
                <span className={`text-xs font-bold ${evaluationResult.resultado === "ACERTO" || evaluationResult.resultado === "correto" ? "text-emerald-500" : "text-rose-500"}`}>
                  {evaluationResult.resultado === "ACERTO" || evaluationResult.resultado === "correto" ? "ACERTO (Correto)" : "ERRO (Incorreto)"}
                </span>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/45">
                {evaluationResult.transcription || "Nenhuma transcrição correspondente disponível."}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Aguardando resultados do motor intelectual.</p>
          )}
        </div>

      </div>

    </div>
  );
}
