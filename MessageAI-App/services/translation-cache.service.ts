/**
 * Translation Cache Service
 * Caches translations in SQLite for instant re-viewing and offline access
 */

import { CachedTranslation } from '../types/ai.types';
import { db } from './storage.service';
import { Platform } from 'react-native';

/**
 * Initialize translations table
 */
export function initTranslationsTable(): void {
  if (Platform.OS === 'web') {
    console.log('⚠️ Translation cache not available on web');
    return;
  }

  try {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS translations (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        source_text TEXT NOT NULL,
        target_language TEXT NOT NULL,
        translation TEXT NOT NULL,
        detected_language TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_translations_message 
      ON translations(message_id, target_language);
    `);

    console.log('✅ Translations table initialized');
  } catch (error) {
    console.error('Error initializing translations table:', error);
  }
}

/**
 * Save translation to cache
 */
export async function saveTranslationToCache(data: {
  messageId: string;
  sourceText: string;
  targetLanguage: string;
  translation: string;
  detectedLanguage: string;
}): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const id = `${data.messageId}-${data.targetLanguage}`;
    const now = Date.now();

    await db.runAsync(
      `INSERT OR REPLACE INTO translations 
       (id, message_id, source_text, target_language, translation, detected_language, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.messageId,
        data.sourceText,
        data.targetLanguage,
        data.translation,
        data.detectedLanguage,
        now,
      ]
    );

    console.log('💾 Translation cached');
  } catch (error) {
    console.error('Error saving translation to cache:', error);
  }
}

/**
 * Get translation from cache
 */
export async function getTranslationFromCache(
  messageId: string,
  targetLanguage: string
): Promise<CachedTranslation | null> {
  if (Platform.OS === 'web') return null;

  try {
    const result = await db.getFirstAsync<any>(
      `SELECT * FROM translations 
       WHERE message_id = ? AND target_language = ?`,
      [messageId, targetLanguage]
    );

    if (!result) return null;

    return {
      id: result.id,
      messageId: result.message_id,
      sourceText: result.source_text,
      targetLanguage: result.target_language,
      translation: result.translation,
      detectedLanguage: result.detected_language,
      createdAt: new Date(result.created_at),
    };
  } catch (error) {
    console.error('Error getting translation from cache:', error);
    return null;
  }
}

/**
 * Get all translations for a message
 */
export async function getAllTranslationsForMessage(
  messageId: string
): Promise<CachedTranslation[]> {
  if (Platform.OS === 'web') return [];

  try {
    const results = await db.getAllAsync<any>(
      `SELECT * FROM translations 
       WHERE message_id = ?
       ORDER BY created_at DESC`,
      [messageId]
    );

    return results.map(r => ({
      id: r.id,
      messageId: r.message_id,
      sourceText: r.source_text,
      targetLanguage: r.target_language,
      translation: r.translation,
      detectedLanguage: r.detected_language,
      createdAt: new Date(r.created_at),
    }));
  } catch (error) {
    console.error('Error getting translations for message:', error);
    return [];
  }
}

/**
 * Clear old translations (older than 30 days)
 */
export async function clearOldTranslations(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    await db.runAsync(
      `DELETE FROM translations WHERE created_at < ?`,
      [thirtyDaysAgo]
    );

    console.log('🗑️ Old translations cleared');
  } catch (error) {
    console.error('Error clearing old translations:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getTranslationCacheStats(): Promise<{
  total: number;
  languages: Record<string, number>;
}> {
  if (Platform.OS === 'web') {
    return { total: 0, languages: {} };
  }

  try {
    const totalResult = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM translations`
    );

    const languagesResult = await db.getAllAsync<{ target_language: string; count: number }>(
      `SELECT target_language, COUNT(*) as count 
       FROM translations 
       GROUP BY target_language`
    );

    const languages: Record<string, number> = {};
    languagesResult.forEach(r => {
      languages[r.target_language] = r.count;
    });

    return {
      total: totalResult?.count || 0,
      languages,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { total: 0, languages: {} };
  }
}

