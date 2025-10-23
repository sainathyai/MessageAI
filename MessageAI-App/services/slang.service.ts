/**
 * Slang and Idiom Detection Service
 * Detects and explains slang terms, idioms, and colloquialisms using OpenAI
 */

import { callOpenAI, createMessages, parseJSONResponse } from './ai.service';
import { SlangTerm, AIError } from '../types/ai.types';

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

  const systemPrompt = `You are a linguistic expert specializing in slang, idioms, and colloquialisms. Analyze text and explain terms that might be difficult for non-native speakers.`;

  const userPrompt = `Analyze the following text and identify any slang terms, idioms, or colloquialisms that might be difficult for a non-native speaker to understand.

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

Return ONLY valid JSON in this format:
{
  "terms": [
    {
      "term": "example",
      "type": "slang",
      "explanation": "...",
      "literalMeaning": "...",
      "actualMeaning": "...",
      "example": "...",
      "region": "...",
      "formality": "casual"
    }
  ]
}

Language: ${detectedLanguage}
Text: "${text}"`;

  try {
    const messages = createMessages(systemPrompt, userPrompt);
    const response = await callOpenAI(messages, {
      temperature: 0.5,
      maxTokens: 1500,
      responseFormat: 'json',
    });

    const result = parseJSONResponse<{ terms: SlangTerm[] }>(response);
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

  const systemPrompt = `You are a linguistic expert. Provide brief, clear explanations of slang terms and idioms.`;
  const contextPrompt = context ? `\nContext: "${context}"` : '';
  const userPrompt = `Provide a brief, clear explanation of the slang term or idiom: "${term}".${contextPrompt}

Return a plain text explanation in 1-2 sentences.`;

  try {
    const messages = createMessages(systemPrompt, userPrompt);
    const explanation = await callOpenAI(messages, {
      temperature: 0.3,
      maxTokens: 200,
    });

    return explanation;
  } catch (error) {
    console.error('Error explaining slang term:', error);
    throw error;
  }
};

