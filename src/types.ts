/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  LOBBY = "LOBBY",
  PLAYING = "PLAYING",
  EVALUATING = "EVALUATING",
  RESULTS = "RESULTS"
}

export enum Difficulty {
  BASICO = "Básico",
  INTERMEDIARIO = "Intermediário",
  AVANCADO = "Avançado"
}

export enum OperationType {
  SOMA = "+",
  SUBTRACAO = "-",
  MULTIPLICACAO = "x",
  DIVISAO = "÷"
}

export interface Settings {
  difficulty: Difficulty;
  operationTypes: OperationType[];
  questionCount: number;
  maxTimeLimit: number; // in seconds
}

export interface MathQuestion {
  id: string;
  num1: number;
  num2: number;
  operation: OperationType;
  correctAnswer: number;
  stimulusText: string;
}

export interface EvaluationResult {
  item_estimulo: string;
  gabarito_correto: string;
  transcrit_do_audio: string;
  transcrito_do_audio?: string;
  resultado: "ACERTO" | "ERRO" | "correto" | "incorreto";
  tempo_resposta_segundos: number;
  simulated?: boolean;
  transcription?: string;
  confidenceScore?: number;
  
  // Compatibilidade Legada
  operacao?: string;
  resposta_aluno?: string;
}

export interface QuestionAttempt {
  question: MathQuestion;
  attemptIndex: number;
  timestamp: string;
  elapsedSeconds: number;
  studentAnswer: string;
  isCorrect: boolean;
  audioUrl?: string; // local recorded audio URL context
  evaluation?: EvaluationResult;
}

export interface SessionResult {
  id: string;
  date: string;
  studentName: string;
  settings: Settings;
  attempts: QuestionAttempt[];
  score: {
    correct: number;
    total: number;
    pct: number;
  };
  averageResponseTime: number;
  levelAssessment: string; // "Alta Fluência", "Fluência Moderada", "Em Desenvolvimento", "Iniciante"
}
