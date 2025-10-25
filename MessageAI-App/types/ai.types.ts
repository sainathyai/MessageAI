/**
 * AI Feature Types
 * TypeScript interfaces for AI-powered features
 */

export interface TranslationResult {
  translation: string;
  detectedLanguage: string;
  confidence?: number;
}

export interface CulturalContext {
  hasCulturalContext: boolean;
  explanation: string;
  literalMeaning?: string;
  culturalSignificance: string;
  appropriateResponse?: string;
  examples?: string[];
}

export interface SlangTerm {
  term: string;
  position: [number, number]; // [start, end]
  type: 'slang' | 'idiom' | 'colloquialism';
  explanation: string;
  literalMeaning?: string;
  actualMeaning: string;
  example: string;
  region: string;
  formality: 'casual' | 'informal' | 'neutral' | 'formal';
}

export type FormalityLevel = 'casual' | 'neutral' | 'formal' | 'very_formal';

export interface FormalityAdjustmentResult {
  original: string;
  adjusted: string;
  level: FormalityLevel;
  language: string;
}

export interface UserCommunicationStyle {
  avgSentenceLength: number; // words
  emojiFrequency: 'none' | 'rare' | 'moderate' | 'frequent';
  formalityLevel: 'casual' | 'neutral' | 'formal';
  commonPhrases: string[];
  responseSpeed: 'slow' | 'moderate' | 'fast';
  preferredGreeting?: string;
  preferredFarewell?: string;
}

export interface SmartReply {
  text: string;
  type: 'question' | 'agreement' | 'suggestion' | 'neutral';
  confidence: number;
}

export interface UserAIPreferences {
  preferredLanguage: string; // ISO code (e.g., "en", "es")
  autoTranslate: boolean;
  autoTranslateFrom: string[]; // ISO codes
  showCulturalHints: boolean;
  smartRepliesEnabled: boolean;
  learningEnabled: boolean; // Allow style learning
}

export interface CachedTranslation {
  id: string;
  messageId: string;
  sourceText: string;
  targetLanguage: string;
  translation: string;
  detectedLanguage: string;
  createdAt: Date;
}

export interface AIError {
  code: 'RATE_LIMIT' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_INPUT';
  message: string;
  retryable: boolean;
}

