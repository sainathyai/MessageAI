/**
 * Slang and Idiom Detection Service
 * Detects and explains slang terms, idioms, and colloquialisms using OpenAI
 */

import { callOpenAI } from './ai.service';
import { SlangTerm, AIError } from '../types/ai.types';

const SLANG_MODEL = 'gpt-4o-mini';

/**
 * Detect and explain slang terms and idioms in a message
 */
export const detectSlangAndIdioms = async (
  text: string,
  detectedLanguage: string = 'en'
): Promise<SlangTerm[]> => {
  if (!text.trim()) {
    throw {
      code: 'INVALID_INPUT',
      message: 'Text cannot be empty for slang detection.',
      retryable: false,
    } as AIError;
  }

  const prompt = `Analyze the following text and identify any slang terms, idioms, or colloquialisms that might be difficult for a non-native speaker to understand.

For each term found, provide:
- term: the exact slang/idiom phrase as it appears
- type: one of "slang", "idiom", or "colloquialism"
- explanation: a brief explanation of what it means
- literalMeaning: what the words literally mean (optional, especially useful for idioms)
- actualMeaning: what the phrase actually means in context
- example: a different example sentence using this term
- region: where this is commonly used (e.g., "Global", "American English", "British English", "Australian English")
- formality: the formality level ("casual", "informal", "neutral", or "formal")

If NO slang, idioms, or colloquialisms are found, return an empty array.

Return a JSON object with a "terms" array.

Language: ${detectedLanguage}
Text: "${text}"`;

  try {
    const result = await callOpenAI<{ terms: SlangTerm[] }>(
      prompt,
      SLANG_MODEL,
      1500,
      0.5,
      { type: 'json_object' }
    );

    return result.terms || [];
  } catch (error) {
    console.error('Error detecting slang and idioms:', error);
    throw error;
  }
};

/**
 * Get a quick explanation for a specific slang term or idiom
 */
export const explainSlangTerm = async (
  term: string,
  context?: string
): Promise<string> => {
  if (!term.trim()) {
    throw {
      code: 'INVALID_INPUT',
      message: 'Term cannot be empty.',
      retryable: false,
    } as AIError;
  }

  const contextPrompt = context ? `\nContext: "${context}"` : '';
  const prompt = `Provide a brief, clear explanation of the slang term or idiom: "${term}".${contextPrompt}

Return a plain text explanation in 1-2 sentences.`;

  try {
    const explanation = await callOpenAI<string>(
      prompt,
      SLANG_MODEL,
      200,
      0.3
    );

    return explanation;
  } catch (error) {
    console.error('Error explaining slang term:', error);
    throw error;
  }
};

