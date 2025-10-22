/**
 * useAISettings Hook
 * Manages AI preferences with AsyncStorage persistence
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_SETTINGS_KEY = '@ai_settings';

export interface AISettings {
  preferredLanguage: string;
  autoTranslate: boolean;
  showCulturalHints: boolean;
  smartRepliesEnabled: boolean;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  preferredLanguage: 'en',
  autoTranslate: false,
  showCulturalHints: true,
  smartRepliesEnabled: true,
};

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(AI_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AISettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await AsyncStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
      setSettings(updated);
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    loading,
  };
}

