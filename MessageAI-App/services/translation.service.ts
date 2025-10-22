/**
 * Translation Service
 * Handles message translation using OpenAI GPT-4 Turbo
 */

import { callOpenAI, createMessages, parseJSONResponse } from './ai.service';
import { TranslationResult, CachedTranslation } from '../types/ai.types';
import { saveTranslationToCache, getTranslationFromCache } from './translation-cache.service';

/**
 * Translate a message to target language
 */
export async function translateMessage(
  text: string,
  targetLanguage: string,
  messageId?: string
): Promise<TranslationResult> {
  try {
    // Check cache first
    if (messageId) {
      const cached = await getTranslationFromCache(messageId, targetLanguage);
      if (cached) {
        console.log('✅ Translation found in cache');
        return {
          translation: cached.translation,
          detectedLanguage: cached.detectedLanguage,
        };
      }
    }

    console.log(`🌐 Translating to ${targetLanguage}...`);

    const systemPrompt = `You are a professional translator. Translate the given message to ${targetLanguage}.
Also detect the source language.
Return ONLY valid JSON in this exact format:
{
  "translation": "translated text here",
  "detectedLanguage": "ISO language code (e.g., es, fr, ja)",
  "confidence": 0.95
}`;

    const response = await callOpenAI(
      createMessages(systemPrompt, text),
      { temperature: 0.3, responseFormat: 'json' }
    );

    const result = parseJSONResponse<TranslationResult>(response);

    // Cache the translation
    if (messageId) {
      await saveTranslationToCache({
        messageId,
        sourceText: text,
        targetLanguage,
        translation: result.translation,
        detectedLanguage: result.detectedLanguage,
      });
    }

    return result;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Detect language of text
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const systemPrompt = `Detect the language of the given text. Return ONLY the ISO 639-1 language code (e.g., "en", "es", "fr", "ja", "zh"). No explanation, just the code.`;

    const response = await callOpenAI(
      createMessages(systemPrompt, text),
      { temperature: 0, maxTokens: 10 }
    );

    return response.trim().toLowerCase();
  } catch (error) {
    console.error('Language detection error:', error);
    return 'unknown';
  }
}

/**
 * Batch translate multiple messages
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: string
): Promise<TranslationResult[]> {
  // For now, translate sequentially
  // TODO: Implement true batch API call for better performance
  const results: TranslationResult[] = [];

  for (const text of texts) {
    try {
      const result = await translateMessage(text, targetLanguage);
      results.push(result);
    } catch (error) {
      console.error('Batch translation error:', error);
      // Continue with other translations
      results.push({
        translation: text, // Fallback to original
        detectedLanguage: 'unknown',
      });
    }
  }

  return results;
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  ];
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const lang = getSupportedLanguages().find(l => l.code === code);
  return lang?.name || code.toUpperCase();
}

