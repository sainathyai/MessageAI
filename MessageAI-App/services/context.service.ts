/**
 * Context Service
 * Handles cultural context detection, slang/idiom explanations, and formality adjustments
 */

import { callOpenAI, createMessages, parseJSONResponse } from './ai.service';
import { CulturalContext, SlangTerm, FormalityLevel, FormalityAdjustmentResult } from '../types/ai.types';

/**
 * Analyze message for cultural context
 */
export async function analyzeCulturalContext(
  text: string,
  sourceLanguage?: string
): Promise<CulturalContext> {
  try {
    console.log('🌍 Analyzing cultural context...');

    const systemPrompt = `You are a cultural communication expert. Analyze the given message for cultural context, idioms, or references that may need explanation.

Return ONLY valid JSON in this exact format:
{
  "hasCulturalContext": true/false,
  "explanation": "Brief explanation of cultural context",
  "literalMeaning": "What it literally says (optional)",
  "culturalSignificance": "What it means culturally",
  "appropriateResponse": "How to respond appropriately (optional)",
  "examples": ["example 1", "example 2"] (optional)
}

If there's no cultural context to explain, set hasCulturalContext to false and provide a brief "No cultural context detected" message.`;

    const userInput = sourceLanguage 
      ? `Language: ${sourceLanguage}\nMessage: ${text}`
      : `Message: ${text}`;

    const response = await callOpenAI(
      createMessages(systemPrompt, userInput),
      { temperature: 0.4, responseFormat: 'json' }
    );

    return parseJSONResponse<CulturalContext>(response);
  } catch (error) {
    console.error('Cultural context analysis error:', error);
    throw error;
  }
}

/**
 * Detect and explain slang/idioms in message
 */
export async function detectSlangAndIdioms(
  text: string,
  sourceLanguage?: string
): Promise<SlangTerm[]> {
  try {
    console.log('🗣️ Detecting slang and idioms...');

    const systemPrompt = `You are a linguistics expert. Analyze the given message and identify any slang terms, idioms, or colloquialisms.

For each term found, return its position in the text, explanation, and context.

Return ONLY valid JSON in this exact format (array of terms):
[
  {
    "term": "the actual slang/idiom phrase",
    "position": [startIndex, endIndex],
    "type": "slang" | "idiom" | "colloquialism",
    "explanation": "What this term means",
    "literalMeaning": "What it literally means (optional)",
    "actualMeaning": "What the person is actually saying",
    "example": "Example sentence using this term",
    "region": "Where this is commonly used (e.g., US, UK, Australia)",
    "formality": "casual" | "informal" | "neutral" | "formal"
  }
]

If no slang or idioms are found, return an empty array: []`;

    const userInput = sourceLanguage 
      ? `Language: ${sourceLanguage}\nMessage: ${text}`
      : `Message: ${text}`;

    const response = await callOpenAI(
      createMessages(systemPrompt, userInput),
      { temperature: 0.3, responseFormat: 'json', maxTokens: 1500 }
    );

    return parseJSONResponse<SlangTerm[]>(response);
  } catch (error) {
    console.error('Slang detection error:', error);
    throw error;
  }
}

/**
 * Adjust message formality level
 */
export async function adjustFormality(
  text: string,
  targetLevel: FormalityLevel,
  targetLanguage?: string
): Promise<FormalityAdjustmentResult> {
  try {
    console.log(`📝 Adjusting formality to ${targetLevel}...`);

    const formalityDescriptions = {
      casual: 'very casual and friendly, like texting a close friend',
      neutral: 'neutral and balanced, appropriate for most situations',
      formal: 'formal and polite, suitable for professional contexts',
      very_formal: 'very formal and respectful, for important business or official communications',
    };

    const systemPrompt = `You are a communication expert. Rewrite the given message to match the requested formality level: ${targetLevel} (${formalityDescriptions[targetLevel]}).

Maintain the core meaning but adjust the tone, vocabulary, and structure.

Return ONLY valid JSON in this exact format:
{
  "original": "original message text",
  "adjusted": "rewritten message at the requested formality level",
  "level": "${targetLevel}",
  "language": "detected language ISO code"
}`;

    const userInput = targetLanguage 
      ? `Target language: ${targetLanguage}\nMessage: ${text}`
      : `Message: ${text}`;

    const response = await callOpenAI(
      createMessages(systemPrompt, userInput),
      { temperature: 0.5, responseFormat: 'json' }
    );

    return parseJSONResponse<FormalityAdjustmentResult>(response);
  } catch (error) {
    console.error('Formality adjustment error:', error);
    throw error;
  }
}

/**
 * Detect current formality level of text
 */
export async function detectFormality(text: string): Promise<FormalityLevel> {
  try {
    const systemPrompt = `Analyze the formality level of the given message. Return ONLY one word: "casual", "neutral", "formal", or "very_formal". No explanation.`;

    const response = await callOpenAI(
      createMessages(systemPrompt, text),
      { temperature: 0, maxTokens: 10 }
    );

    const level = response.trim().toLowerCase().replace(/_/g, '_');
    
    if (['casual', 'neutral', 'formal', 'very_formal'].includes(level)) {
      return level as FormalityLevel;
    }

    return 'neutral'; // Default
  } catch (error) {
    console.error('Formality detection error:', error);
    return 'neutral';
  }
}

