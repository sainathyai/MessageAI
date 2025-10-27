/**
 * Transcription Service
 * Converts voice messages to text using OpenAI Whisper API
 */

import Constants from 'expo-constants';

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
}

/**
 * Transcribe audio file to text using OpenAI Whisper
 */
export async function transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
  try {
    console.log('🎤 Transcribing audio from:', audioUri.substring(audioUri.length - 50));

    // Get OpenAI API key from environment
    const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY 
      || process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Add audio file
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    } as any);
    
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Optional: auto-detect if omitted
    formData.append('response_format', 'json');

    console.log('📤 Uploading to Whisper API...');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Note: Don't set Content-Type, let fetch handle it for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Whisper API error:', response.status, errorText);
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Transcription completed:', result.text.substring(0, 50) + '...');

    return {
      text: result.text,
      language: result.language || 'en',
      confidence: 1.0,
    };

  } catch (error) {
    console.error('❌ Transcription error:', error);
    
    // Return user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key not configured. Please check your .env file.');
      } else if (error.message.includes('Network request failed')) {
        throw new Error('Network error. Please check your internet connection.');
      }
    }
    
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}

/**
 * Transcribe with AI analysis (includes cultural context and slang detection)
 */
export async function transcribeWithAnalysis(audioUri: string): Promise<{
  transcription: TranscriptionResult;
  hasCulturalContext?: boolean;
  hasSlang?: boolean;
}> {
  try {
    const transcription = await transcribeAudio(audioUri);
    
    // Quick analysis to determine if we should show AI buttons
    const text = transcription.text.toLowerCase();
    const hasCulturalContext = text.length > 20; // Basic heuristic
    const hasSlang = /\b(lol|brb|omg|btw|tbh|fr|cap|goat|fire|lit|dope)\b/i.test(text);

    return {
      transcription,
      hasCulturalContext,
      hasSlang,
    };
  } catch (error) {
    console.error('❌ Transcription with analysis error:', error);
    throw error;
  }
}

