/**
 * AI Service
 * Core wrapper for OpenAI API with rate limiting and error handling
 */

import OpenAI from 'openai';
import { AIError } from '../types/ai.types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for React Native
});

// Configuration
export const AI_CONFIG = {
  model: 'gpt-4-turbo-preview',
  defaultTemperature: 0.3,
  maxTokens: 1000,
  timeout: 30000, // 30 seconds
};

// Simple rate limiter
class RateLimiter {
  private requests: number[] = [];
  private maxPerMinute = 20;

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => t > now - 60000);

    if (this.requests.length >= this.maxPerMinute) {
      throw this.createError('RATE_LIMIT', 'Too many requests. Please wait a moment.');
    }

    this.requests.push(now);
  }

  private createError(code: AIError['code'], message: string): AIError {
    return {
      code,
      message,
      retryable: code !== 'INVALID_INPUT',
    };
  }
}

const rateLimiter = new RateLimiter();

/**
 * Call OpenAI Chat Completions API with error handling
 */
export async function callOpenAI(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'text' | 'json';
  }
): Promise<string> {
  try {
    // Check rate limit
    await rateLimiter.checkLimit();

    console.log('🤖 Calling OpenAI API...');

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages,
      temperature: options?.temperature ?? AI_CONFIG.defaultTemperature,
      max_tokens: options?.maxTokens ?? AI_CONFIG.maxTokens,
      ...(options?.responseFormat === 'json' && {
        response_format: { type: 'json_object' }
      }),
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('✅ OpenAI response received');
    return content;
  } catch (error: any) {
    console.error('❌ OpenAI API error:', error);

    // Handle specific error types
    if (error.code === 'RATE_LIMIT') {
      throw error; // Already an AIError
    }

    if (error.status === 429) {
      throw {
        code: 'RATE_LIMIT',
        message: 'OpenAI rate limit exceeded. Please try again later.',
        retryable: true,
      } as AIError;
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw {
        code: 'NETWORK_ERROR',
        message: 'Request timed out. Please check your connection.',
        retryable: true,
      } as AIError;
    }

    if (error.status === 401) {
      throw {
        code: 'API_ERROR',
        message: 'Invalid API key. Please check configuration.',
        retryable: false,
      } as AIError;
    }

    // Generic error
    throw {
      code: 'API_ERROR',
      message: error.message || 'An error occurred with the AI service.',
      retryable: true,
    } as AIError;
  }
}

/**
 * Helper: Create system + user message pair
 */
export function createMessages(
  systemPrompt: string,
  userInput: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput },
  ];
}

/**
 * Helper: Parse JSON response safely
 */
export function parseJSONResponse<T>(response: string): T {
  try {
    // Try direct parse first
    return JSON.parse(response);
  } catch (error) {
    // OpenAI sometimes wraps JSON in markdown code blocks
    // Try to extract JSON from markdown
    const jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        // Continue to error handling
      }
    }

    // Try to find JSON array or object without markdown
    const arrayMatch = response.match(/(\[[\s\S]*\])/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[1]);
      } catch (e) {
        // Continue to error handling
      }
    }

    const objectMatch = response.match(/(\{[\s\S]*\})/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[1]);
      } catch (e) {
        // Continue to error handling
      }
    }

    console.error('Failed to parse JSON response. Response:', response.substring(0, 500));
    throw {
      code: 'API_ERROR',
      message: 'Invalid response format from AI service.',
      retryable: false,
    } as AIError;
  }
}

/**
 * Check if OpenAI API key is configured
 */
export function isAIConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
}

/**
 * Get AI service status
 */
export function getAIStatus(): {
  configured: boolean;
  model: string;
  rateLimitRemaining?: number;
} {
  return {
    configured: isAIConfigured(),
    model: AI_CONFIG.model,
  };
}

